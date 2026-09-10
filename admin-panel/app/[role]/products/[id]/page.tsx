"use client";

import { usePathname, useParams } from "next/navigation";
import { RequirePermission } from "@/components/UI/Guards";
import { ProductEditor } from "@/components/Products/ProductEditor";

export default function ProductDetailPage() {
  const params = useParams();
  const roleSlug = usePathname().split("/")[1] || "";
  const productId = (params?.id as string) || "";

  return (
    <RequirePermission permissions={["products:read"]}>
      <ProductEditor productId={productId} roleSlug={roleSlug} />
    </RequirePermission>
  );
}
