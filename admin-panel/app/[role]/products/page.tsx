"use client";

import { usePathname } from "next/navigation";
import { RequirePermission } from "@/components/UI/Guards";
import { ProductsList } from "@/components/Products/ProductsList";

export default function ProductsPage() {
  const roleSlug = usePathname().split("/")[1] || "";
  return (
    <RequirePermission permissions={["products:read"]}>
      <ProductsList roleSlug={roleSlug} />
    </RequirePermission>
  );
}
