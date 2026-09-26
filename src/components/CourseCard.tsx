import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CourseIcon } from "@/components/ui";
import { courseAccent, formatINR, type Course, type CourseOffer } from "@/lib/courses";

export function CourseCard({ course, offer }: { course: Course; offer: CourseOffer }) {
  const accent = courseAccent[course.slug];
  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden p-6">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full opacity-20 blur-3xl transition group-hover:opacity-35"
        style={{ background: accent.from }}
      />
      <div className="flex items-start justify-between gap-4">
        <CourseIcon slug={course.slug} />
        <span className="chip">{course.durationWeeks} weeks</span>
      </div>
      <h3 className="h-display mt-5 text-xl">{course.shortTitle}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{course.tagline}</p>
      <ul className="mt-5 space-y-2.5">
        {course.highlights.slice(0, 3).map((h) => (
          <li key={h} className="flex gap-2.5 text-sm text-fg/90">
            <Check size={16} className="mt-0.5 shrink-0 text-mint-glow" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="chip">{course.projectsLabel} projects</span>
        <span className="chip">~{course.totalHours} hrs live</span>
      </div>
      <div className="mt-auto flex items-end justify-between gap-4 pt-7">
        <div>
          <div className="text-xs text-subtle">Course fee</div>
          <div className="font-display text-2xl font-semibold">{formatINR(offer.price)}</div>
        </div>
        <Link href={`/courses/${course.slug}`} className="btn-ghost btn-sm group/btn">
          View course <ArrowRight size={14} className="transition group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
