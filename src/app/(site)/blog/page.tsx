import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog & resources",
  description: "Guides and ideas on AI agents, machine learning, data science and building a tech career.",
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <>
      <PageHero eyebrow="Blog & resources" title="Ideas for curious builders">
        Plain-English guides on AI, ML and data science, and how to grow from student to builder.
      </PageHero>
      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card card-hover group flex flex-col p-7">
              <div className="flex gap-3 font-mono text-xs text-subtle">
                <time dateTime={p.date}>{new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
                <span>·</span>
                <span>{p.readMinutes} min read</span>
              </div>
              <h2 className="h-display mt-4 text-xl group-hover:text-lav-100">{p.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{p.description}</p>
              <span className="mt-6 text-sm text-lav-300">Read article →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
