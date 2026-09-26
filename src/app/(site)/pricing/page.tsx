import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Check } from "lucide-react";
import { CourseIcon, PageHero, SectionHeading } from "@/components/ui";
import { courses, formatINR, getOffers } from "@/lib/courses";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Batches & pricing",
  description: "Course fees and upcoming batches for Agentic AI, ML/DL & Transformers and Data Science.",
};

const included = [
  "Two live sessions + one 3-hour lab every week",
  "Mentor review and marks on every project",
  "Student dashboard to submit projects and track marks",
  "Phase projects and a team capstone with demo day",
  "A detailed, week-by-week syllabus for every course",
];

export default async function PricingPage() {
  const offers = await getOffers();
  return (
    <>
      <PageHero eyebrow="Batches & pricing" title="Simple, one-time course fees">
        One fee covers the full course: every live session, lab and project review.
      </PageHero>

      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {courses.map((c, i) => {
            const offer = offers[c.slug];
            const featured = i === 0;
            return (
              <article
                key={c.slug}
                className={`card relative flex flex-col p-7 ${featured ? "border-lav-300/50 shadow-[0_20px_60px_-25px_rgb(161_140_255/0.6)]" : ""}`}
              >
                {featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-lav-300 px-3 py-1 text-[11px] font-semibold text-ink-950">Fastest track · 16 weeks</span>
                )}
                <CourseIcon slug={c.slug} />
                <h2 className="h-display mt-5 text-xl">{c.shortTitle}</h2>
                <p className="mt-1 text-sm text-muted">
                  {c.durationWeeks} weeks · {c.projectsLabel} projects
                </p>
                <div className="mt-6 font-display text-4xl font-semibold">{formatINR(offer.price)}</div>
                <p className="mt-1 text-xs text-subtle">One-time fee, all-inclusive</p>
                <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-ink-950/50 p-3 text-sm">
                  <CalendarDays size={16} className="mt-0.5 shrink-0 text-lav-300" />
                  <span className="text-muted">
                    {offer.enrollmentOpen ? offer.nextBatch || "Next batch: dates announced soon" : "Enrollment currently closed"}
                  </span>
                </div>
                <div className="mt-auto space-y-2 pt-7">
                  <Link href={`/contact?course=${c.slug}`} className={featured ? "btn-primary w-full" : "btn-ghost w-full"}>
                    Enquire to enroll
                  </Link>
                  <Link href={`/courses/${c.slug}`} className="btn w-full text-muted hover:text-fg">
                    View syllabus
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container-x grid gap-10 py-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Every course includes" title="Everything you need to build" />
          <ul className="mt-8 space-y-3">
            {included.map((x) => (
              <li key={x} className="flex gap-3">
                <Check size={18} className="mt-0.5 shrink-0 text-mint-glow" /> {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-7">
          <h3 className="font-display text-lg font-semibold">How enrollment works</h3>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-muted">
            <li>
              <span className="font-mono text-lav-300">01 ·</span> Send an enquiry or message us on WhatsApp.
            </li>
            <li>
              <span className="font-mono text-lav-300">02 ·</span> We confirm your batch and share payment details.
            </li>
            <li>
              <span className="font-mono text-lav-300">03 ·</span> Once payment is received, we create your student login.
            </li>
            <li>
              <span className="font-mono text-lav-300">04 ·</span> Join your first live session and start shipping.
            </li>
          </ol>
          <p className="mt-6 border-t border-line pt-5 text-xs leading-5 text-subtle">
            Refunds are available only for genuine emergencies, requested after payment and before your first class. See our{" "}
            <Link href="/legal/refund" className="text-lav-300 hover:text-lav-200">
              refund policy
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
