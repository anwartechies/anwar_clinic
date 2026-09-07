import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBlog, fetchBlogs } from "@/lib/blogs";
import BlogDetailClient from "@/components/Blogs/BlogDetailClient";
import { COMPANY_NAME } from "@/config/constants";

interface PageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const blogs = await fetchBlogs();
  if (blogs && blogs.length > 0) {
    return blogs.map((b) => ({ slug: b.slug }));
  }
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const blog = await fetchBlog(params.slug);
  if (!blog) {
    return {
      title: `Article Not Found | ${COMPANY_NAME} Clinic`,
      description: "The requested medical blog post could not be found.",
    };
  }

  const metaTitle = blog.metaTitle || `${blog.title} | ${COMPANY_NAME} Clinic`;
  const metaDescription = blog.metaDescription || blog.excerpt;
  const coverImg = blog.coverImage || "/og-image.jpg";

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/blogs/${blog.slug}`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `/blogs/${blog.slug}`,
      type: "article",
      publishedTime: blog.publishedAt,
      authors: [blog.authorName],
      images: [
        {
          url: coverImg,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [coverImg],
    },
  };
}

export default async function BlogSlugPage({ params }: PageProps) {
  const blog = await fetchBlog(params.slug);
  if (!blog) {
    notFound();
  }

  return <BlogDetailClient blog={blog} />;
}
