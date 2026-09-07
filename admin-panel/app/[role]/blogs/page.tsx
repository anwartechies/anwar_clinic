"use client";

import { usePathname } from "next/navigation";
import { RequirePermission } from "@/components/UI/Guards";
import { BlogsList } from "@/components/Blogs/BlogsList";

export default function BlogsPage() {
  const roleSlug = usePathname().split("/")[1] || "";
  return (
    <RequirePermission permissions={["blogs:read"]}>
      <BlogsList roleSlug={roleSlug} />
    </RequirePermission>
  );
}
