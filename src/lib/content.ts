import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const root = join(process.cwd(), "content");

export type Post = { slug: string; title: string; description: string; date: string; author: string; readMinutes: number; html: string };

function readMarkdown(dir: string, slug: string) {
  const raw = readFileSync(join(root, dir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  return { data, content, html: marked.parse(content, { async: false }) as string };
}

export function getPosts(): Post[] {
  return readdirSync(join(root, "blog"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => getPost(f.replace(/\.md$/, ""))!)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const { data, content, html } = readMarkdown("blog", slug);
    return {
      slug,
      title: String(data.title),
      description: String(data.description ?? ""),
      date: String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date),
      author: String(data.author ?? "Feed My Brain"),
      readMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 220)),
      html,
    };
  } catch {
    return null;
  }
}

export const legalDocs = ["terms", "privacy", "refund"] as const;
export type LegalDoc = (typeof legalDocs)[number];

export function getLegal(doc: string) {
  if (!(legalDocs as readonly string[]).includes(doc)) return null;
  const { data, html } = readMarkdown("legal", doc);
  return { title: String(data.title), updated: String(data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : data.updated), html };
}
