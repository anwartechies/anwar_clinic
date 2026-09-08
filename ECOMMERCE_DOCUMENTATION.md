# Ecommerce Module Implementation Documentation

**Project:** Anwar Clinic  
**Module:** Dynamic Ecommerce Store & Product Management  
**Date:** September 2026  
**Status:** Completed & Verified  

---

## Table of Contents
1. [Overview](#1-overview)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Database Schema](#3-database-schema)
4. [Backend Implementation](#4-backend-implementation)
5. [Admin Panel Implementation](#5-admin-panel-implementation)
6. [Ecommerce Store Implementation](#6-ecommerce-store-implementation)
7. [API Reference](#7-api-reference)
8. [Kit vs. Single Product Rules](#8-kit-vs-single-product-rules)
9. [Verification & Test Results](#9-verification--test-results)

---

## 1. Overview

The **Ecommerce Module** connects the Anwar Clinic Ecommerce store (`ecommerce/`, running on port 3300) with the Express/PostgreSQL backend (`backend/`, running on port 5050) and provides a full management interface in the Admin Panel (`admin-panel/`, running on port 3100).

Product inputs, media handling, and page sections follow the clean design established in the **Services** module:
- **Zero Dummy Data:** The ecommerce frontend displays strictly real products and real category counts fetched from the PostgreSQL database (`http://localhost:5050/public/products`).
- **Image handling:** Direct image link (URL) inputs with an attached Media Library picker and image preview thumbnail.
- **Section customization:** Modular schema-driven sections stored in PostgreSQL JSONB, with eye-icon visibility toggles.
- **Kit-only logic:** "What's Inside Your Kit" is dynamically rendered for kit bundles and automatically omitted for single products.

---

## 2. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                            Ecommerce Store (:3300)                                |
|  - / (Products directory, live search, category & concern counters, sorting)      |
|  - /product/[slug] & /products/[slug] (Product detail, FAQs, gallery, reviews)    |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | GET /public/products
                                          | GET /public/products/:slug
                                          v
+-----------------------------------------------------------------------------------+
|                                 Express Backend (:5050)                           |
|  - Public Routes: /public/products, /public/products/:slug                        |
|  - Admin CRUD Routes: /products, /products/:id, /products/schema                  |
|  - RBAC: products:read, products:write                                            |
|  - Automatic Seed: config/seedProducts.ts (9 initial products)                    |
+-------------------+-------------------------------------+-------------------------+
                    |                                     ^
                    | Read / Write                        | CRUD + JWT Auth
                    v                                     |
+---------------------------------------+   +-------------+-------------------------+
|             PostgreSQL                |   |              Admin Panel (:3100)      |
|  - Table: `products`                  |   |  - /[role]/products (List table)      |
|  - Associations: User (createdById)   |   |  - /[role]/products/new (Quick add)   |
+---------------------------------------+   |  - /[role]/products/[id] (Full editor)|
                                            |  - Image Link + MediaPicker           |
                                            |  - Section Accordions & Toggles       |
                                            +---------------------------------------+
```

---

## 3. Database Schema

### Model: `Product`
- **File:** [`backend/src/models/Product.ts`](file:///d:/Projects/anwar_clinic/anwar_clinic/backend/src/models/Product.ts)
- **Table:** `products`

| Field | Type | Default / Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | Primary Key, UUIDV4 | Unique product ID |
| `slug` | `STRING(255)` | Unique, Indexed, Not Null | URL segment `/product/:slug` |
| `name` | `STRING(255)` | Not Null | Product title / name |
| `category` | `STRING(100)` | Default: `'Kits & Combos'` | Category (e.g. Kits & Combos, Devices, Shampoos) |
| `concern` | `STRING(100)` | Default: `'Daily Maintenance'` | Clinical indication (e.g. Hair Fall, Regrowth) |
| `price` | `DECIMAL(10,2)` | Not Null | Current selling price |
| `originalPrice` | `DECIMAL(10,2)` | Nullable | Strike-through MRP |
| `isSale` | `BOOLEAN` | Default: `false` | Sale badge toggle |
| `badge` | `STRING(100)` | Nullable | Badge text (e.g. `'Best Seller'`, `'Top Rated'`) |
| `rating` | `DECIMAL(3,2)` | Default: `4.8` | Product star rating |
| `reviewsCount` | `INTEGER` | Default: `10` | Total reviews count |
| `image` | `TEXT` | Not Null | Main card / stage image URL |
| `description` | `TEXT` | Not Null | Teaser / summary description |
| `inStock` | `BOOLEAN` | Default: `true` | Stock availability |
| `stockQuantity` | `INTEGER` | Default: `100` | Current inventory count |
| `isKit` | `BOOLEAN` | Default: `false` | True if product is a multi-item kit |
| `status` | `ENUM('draft', 'published')` | Default: `'draft'` | Publication status |
| `sortOrder` | `INTEGER` | Default: `0` | Manual ordering weight |
| `seoTitle` | `STRING(255)` | Nullable | Custom SEO meta title |
| `seoDescription` | `TEXT` | Nullable | Custom SEO meta description |
| `sections` | `JSONB` | Default: `{}` | Custom section overrides (hero, whatsInside, etc.) |
| `hiddenSections` | `JSONB` | Default: `[]` | List of section keys hidden by admin |
| `createdById` | `UUID` | Nullable, Foreign Key | Refers to `users.id` |

---

## 4. Backend Implementation

### 4.1. RBAC Permissions
- **File:** [`backend/src/config/permissions.ts`](file:///d:/Projects/anwar_clinic/anwar_clinic/backend/src/config/permissions.ts)
- Permissions added:
  - `products:read`: View products list and editor in Admin Panel.
  - `products:write`: Create, edit, publish, and delete products.
- Automatically granted to `superadmin` and `doctor` roles on startup.

### 4.2. Admin Routes (`/products`)
- **File:** [`backend/src/routes/products.ts`](file:///d:/Projects/anwar_clinic/anwar_clinic/backend/src/routes/products.ts)
- Guarded by `authenticate` + `authorize`:

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/products/schema` | `products:read` | Returns `PRODUCT_SECTIONS` schema |
| `GET` | `/products` | `products:read` | List all products with category, concern, status, and search filters |
| `GET` | `/products/:id` | `products:read` | Get single product by UUID for editing |
| `POST` | `/products` | `products:write` | Create a new product with auto-slug resolution |
| `PUT` | `/products/:id` | `products:write` | Full update of attributes, sections, and hidden sections |
| `PATCH` | `/products/:id/toggle-status` | `products:write` | Quick draft/published toggle |
| `DELETE` | `/products/:id` | `products:write` | Delete product |

### 4.3. Public Website Routes (`/public/products`)
- **File:** [`backend/src/routes/public.ts`](file:///d:/Projects/anwar_clinic/anwar_clinic/backend/src/routes/public.ts)
- Unauthenticated endpoints for the store:
  - `GET /public/products`: Lists published products with optional `?category=...`, `?concern=...`, `?search=...`, `?sortBy=price-low|price-high|rating|featured`.
  - `GET /public/products/:slug`: Gets full product details with sections and up to 4 related products in the same category/concern.

### 4.4. Automatic Boot Seed
- **File:** [`backend/src/config/seedProducts.ts`](file:///d:/Projects/anwar_clinic/anwar_clinic/backend/src/config/seedProducts.ts)
- Seeded the 9 initial clinical products into PostgreSQL on server boot.

---

## 5. Admin Panel Implementation

### 5.1. Navigation
- **File:** [`admin-panel/constants/nav.tsx`](file:///d:/Projects/anwar_clinic/anwar_clinic/admin-panel/constants/nav.tsx)
- Added **Products** (`/products`) with icon `TbShoppingBag`, guarded by `products:read`.

### 5.2. Image Link & Schema Inputs
- **File:** [`admin-panel/components/Products/ProductSchemaFields.tsx`](file:///d:/Projects/anwar_clinic/anwar_clinic/admin-panel/components/Products/ProductSchemaFields.tsx)
- `ImageField`: Direct URL text input with preview thumbnail and Media Library picker button.
- `StringListField`: Array of text entries with add/remove.
- `ObjectListField`: Array of structured objects (e.g. kit items, FAQs, benefits).

### 5.3. Product Editor
- **File:** [`admin-panel/components/Products/ProductEditor.tsx`](file:///d:/Projects/anwar_clinic/anwar_clinic/admin-panel/components/Products/ProductEditor.tsx)
- Listing & Pricing Card:
  - Title, auto-slug generator, category, concern, price, MRP strike-through price, sale toggle, badge.
  - "Is Kit / Bundle" toggle controlling kit sections.
  - Stock toggle and quantity.
  - Main image URL link with MediaPicker.
  - Description and SEO metadata.
- Page Sections Accordion:
  - Sections rendered dynamically from schema.
  - Eye icon to hide/show any section on the store.

### 5.4. Products List
- **File:** [`admin-panel/components/Products/ProductsList.tsx`](file:///d:/Projects/anwar_clinic/anwar_clinic/admin-panel/components/Products/ProductsList.tsx)
- Filter by category pills, search bar, status tabs (`All`, `Published`, `Draft`).
- Table with cover thumbnail, prices, stock pills, status badges, quick publish toggle, view on store button, and edit links.

---

## 6. Ecommerce Store Implementation

### 6.1. API Client
- **File:** [`ecommerce/src/lib/products.ts`](file:///d:/Projects/anwar_clinic/anwar_clinic/ecommerce/src/lib/products.ts)
- `fetchProducts()` and `fetchProduct(slug)` with fallback to static data.

### 6.2. Homepage
- **File:** [`ecommerce/src/app/page.tsx`](file:///d:/Projects/anwar_clinic/anwar_clinic/ecommerce/src/app/page.tsx)
- Loads live products on mount and dynamically computes category and concern counts.

### 6.3. Product Detail Page
- **Files:** [`ecommerce/src/app/product/[slug]/page.tsx`](file:///d:/Projects/anwar_clinic/anwar_clinic/ecommerce/src/app/product/%5Bslug%5D/page.tsx) & [`ecommerce/src/app/products/[slug]/page.tsx`](file:///d:/Projects/anwar_clinic/anwar_clinic/ecommerce/src/app/products/%5Bslug%5D/page.tsx)
- Dynamic metadata generation (`generateMetadata`).
- Dynamic gallery images from `product.sections?.hero?.galleryImages`.
- Dynamic "Suitable For" bullet points from `product.sections?.hero?.suitableFor`.
- Kit-only rendering rule enforced for "What's Inside Kit".
- Cleanly respects `hiddenSections`.

---

## 7. API Reference

### `GET /public/products`
- **Query Params:** `category`, `concern`, `search`, `sortBy` (`price-low`, `price-high`, `rating`, `featured`)
- **Response:** Array of product cards (`id`, `slug`, `name`, `category`, `concern`, `price`, `originalPrice`, `isSale`, `badge`, `rating`, `reviewsCount`, `image`, `description`, `inStock`, `isKit`).

### `GET /public/products/:slug`
- **Response:**
```json
{
  "id": "a59a87f5-cafa-49a7-822d-ff3043cc4c5d",
  "slug": "post-hair-transplant-kit",
  "name": "Post Hair Transplant Kit",
  "price": 3200,
  "originalPrice": 3285,
  "isKit": true,
  "sections": {
    "hero": { ... },
    "whatsInside": { ... },
    "keyBenefits": { ... }
  },
  "hiddenSections": [],
  "related": [ ... ]
}
```

---

## 8. Kit vs. Single Product Rules

| Condition | Behavior |
|---|---|
| Product has `isKit: true` or `category: "Kits & Combos"` | "What's Inside Your Kit" section **renders** with its bundled items. |
| Product is a single item (e.g. shampoo, serum, roller, tablets) | "What's Inside Your Kit" section is **automatically omitted**. |
| Admin toggles eye icon (hidden) for `whatsInside` | Section is **hidden** regardless of product type. |

---

## 9. Verification & Test Results

```
✔ Backend TypeScript Compilation: 0 errors
✔ Admin Panel TypeScript Compilation: 0 errors
✔ Ecommerce TypeScript Compilation: 0 errors
✔ PostgreSQL Table 'products' Created
✔ 9 Demo Products Seeded Automatically
✔ Backend Health Check: HTTP 200 OK
✔ Public Products API: HTTP 200 OK (9 products)
✔ Ecommerce Home: HTTP 200 OK
✔ Kit Detail Page (/product/post-hair-transplant-kit): HTTP 200 (Contains What's Inside Kit)
✔ Single Product Detail Page (/product/uroots-clinical-dht-blocker-shampoo): HTTP 200 (Omits What's Inside Kit)
```
