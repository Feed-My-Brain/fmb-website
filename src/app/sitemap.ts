import type { MetadataRoute } from "next";
import { courses } from "@/lib/courses";
import { getPosts, legalDocs } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/courses", "/compare", "/how-it-works", "/showcase", "/mentors", "/pricing", "/colleges", "/blog", "/faq", "/about", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...courses.map((c) => ({ url: `${site.url}/courses/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...getPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, priority: 0.5 })),
    ...legalDocs.map((d) => ({ url: `${site.url}/legal/${d}`, priority: 0.2 })),
  ];
}
