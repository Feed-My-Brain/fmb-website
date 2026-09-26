import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { PageHero } from "@/components/ui";
import { courses, getOffers } from "@/lib/courses";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Courses",
  description: "Agentic AI Development, ML, Deep Learning & Transformers, and Data Science: live, project-first courses for college students.",
};

export default async function CoursesPage() {
  const offers = await getOffers();
  return (
    <>
      <PageHero eyebrow="Courses" title="Pick your track. Ship from week one.">
        All courses start from zero, run as live batches, and end with a deployed team capstone. Choose the one that matches where you want to go.
      </PageHero>
      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.slug} course={c} offer={offers[c.slug]} />
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted">
          Can&apos;t decide?{" "}
          <Link href="/compare#quiz" className="text-lav-300 hover:text-lav-200">
            Take the 30-second course quiz →
          </Link>
        </p>
      </section>
    </>
  );
}
