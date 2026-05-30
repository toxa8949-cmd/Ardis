import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPostById } from "@/lib/posts";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <div className="p-8">
      <Link href="/admin/blog" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-accent">
        <ChevronLeft size={16} /> До списку статей
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Редагувати статтю</h1>
      <PostForm post={post} />
    </div>
  );
}
