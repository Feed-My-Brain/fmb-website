import type { Metadata } from "next";
import Link from "next/link";
import { Hourglass } from "lucide-react";
import { CourseIcon, PageHero, SectionHeading } from "@/components/ui";
import { courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Student showcase",
  description: "Capstones and portfolios built by Feed My Brain students.",
};

export default function ShowcasePage() {
  return (
    <>
      <PageHero eyebrow="Student showcase" title="Built by our students">
        Every student graduates with 15–19 projects and a deployed team capstone. This is where we&apos;ll show them off.
      </PageHero>

      <section className="container-x py-16">
        <div className="card flex flex-col items-center gap-4 p-10 text-center sm:p-14">
          <span className="grid size-14 place-items-center rounded-2xl border border-line-strong bg-ink-850">
            <Hourglass size={26} className="text-lav-300" />
          </span>
          <h2 className="h-display text-2xl">Our first batch is building right now</h2>
          <p className="max-w-xl leading-7 text-muted">
            Capstones from our first demo day will appear here, with live demos, GitHub repos and demo videos. Until then, here&apos;s the kind of
            thing our students will build.
          </p>
        </div>
      </section>

      <section className="container-x py-10">
        <SectionHeading eyebrow="Capstone ideas" title="What teams can build" />
        <div className="mt-10 space-y-14">
          {courses.map((c) => (
            <div key={c.slug}>
              <div className="mb-5 flex items-center gap-3">
                <CourseIcon slug={c.slug} size={18} />
                <Link href={`/courses/${c.slug}`} className="font-display text-xl font-semibold hover:text-lav-200">
                  {c.shortTitle}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {c.capstone.ideas.slice(0, 4).map((idea) => {
                  const [name, ...rest] = idea.split(":");
                  return (
                    <div key={idea} className="card p-5">
                      <h3 className="text-sm font-semibold text-lav-100">{rest.length ? name : "Idea"}</h3>
                      <p className="mt-2 text-[13px] leading-5 text-muted">{rest.length ? rest.join(":").trim() : idea}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
