import Link from "next/link";
import { ArrowRight, Code2, FlaskConical, GitBranch, Presentation, Radio, Sparkles, UserRound } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { HeroTerminal } from "@/components/HeroTerminal";
import { SectionHeading, Stat } from "@/components/ui";
import { cleanProjectTitle, courses, getOffers } from "@/lib/courses";
import { faqs, mentors, whatsappLink } from "@/lib/site";

export const revalidate = 300;

const steps = [
  { icon: Radio, title: "Two live sessions a week", text: "90-minute sessions of concepts and live coding, with a quick warm-up quiz on last week." },
  { icon: FlaskConical, title: "A 3-hour hands-on lab", text: "Build the week's project with mentor support. The last 30 minutes are for demos and code review." },
  { icon: GitBranch, title: "Ship a project every week", text: "Every week ends with something working on GitHub. Submit it on your dashboard and get marked." },
  { icon: Presentation, title: "Phase gates and demo day", text: "Prove each phase with a bigger project, then present a deployed team capstone at demo day." },
];

export default async function HomePage() {
  const offers = await getOffers();
  const projectTitles = courses.flatMap((c) => c.weeks.filter((w) => w.project).map((w) => cleanProjectTitle(w.project!.title)));
  const marquee = [...projectTitles, ...projectTitles];
  const mentor = mentors[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-lav-500/25 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-40 size-96 rounded-full bg-cyan-glow/10 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
          <div>
            <p className="eyebrow mb-6">
              <Sparkles size={14} /> Live, project-first courses for college students
            </p>
            <h1 className="h-display text-[2.6rem] leading-[1.08] sm:text-6xl 2xl:text-7xl">
              Empowering Tomorrow&apos;s <span className="text-gradient">Tech Trailblazers</span> Today
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Learn <span className="text-fg">Agentic AI</span>, <span className="text-fg">Machine Learning &amp; Deep Learning</span> and{" "}
              <span className="text-fg">Data Science</span> from zero, and ship a real project to GitHub every single week.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/courses" className="btn-primary px-6 py-3">
                Explore courses <ArrowRight size={16} />
              </Link>
              <Link href="/compare#quiz" className="btn-ghost px-6 py-3">
                Which course is for me?
              </Link>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
              <Stat value="0" label="Prerequisites" />
              <Stat value="15–19" label="Projects per course" />
              <Stat value="500+" label="Students trained by our mentor" />
            </div>
          </div>
          <div className="animate-float">
            <HeroTerminal />
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="container-x py-20" id="courses">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Courses" title="Three tracks. One promise: you build real things.">
            Every course starts from your first line of Python and ends with a deployed capstone you can show recruiters.
          </SectionHeading>
          <Link href="/compare" className="btn-ghost btn-sm">
            Compare courses <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.slug} course={c} offer={offers[c.slug]} />
          ))}
        </div>
      </section>

      {/* Project marquee */}
      <section className="border-y border-line bg-ink-900/40 py-10" aria-label="Projects students build">
        <p className="container-x mb-6 font-mono text-xs tracking-[0.2em] text-subtle uppercase">
          <Code2 size={13} className="mr-2 inline" />
          What you&apos;ll ship, week after week
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
            {marquee.map((t, i) => (
              <span key={i} className="rounded-full border border-line bg-ink-900 px-4 py-2 text-sm whitespace-nowrap text-lav-100">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-24">
        <SectionHeading eyebrow="How it works" title="Not videos. A weekly rhythm that makes you a builder." align="center">
          Every course runs as a live batch with the same proven structure, about 6 hours a week plus self-study.
        </SectionHeading>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="card relative p-6">
              <span className="absolute top-5 right-5 font-mono text-xs text-subtle">0{i + 1}</span>
              <s.icon size={22} className="text-lav-300" />
              <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/how-it-works" className="text-sm text-lav-300 hover:text-lav-200">
            See the full learning model →
          </Link>
        </div>
      </section>

      {/* Mentor */}
      <section className="container-x">
        <div className="card relative grid gap-8 overflow-hidden p-8 sm:p-12 md:grid-cols-[auto_1fr] md:items-center">
          <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-lav-500/15 blur-3xl" />
          <div className="relative grid size-28 place-items-center rounded-3xl border border-line-strong bg-gradient-to-br from-lav-400/30 to-cyan-glow/10">
            <UserRound size={52} className="text-lav-200" strokeWidth={1.5} />
          </div>
          <div className="relative">
            <p className="eyebrow mb-3">Learn from</p>
            <h2 className="h-display text-3xl">{mentor.name}</h2>
            <p className="mt-1 text-sm text-lav-300">{mentor.role}</p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{mentor.bio}</p>
            <Link href="/mentors" className="mt-6 inline-flex text-sm text-lav-300 hover:text-lav-200">
              Meet the mentors →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="container-x py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="FAQ" title="Questions students ask us">
            Can&apos;t find your answer? Message us on WhatsApp and we&apos;ll help you out.
          </SectionHeading>
          <div className="space-y-3">
            {faqs.slice(0, 5).map((f) => (
              <details key={f.q} className="card group p-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="rotate-on-open text-xl text-lav-300 transition">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted">{f.a}</p>
              </details>
            ))}
            <Link href="/faq" className="inline-block pt-2 text-sm text-lav-300 hover:text-lav-200">
              All FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-gradient-to-br from-lav-600/40 via-ink-850 to-ink-900 px-6 py-16 text-center sm:px-12">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="h-display mx-auto max-w-2xl text-3xl sm:text-4xl">Ready to feed your brain?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Tell us which course you&apos;re eyeing and we&apos;ll share the next batch dates and how to enroll.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary px-6 py-3">
                Enquire now
              </Link>
              <a href={whatsappLink()} target="_blank" rel="noopener" className="btn-ghost px-6 py-3">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
