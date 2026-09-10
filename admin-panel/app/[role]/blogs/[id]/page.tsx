"use client";

import { use, useMemo } from "react";
import { usePathname } from "next/navigation";
import { RequirePermission } from "@/components/UI/Guards";
import { BlogEditor } from "@/components/Blogs/BlogEditor";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const roleSlug = usePathname().split("/")[1] || "";

  return (
    <RequirePermission permissions={["blogs:write"]}>
      <BlogEditor blogId={resolvedParams.id} roleSlug={roleSlug} />
    </RequirePermission>
  );
}
