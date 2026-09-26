import type { Metadata } from "next";
import Link from "next/link";
import { Hammer, Eye, Sprout } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name}: ${site.slogan}.`,
};

const values = [
  { icon: Hammer, title: "Build to learn", text: "Every concept ends in something that runs. You learn AI by shipping it, one project every week." },
  { icon: Eye, title: "Nothing is a black box", text: "We build key ideas from scratch before reaching for libraries, so you understand what your tools are doing." },
  { icon: Sprout, title: "Start from zero", text: "No prerequisites, any branch. If you can think logically and put in the hours, you belong here." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={site.slogan}>
        Feed My Brain is an edtech company that helps college students become builders in AI, machine learning and data science through live,
        project-first courses.
      </PageHero>

      <section className="container-x grid gap-12 py-20 lg:grid-cols-2">
        <SectionHeading eyebrow="Why we exist" title="Degrees teach theory. Careers reward proof." />
        <div className="space-y-5 text-base leading-8 text-muted">
          <p>
            Too many students finish college having watched hours of tutorials without building anything they can show. We think the fastest way
            to learn AI is to build with it from the very first week.
          </p>
          <p>
            That&apos;s why every Feed My Brain course is organised around a weekly project, phase gates that prove real skills, and a team capstone
            presented at demo day. Our students leave with a GitHub portfolio that speaks for itself.
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-ink-900/40 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="What we believe" title="Our principles" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card p-6">
                <v.icon size={22} className="text-lav-300" />
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 text-center">
        <h2 className="h-display text-3xl">Ready to become a trailblazer?</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/courses" className="btn-primary px-6 py-3">
            Explore courses
          </Link>
          <Link href="/mentors" className="btn-ghost px-6 py-3">
            Meet the mentors
          </Link>
        </div>
      </section>
    </>
  );
}
