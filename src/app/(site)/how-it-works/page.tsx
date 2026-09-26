import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, FlaskConical, GitBranch, LayoutDashboard, Presentation, Radio, Target, Users } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "How it works",
  description: "Live sessions, weekly labs, a project every week, phase gates and demo day. See how Feed My Brain courses run.",
};

const week = [
  { slot: "Session A", len: "90 min", icon: Radio, text: "Concepts and live coding, starting with a 5-minute warm-up quiz on last week." },
  { slot: "Session B", len: "90 min", icon: BookOpenCheck, text: "A deeper topic, plus a guided build of the week's project skeleton." },
  { slot: "Lab", len: "3 hours", icon: FlaskConical, text: "Build the weekly project with mentor support. The last 30 minutes are demos and code review." },
  { slot: "Self-study", len: "3–4 hours", icon: GitBranch, text: "Finish the project, do the readings and try optional challenges. Push it all to GitHub." },
];

const journey = [
  { icon: Users, title: "Join a batch", text: "Enquire, confirm your batch and get your student login. You learn alongside a cohort, not alone with videos." },
  { icon: GitBranch, title: "Ship every week", text: "Each week ends with a working project in a GitHub repo with a README, due before the next lab." },
  { icon: LayoutDashboard, title: "Submit and get marked", text: "Paste your project link on your dashboard. Mentors review it, and your marks show up on your dashboard." },
  { icon: Target, title: "Clear each phase gate", text: "Every phase ends with a bigger phase project that proves you've mastered the skills before moving on." },
  { icon: Users, title: "Build a team capstone", text: "In the final weeks, teams of 2–4 build a real, deployed capstone with milestones and mentor reviews." },
  { icon: Presentation, title: "Present at demo day", text: "Present your capstone live to a panel, with a demo video, and walk away with a portfolio recruiters can see." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero eyebrow="How it works" title="A weekly rhythm that turns learners into builders">
        Feed My Brain courses are live and project-first. You don&apos;t watch someone else code. You write it, ship it and explain it.
      </PageHero>

      <section className="container-x py-20">
        <SectionHeading eyebrow="A typical week" title="About 6 contact hours, plus self-study" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {week.map((w) => (
            <div key={w.slot} className="card p-6">
              <w.icon size={22} className="text-lav-300" />
              <div className="mt-5 flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold">{w.slot}</h3>
                <span className="font-mono text-xs text-cyan-glow">{w.len}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-ink-900/40 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Your journey" title="From enquiry to demo day" />
          <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {journey.map((j, i) => (
              <li key={j.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-line-strong bg-ink-950 font-mono text-sm text-lav-200">
                    {i + 1}
                  </span>
                  <j.icon size={18} className="text-lav-300" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{j.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{j.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading eyebrow="Grading" title="Graded on what you build">
            Most of your grade comes from hands-on work: weekly projects, phase projects and the capstone, plus short concept quizzes. Every
            project is reviewed against clear acceptance criteria listed in the syllabus.
          </SectionHeading>
          <div className="card p-6 font-mono text-sm">
            {[
              ["Weekly projects", "25%"],
              ["Phase projects", "30%"],
              ["Quizzes / tests", "10%"],
              ["Team capstone", "35%"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line py-3 last:border-0">
                <span className="text-muted">{k}</span>
                <span className="text-lav-200">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 text-center">
          <Link href="/courses" className="btn-primary px-6 py-3">
            Explore the courses
          </Link>
        </div>
      </section>
    </>
  );
}
