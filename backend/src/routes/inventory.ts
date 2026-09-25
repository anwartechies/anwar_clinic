import { Router, Response } from "express";
import { Op } from "sequelize";
import { InventoryItem, InventoryLog, User, sequelize } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

/**
 * GET /inventory/overview
 * Overview dashboard metrics: KPIs, expiring soon, recent added stocks, recent logs
 */
router.get("/overview", authorize("inventory:read"), async (_req: AuthRequest, res: Response) => {
  try {
    const items = await InventoryItem.findAll({
      order: [["createdAt", "DESC"]],
    });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sixtyDaysLater = new Date(now.getTime() + 60 * 86400000).toISOString().split("T")[0];

    let totalItems = items.length;
    let totalStockUnits = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalBroken = 0;
    let totalStolen = 0;
    let totalLossValue = 0;

    const categoryBreakdown: Record<string, { count: number; stock: number; broken: number; stolen: number }> = {};

    for (const item of items) {
      const qty = item.stockQuantity || 0;
      const cost = Number(item.costPrice) || 0;
      const brokenCount = item.broken || 0;
      const stolenCount = item.stolen || 0;

      totalStockUnits += qty;
      totalValue += qty * cost;
      totalBroken += brokenCount;
      totalStolen += stolenCount;
      totalLossValue += (brokenCount + stolenCount) * cost;

      if (qty === 0) {
        outOfStockCount++;
      } else if (qty <= item.minStockLevel) {
        lowStockCount++;
      }

      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { count: 0, stock: 0, broken: 0, stolen: 0 };
      }
      categoryBreakdown[item.category].count++;
      categoryBreakdown[item.category].stock += qty;
      categoryBreakdown[item.category].broken += brokenCount;
      categoryBreakdown[item.category].stolen += stolenCount;
    }

    // Expiring soon items (expiryDate <= sixtyDaysLater and expiryDate >= todayStr)
    const expiringSoonItems = items
      .filter((i) => i.expiryDate && i.expiryDate <= sixtyDaysLater && i.expiryDate >= todayStr && i.stockQuantity > 0)
      .sort((a, b) => (a.expiryDate! > b.expiryDate! ? 1 : -1))
      .slice(0, 8);

    // Expired items
    const expiredCount = items.filter((i) => i.expiryDate && i.expiryDate < todayStr && i.stockQuantity > 0).length;

    // Recently added stocks
    const recentStocks = items.slice(0, 6);

    // Recent activity logs
    const recentLogs = await InventoryLog.findAll({
      limit: 15,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: InventoryItem,
          as: "item",
          attributes: ["id", "name", "sku", "category", "unit"],
        },
        {
          model: User,
          as: "performedBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.json({
      kpis: {
        totalItems,
        totalStockUnits,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount,
        outOfStockCount,
        expiringSoonCount: expiringSoonItems.length,
        expiredCount,
        totalBroken,
        totalStolen,
        totalLossCount: totalBroken + totalStolen,
        totalLossValue: Math.round(totalLossValue * 100) / 100,
      },
      categoryBreakdown,
      expiringSoonItems,
      recentStocks,
      recentLogs,
    });
  } catch (err: any) {
    console.error("Error fetching inventory overview:", err);
    res.status(500).json({ message: err.message || "Failed to load inventory overview" });
  }
});

/**
 * GET /inventory
 * List all items with search and filters
 */
router.get("/", authorize("inventory:read"), async (req: AuthRequest, res: Response) => {
  try {

    const { search, category, status, sortBy = "createdAt", sortOrder = "DESC" } = req.query as {
      search?: string;
      category?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: string;
    };

    const where: any = {};

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: q } },
        { sku: { [Op.like]: q } },
        { batchNumber: { [Op.like]: q } },
        { storageLocation: { [Op.like]: q } },
        { supplierName: { [Op.like]: q } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const sixtyDaysLater = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

    if (status === "out_of_stock") {
      where.stockQuantity = 0;
    } else if (status === "low_stock") {
      where[Op.and] = [
        { stockQuantity: { [Op.gt]: 0 } },
        sequelize.where(sequelize.col("stockQuantity"), "<=", sequelize.col("minStockLevel")),
      ];
    } else if (status === "in_stock") {
      where[Op.and] = [
        sequelize.where(sequelize.col("stockQuantity"), ">", sequelize.col("minStockLevel")),
      ];
    } else if (status === "expiring_soon") {
      where.expiryDate = { [Op.between]: [todayStr, sixtyDaysLater] };
      where.stockQuantity = { [Op.gt]: 0 };
    } else if (status === "has_losses") {
      where[Op.or] = [{ broken: { [Op.gt]: 0 } }, { stolen: { [Op.gt]: 0 } }];
    }

    const validSortCols = ["name", "sku", "stockQuantity", "broken", "stolen", "costPrice", "expiryDate", "createdAt"];
    const col = validSortCols.includes(sortBy) ? sortBy : "createdAt";
    const dir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const items = await InventoryItem.findAll({
      where,
      order: [[col, dir]],
    });

    res.json(items);
  } catch (err: any) {
    console.error("Error listing inventory items:", err);
    res.status(500).json({ message: err.message || "Failed to load inventory items" });
  }
});

/**
 * GET /inventory/:id
 * Single item with audit logs
 */
router.get("/:id", authorize("inventory:read"), async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [
        {
          model: InventoryLog,
          as: "logs",
          include: [
            {
              model: User,
              as: "performedBy",
              attributes: ["id", "fullName", "email"],
            },
          ],
        },
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
      order: [[{ model: InventoryLog, as: "logs" }, "createdAt", "DESC"]],
    });

    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.json(item);
  } catch (err: any) {
    console.error("Error getting inventory item:", err);
    res.status(500).json({ message: err.message || "Failed to get inventory item" });
  }
});

/**
 * POST /inventory
 * Add a new stock item
 */
router.post("/", authorize("inventory:write"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      sku,
      name,
      category,
      unit = "pcs",
      stockQuantity = 0,
      minStockLevel = 5,
      broken = 0,
      stolen = 0,
      batchNumber,
      expiryDate,
      costPrice = 0,
      sellingPrice,
      storageLocation,
      supplierName,
      supplierContact,
      isSterile = true,
      notes,
    } = req.body;

    if (!sku || !name || !category) {
      return res.status(400).json({ message: "SKU, item name, and category are required." });
    }

    const existing = await InventoryItem.findOne({ where: { sku: sku.trim() } });
    if (existing) {
      return res.status(409).json({ message: `An item with SKU "${sku}" already exists.` });
    }

    const item = await InventoryItem.create({
      sku: sku.trim(),
      name: name.trim(),
      category,
      unit: unit.trim(),
      stockQuantity: Math.max(0, parseInt(stockQuantity, 10) || 0),
      minStockLevel: Math.max(0, parseInt(minStockLevel, 10) || 0),
      broken: Math.max(0, parseInt(broken, 10) || 0),
      stolen: Math.max(0, parseInt(stolen, 10) || 0),
      batchNumber: batchNumber?.trim() || null,
      expiryDate: expiryDate || null,
      costPrice: Math.max(0, parseFloat(costPrice) || 0),
      sellingPrice: sellingPrice !== undefined && sellingPrice !== "" && sellingPrice !== null ? Math.max(0, parseFloat(sellingPrice)) : null,
      storageLocation: storageLocation?.trim() || null,
      supplierName: supplierName?.trim() || null,
      supplierContact: supplierContact?.trim() || null,
      isSterile: Boolean(isSterile),
      notes: notes?.trim() || null,
      createdById: req.user?.userId || null,
    });

    // Record initial intake log
    await InventoryLog.create({
      inventoryItemId: item.id,
      action: "restock",
      quantity: item.stockQuantity,
      previousStock: 0,
      newStock: item.stockQuantity,
      reason: "Initial item registration & stock intake",
      performedById: req.user?.userId || null,
    });

    if (item.broken > 0) {
      await InventoryLog.create({
        inventoryItemId: item.id,
        action: "broken",
        quantity: item.broken,
        previousStock: item.stockQuantity + item.broken,
        newStock: item.stockQuantity,
        reason: "Initial broken count registered",
        performedById: req.user?.userId || null,
      });
    }

    if (item.stolen > 0) {
      await InventoryLog.create({
        inventoryItemId: item.id,
        action: "stolen",
        quantity: item.stolen,
        previousStock: item.stockQuantity + item.stolen,
        newStock: item.stockQuantity,
        reason: "Initial stolen/missing count registered",
        performedById: req.user?.userId || null,
      });
    }

    res.status(201).json(item);
  } catch (err: any) {
    console.error("Error creating inventory item:", err);
    res.status(500).json({ message: err.message || "Failed to create inventory item" });
  }
});

/**
 * PUT /inventory/:id
 * Update item details
 */
router.put("/:id", authorize("inventory:write"), async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const {
      sku,
      name,
      category,
      unit,
      minStockLevel,
      batchNumber,
      expiryDate,
      costPrice,
      sellingPrice,
      storageLocation,
      supplierName,
      supplierContact,
      isSterile,
      notes,
    } = req.body;

    if (sku && sku.trim() !== item.sku) {
      const existing = await InventoryItem.findOne({ where: { sku: sku.trim() } });
      if (existing) {
        return res.status(409).json({ message: `SKU "${sku}" is already assigned to another item.` });
      }
      item.sku = sku.trim();
    }

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (unit) item.unit = unit.trim();
    if (minStockLevel !== undefined) item.minStockLevel = Math.max(0, parseInt(minStockLevel, 10) || 0);
    if (batchNumber !== undefined) item.batchNumber = batchNumber?.trim() || null;
    if (expiryDate !== undefined) item.expiryDate = expiryDate || null;
    if (costPrice !== undefined) item.costPrice = Math.max(0, parseFloat(costPrice) || 0);
    if (sellingPrice !== undefined) {
      item.sellingPrice = sellingPrice !== "" && sellingPrice !== null ? Math.max(0, parseFloat(sellingPrice)) : null;
    }
    if (storageLocation !== undefined) item.storageLocation = storageLocation?.trim() || null;
    if (supplierName !== undefined) item.supplierName = supplierName?.trim() || null;
    if (supplierContact !== undefined) item.supplierContact = supplierContact?.trim() || null;
    if (isSterile !== undefined) item.isSterile = Boolean(isSterile);
    if (notes !== undefined) item.notes = notes?.trim() || null;

    await item.save();

    res.json(item);
  } catch (err: any) {
    console.error("Error updating inventory item:", err);
    res.status(500).json({ message: err.message || "Failed to update inventory item" });
  }
});

/**
 * PATCH /inventory/:id/adjust
 * Stock adjustment and loss tracking (restock, broken, stolen, procedure used, manual audit)
 */
router.patch("/:id/adjust", authorize("inventory:write"), async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const { action, quantity, reason } = req.body as {
      action: "restock" | "broken" | "stolen" | "used_procedure" | "expired" | "adjustment" | "sold";
      quantity: number;
      reason?: string;
    };

    if (!action) {
      return res.status(400).json({ message: "Action is required." });
    }

    const qty = parseInt(String(quantity), 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: "Quantity must be a positive integer." });
    }

    const prevStock = item.stockQuantity;
    let newStock = prevStock;

    if (action === "restock") {
      newStock = prevStock + qty;
      item.stockQuantity = newStock;
    } else if (action === "sold") {
      if (prevStock < qty) {
        return res.status(400).json({
          message: `Insufficient stock. Cannot sell ${qty} ${item.unit}. Only ${prevStock} ${item.unit} available in stock.`,
        });
      }
      newStock = Math.max(0, prevStock - qty);
      item.stockQuantity = newStock;
    } else if (action === "broken") {
      // Increments broken counter and deducts from active usable stock
      item.broken = (item.broken || 0) + qty;
      newStock = Math.max(0, prevStock - qty);
      item.stockQuantity = newStock;
    } else if (action === "stolen") {
      // Increments stolen counter and deducts from active usable stock
      item.stolen = (item.stolen || 0) + qty;
      newStock = Math.max(0, prevStock - qty);
      item.stockQuantity = newStock;
    } else if (action === "used_procedure") {
      newStock = Math.max(0, prevStock - qty);
      item.stockQuantity = newStock;
    } else if (action === "expired") {
      newStock = Math.max(0, prevStock - qty);
      item.stockQuantity = newStock;
    } else if (action === "adjustment") {
      // Explicit manual count override
      newStock = qty;
      item.stockQuantity = newStock;
    }

    await item.save();

    const log = await InventoryLog.create({
      inventoryItemId: item.id,
      action,
      quantity: qty,
      previousStock: prevStock,
      newStock,
      reason: reason?.trim() || `Manual adjustment: ${action} of ${qty} ${item.unit}`,
      performedById: req.user?.userId || null,
    });

    res.json({ item, log });
  } catch (err: any) {
    console.error("Error adjusting stock:", err);
    res.status(500).json({ message: err.message || "Failed to adjust stock" });
  }
});

/**
 * POST /inventory/:id/sell
 * Register stock sale, deduct inventory, and log activity with performer details
 */
router.post("/:id/sell", authorize("inventory:write"), async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const { quantity, unitPrice, customerName, invoiceNumber, notes } = req.body;

    const qty = parseInt(String(quantity), 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity sold must be at least 1." });
    }

    if (item.stockQuantity < qty) {
      return res.status(400).json({
        message: `Insufficient stock! Cannot sell ${qty} ${item.unit}. Only ${item.stockQuantity} ${item.unit} currently available.`,
      });
    }

    const prevStock = item.stockQuantity;
    const newStock = prevStock - qty;
    item.stockQuantity = newStock;
    await item.save();

    // Construct informative audit trail reason
    const priceStr = unitPrice !== undefined && unitPrice !== "" && unitPrice !== null
      ? ` @ ₹${Number(unitPrice).toFixed(2)}/${item.unit}`
      : item.sellingPrice
      ? ` @ ₹${Number(item.sellingPrice).toFixed(2)}/${item.unit}`
      : "";
    const customerStr = customerName && String(customerName).trim() ? ` to ${String(customerName).trim()}` : "";
    const invoiceStr = invoiceNumber && String(invoiceNumber).trim() ? ` (Invoice #${String(invoiceNumber).trim()})` : "";
    const noteStr = notes && String(notes).trim() ? ` — ${String(notes).trim()}` : "";
    const fullReason = `Stock Sold: ${qty} ${item.unit}${priceStr}${customerStr}${invoiceStr}${noteStr}`;

    const log = await InventoryLog.create({
      inventoryItemId: item.id,
      action: "sold",
      quantity: qty,
      previousStock: prevStock,
      newStock,
      reason: fullReason,
      performedById: req.user?.userId || null,
    });

    const populatedLog = await InventoryLog.findByPk(log.id, {
      include: [
        {
          model: InventoryItem,
          as: "item",
          attributes: ["id", "name", "sku", "category", "unit"],
        },
        {
          model: User,
          as: "performedBy",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.json({
      message: `Successfully registered sale of ${qty} ${item.unit} of ${item.name}`,
      item,
      log: populatedLog,
    });
  } catch (err: any) {
    console.error("Error registering stock sale:", err);
    res.status(500).json({ message: err.message || "Failed to register stock sale" });
  }
});

/**
 * DELETE /inventory/:id
 * Remove item
 */
router.delete("/:id", authorize("inventory:write"), async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await item.destroy();
    res.json({ message: `Item "${item.name}" deleted successfully.` });
  } catch (err: any) {
    console.error("Error deleting inventory item:", err);
    res.status(500).json({ message: err.message || "Failed to delete inventory item" });
  }
});

export default router;
