import type { Metadata } from "next";
import Link from "next/link";
import { CourseQuiz } from "@/components/CourseQuiz";
import { CourseIcon, PageHero, SectionHeading } from "@/components/ui";
import { courses, formatINR, getOffers } from "@/lib/courses";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Compare courses",
  description: "Compare Agentic AI, ML/DL & Transformers and Data Science side by side, or take the course quiz.",
};

const extra: Record<string, { bestFor: string; maths: string; capstone: string }> = {
  "agentic-ai": {
    bestFor: "Builders who want to create AI apps and agents that take real actions",
    maths: "Minimal",
    capstone: "A deployed real-time AI agent with tools, a database and memory",
  },
  "ml-dl-transformers": {
    bestFor: "Curious minds who want to understand and train models from the inside",
    maths: "Class 12 level; ML maths taught in class",
    capstone: "A trained or fine-tuned deep learning / Transformer model, deployed as an app or API",
  },
  "data-science": {
    bestFor: "Analytical thinkers who want to turn data into business decisions",
    maths: "Class 12 level; statistics taught from scratch",
    capstone: "Raw data to a recommendation, backed by analysis, a model and a dashboard",
  },
};

export default async function ComparePage() {
  const offers = await getOffers();
  const rows: { label: string; value: (slug: string) => React.ReactNode }[] = [
    { label: "Best for", value: (s) => extra[s].bestFor },
    { label: "Duration", value: (s) => { const c = courses.find((x) => x.slug === s)!; return `${c.durationWeeks} weeks (${c.months} months)`; } },
    { label: "Live hours", value: (s) => `~${courses.find((x) => x.slug === s)!.totalHours} hours` },
    { label: "Projects", value: (s) => courses.find((x) => x.slug === s)!.projectsLabel },
    { label: "Maths needed", value: (s) => extra[s].maths },
    { label: "Capstone", value: (s) => extra[s].capstone },
    { label: "Key tools", value: (s) => courses.find((x) => x.slug === s)!.tools.slice(0, 6).join(", ") },
    { label: "Fee", value: (s) => <span className="font-display text-lg font-semibold text-fg">{formatINR(offers[s].price)}</span> },
  ];

  return (
    <>
      <PageHero eyebrow="Compare" title="Which course is right for you?">
        See all three tracks side by side, or answer five quick questions and we&apos;ll point you to your best match.
      </PageHero>

      <section className="container-x py-16">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="w-40" />
                {courses.map((c) => (
                  <th key={c.slug} className="border-b border-line p-4 text-left align-bottom font-normal">
                    <CourseIcon slug={c.slug} size={18} />
                    <Link href={`/courses/${c.slug}`} className="mt-3 block font-display text-base font-semibold text-fg hover:text-lav-200">
                      {c.shortTitle}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th className="border-b border-line p-4 text-left align-top font-mono text-xs font-normal tracking-wider text-subtle uppercase">
                    {r.label}
                  </th>
                  {courses.map((c) => (
                    <td key={c.slug} className="border-b border-line p-4 align-top leading-6 text-muted">
                      {r.value(c.slug)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container-x scroll-mt-24 py-10" id="quiz">
        <SectionHeading eyebrow="Course quiz" title="Find your match in 30 seconds" />
        <div className="mt-8 max-w-3xl">
          <CourseQuiz />
        </div>
      </section>
    </>
  );
}
