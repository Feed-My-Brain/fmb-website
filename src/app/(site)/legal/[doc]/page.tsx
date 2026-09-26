import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegal, legalDocs } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocs.map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const legal = getLegal((await params).doc);
  return legal ? { title: legal.title } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const legal = getLegal((await params).doc);
  if (!legal) notFound();
  return (
    <article className="container-x max-w-3xl py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="h-display mt-3 text-4xl">{legal.title}</h1>
      <p className="mt-2 font-mono text-xs text-subtle">Last updated: {legal.updated}</p>
      <div className="prose-fmb mt-8" dangerouslySetInnerHTML={{ __html: legal.html }} />
    </article>
  );
}
