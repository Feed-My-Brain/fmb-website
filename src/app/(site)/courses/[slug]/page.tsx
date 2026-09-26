import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Check,
  Clock,
  FolderGit2,
  GraduationCap,
  Laptop,
  MessageCircle,
  Rocket,
  Target,
  Users,
} from "lucide-react";
import { CourseIcon, SectionHeading } from "@/components/ui";
import { cleanProjectTitle, courseAccent, courses, formatINR, getCourse, getOffers } from "@/lib/courses";
import { whatsappLink } from "@/lib/site";

export const revalidate = 300;

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return { title: course.shortTitle, description: `${course.tagline} ${course.durationWeeks} weeks, ${course.projectsLabel} projects.` };
}

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const offer = (await getOffers())[course.slug];
  const accent = courseAccent[course.slug];

  const facts = [
    { icon: CalendarDays, label: "Duration", value: `${course.durationWeeks} weeks · ${course.months} months` },
    { icon: Clock, label: "Weekly load", value: `~${course.hoursPerWeek} hrs live + self-study` },
    { icon: FolderGit2, label: "Projects", value: course.projectsLabel },
    { icon: GraduationCap, label: "Prerequisites", value: "None, start from zero" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute -top-40 left-1/3 h-96 w-[44rem] rounded-full opacity-25 blur-3xl"
          style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
        />
        <div className="container-x relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex items-center gap-3">
              <CourseIcon slug={course.slug} />
              <p className="eyebrow">{course.shortTitle}</p>
            </div>
            <h1 className="h-display mt-6 text-4xl sm:text-5xl">{course.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{course.tagline}</p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl border border-line bg-ink-900/60 p-4">
                  <f.icon size={17} className="text-lav-300" />
                  <div className="mt-3 text-xs text-subtle">{f.label}</div>
                  <div className="mt-0.5 text-sm font-medium">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price card */}
          <aside className="card h-fit p-6 lg:sticky lg:top-24">
            <div className="text-xs text-subtle">Course fee</div>
            <div className="mt-1 font-display text-4xl font-semibold">{formatINR(offer.price)}</div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={`size-2 rounded-full ${offer.enrollmentOpen ? "bg-mint-glow" : "bg-subtle"}`} />
              <span className="text-muted">
                {offer.enrollmentOpen ? offer.nextBatch || "Enrolling now: next batch dates on request" : "Enrollment currently closed"}
              </span>
            </div>
            <div className="mt-6 space-y-2.5">
              <Link href={`/contact?course=${course.slug}`} className="btn-primary w-full py-3">
                Enquire to enroll
              </Link>
              <a
                href={whatsappLink(`Hi Feed My Brain! I'm interested in the ${course.shortTitle} course.`)}
                target="_blank"
                rel="noopener"
                className="btn-ghost w-full"
              >
                <MessageCircle size={16} /> Ask on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Overview */}
      <section className="container-x grid gap-12 py-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHeading eyebrow="Overview" title="What this course is about" />
          <p className="mt-5 text-base leading-8 text-muted">{course.summary}</p>
          <ul className="mt-8 space-y-3">
            {course.highlights.map((h) => (
              <li key={h} className="flex gap-3">
                <Check size={18} className="mt-0.5 shrink-0 text-mint-glow" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          {[
            { icon: Users, title: "Who it's for", text: course.audience },
            { icon: CalendarDays, title: "Format", text: course.format },
            { icon: Laptop, title: "What you need", text: course.hardware },
            { icon: Rocket, title: "You walk away with", text: course.outcome },
          ].map((b) => (
            <div key={b.title} className="card flex gap-4 p-5">
              <b.icon size={20} className="mt-0.5 shrink-0 text-lav-300" />
              <div>
                <h3 className="text-sm font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning outcomes */}
      <section className="border-y border-line bg-ink-900/40 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Learning outcomes" title="By the end, you will be able to" />
          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {course.learningOutcomes.map((lo, i) => (
              <li key={lo} className="flex gap-4 rounded-xl border border-line bg-ink-950/50 p-5">
                <span className="font-mono text-sm text-lav-300">LO{i + 1}</span>
                <span className="text-sm leading-6">{lo}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Roadmap */}
      <section className="container-x py-20" id="syllabus">
        <SectionHeading eyebrow="Syllabus" title={`${course.durationWeeks}-week roadmap`}>
          Four phases, each ending in a phase gate you prove with a project. Open any week to see topics, the lab and the project you&apos;ll ship.
        </SectionHeading>

        <div className="mt-12 space-y-14">
          {course.phases.map((phase) => {
            const weeks = course.weeks.filter((w) => w.phase === phase.number);
            return (
              <div key={phase.number} className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="lg:sticky lg:top-24 lg:h-fit">
                  <div className="font-mono text-xs tracking-[0.18em] text-lav-300 uppercase">
                    Phase {phase.number} · Weeks {phase.weeks}
                  </div>
                  <h3 className="h-display mt-2 text-2xl">{phase.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{phase.summary}</p>
                  <div className="mt-4 rounded-xl border border-mint-glow/25 bg-mint-glow/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-mint-glow">
                      <Target size={14} /> Phase gate
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-fg/85">{phase.gate}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {weeks.map((w) => (
                    <details key={w.week} className="card group overflow-hidden">
                      <summary className="flex cursor-pointer items-center gap-4 p-5 transition hover:bg-white/[0.02]">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line-strong font-mono text-sm text-lav-200">
                          {String(w.week).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{w.title}</span>
                          {w.project && (
                            <span className="mt-0.5 block truncate text-sm text-muted">
                              <FolderGit2 size={13} className="mr-1.5 inline text-cyan-glow" />
                              {w.project.title}
                            </span>
                          )}
                        </span>
                        <span className="rotate-on-open text-xl text-lav-300 transition">+</span>
                      </summary>
                      <div className="grid gap-6 border-t border-line p-5 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Topics</h4>
                          <ul className="space-y-1.5 text-sm leading-6 text-muted">
                            {w.topics.map((t) => (
                              <li key={t} className="flex gap-2">
                                <span className="mt-2.5 size-1 shrink-0 rounded-full bg-lav-400" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-5">
                          <div>
                            <h4 className="mb-2 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">You will</h4>
                            <ul className="space-y-1.5 text-sm leading-6 text-muted">
                              {w.outcomes.map((o) => (
                                <li key={o} className="flex gap-2">
                                  <Check size={14} className="mt-1 shrink-0 text-mint-glow" />
                                  {o}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {w.lab && (
                            <div>
                              <h4 className="mb-2 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Lab · 3 hours</h4>
                              <p className="text-sm leading-6 text-muted">{w.lab}</p>
                            </div>
                          )}
                          {w.project && (
                            <div className="rounded-xl border border-cyan-glow/20 bg-cyan-glow/5 p-4">
                              <h4 className="text-sm font-semibold text-cyan-glow">Project: {cleanProjectTitle(w.project.title)}</h4>
                              <p className="mt-1.5 text-sm leading-6 text-fg/85">{w.project.brief}</p>
                              {w.project.deliverables.length > 0 && (
                                <ul className="mt-3 space-y-1 text-[13px] leading-5 text-muted">
                                  {w.project.deliverables.map((d) => (
                                    <li key={d}>• {d}</li>
                                  ))}
                                </ul>
                              )}
                              {w.project.stretch && <p className="mt-3 text-[13px] text-lav-200">Stretch: {w.project.stretch}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Capstone */}
      <section className="border-y border-line bg-ink-900/40 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Capstone" title="Your team capstone">
            {course.capstone.summary}
          </SectionHeading>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {course.capstone.ideas.map((idea) => {
              const [name, ...rest] = idea.split(":");
              return (
                <div key={idea} className="rounded-xl border border-line bg-ink-950/50 p-5">
                  <h3 className="text-sm font-semibold text-lav-100">{rest.length ? name : "Idea"}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-muted">{rest.length ? rest.join(":").trim() : idea}</p>
                </div>
              );
            })}
          </div>
          <h3 className="mt-14 mb-5 font-display text-xl font-semibold">Milestones</h3>
          <ol className="relative space-y-4 border-l border-line-strong pl-6">
            {course.capstone.milestones.map((m) => (
              <li key={m.week + m.item} className="relative">
                <span className="absolute top-1.5 -left-[29px] size-2.5 rounded-full bg-lav-300 ring-4 ring-ink-900" />
                <span className="font-mono text-xs text-lav-300">Week {m.week}</span>
                <p className="mt-1 text-sm leading-6 text-muted">{m.item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Assessment + tools */}
      <section className="container-x grid gap-12 py-20 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Assessment" title="How you're graded" />
          <div className="mt-8 space-y-5">
            {course.assessment.map((a) => {
              const pct = parseFloat(a.weight);
              const [name, detail] = a.component.split(/\s*\((.*)\)\s*$/);
              return (
                <div key={a.component}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{name}</span>
                    <span className="font-mono text-sm text-lav-200">{a.weight}</span>
                  </div>
                  {detail && <p className="mt-0.5 text-xs leading-5 text-subtle">{detail}</p>}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${isNaN(pct) ? 0 : pct}%`, background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Tools" title="What you'll work with" />
          <div className="mt-8 flex flex-wrap gap-2">
            {course.tools.map((t) => (
              <span key={t} className="rounded-lg border border-line bg-ink-900 px-3 py-1.5 text-sm text-lav-100">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x">
        <div className="card flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="h-display text-2xl">Start {course.shortTitle} at {formatINR(offer.price)}</h2>
            <p className="mt-2 text-muted">Send an enquiry and we&apos;ll share batch dates and payment details.</p>
          </div>
          <Link href={`/contact?course=${course.slug}`} className="btn-primary shrink-0 px-6 py-3">
            Enquire to enroll
          </Link>
        </div>
      </section>
    </>
  );
}
