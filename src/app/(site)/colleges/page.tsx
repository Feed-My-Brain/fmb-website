import type { Metadata } from "next";
import { Building2, CalendarRange, GraduationCap, LayoutDashboard, Presentation, Wrench } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { PageHero, SectionHeading } from "@/components/ui";
import { courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "For colleges",
  description: "Partner with Feed My Brain to run live, project-first AI, ML and Data Science programs for your students.",
};

const benefits = [
  { icon: GraduationCap, title: "Industry-ready curriculum", text: "Detailed 16–20 week syllabi covering Agentic AI, ML/DL & Transformers and Data Science, current as of 2026." },
  { icon: Wrench, title: "Hands-on from day one", text: "Every week ends with a project on GitHub. Students graduate with 15–19 projects and a deployed capstone." },
  { icon: CalendarRange, title: "Flexible delivery", text: "We work with you to fit the program around your academic calendar." },
  { icon: LayoutDashboard, title: "Transparent progress", text: "Every project submission is tracked and marked on our student platform." },
  { icon: Presentation, title: "Demo day showcase", text: "Student teams present deployed capstones to a panel, a great showcase for placements and accreditation." },
  { icon: Building2, title: "Any branch, no prerequisites", text: "Designed for CSE, IT, ECE, EEE, Mech and Science students. No prior coding is needed and any 8 GB laptop works." },
];

export default function CollegesPage() {
  return (
    <>
      <PageHero eyebrow="For colleges" title="Bring job-ready AI skills to your campus">
        Partner with Feed My Brain to run live, project-first programs for your students, with mentors, labs, grading and demo day included.
      </PageHero>

      <section className="container-x py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="card p-6">
              <b.icon size={22} className="text-lav-300" />
              <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_1.3fr]">
        <SectionHeading eyebrow="Partner with us" title="Let's plan a program for your students">
          Tell us about your institution, the number of students and the tracks you&apos;re interested in. We&apos;ll get back with a proposal.
        </SectionHeading>
        <LeadForm kind="college" courses={courses.map(({ slug, shortTitle }) => ({ slug, shortTitle }))} />
      </section>
    </>
  );
}
