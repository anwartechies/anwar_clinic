"use client";

import { usePathname } from "next/navigation";
import { RequirePermission } from "@/components/UI/Guards";
import { BlogEditor } from "@/components/Blogs/BlogEditor";

export default function NewBlogPage() {
  const roleSlug = usePathname().split("/")[1] || "";
  return (
    <RequirePermission permissions={["blogs:write"]}>
      <BlogEditor isNew={true} roleSlug={roleSlug} />
    </RequirePermission>
  );
}
