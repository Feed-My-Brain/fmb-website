import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.title, description: post.description } : {};
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="container-x max-w-3xl py-16">
      <Link href="/blog" className="text-sm text-muted hover:text-fg">
        ← All articles
      </Link>
      <div className="mt-8 flex gap-3 font-mono text-xs text-subtle">
        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>
        <span>·</span>
        <span>{post.readMinutes} min read</span>
        <span>·</span>
        <span>{post.author}</span>
      </div>
      <h1 className="h-display mt-4 text-4xl">{post.title}</h1>
      <div className="prose-fmb mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="card mt-14 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <p className="font-medium">Want to build this yourself?</p>
        <Link href="/courses" className="btn-primary btn-sm">
          Explore courses
        </Link>
      </div>
    </article>
  );
}
