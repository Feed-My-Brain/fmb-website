import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon } from "@/components/ui";
import { createSessionClient } from "@/lib/supabase/server";
import { CourseForm, MaxMarksForm } from "./CourseForms";

export const metadata: Metadata = { title: "Courses & pricing", robots: { index: false } };

export default async function AdminCoursesPage() {
  const supabase = await createSessionClient();
  const [{ data: courses, error }, { data: projects }] = await Promise.all([
    supabase.from("courses").select("id, title, price_inr, next_batch, enrollment_open").order("sort"),
    supabase.from("projects").select("id, course_id, week, title, max_marks").order("sort"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-3xl">Courses &amp; pricing</h1>
        <p className="mt-2 text-sm text-muted">Changes to fees and batch dates appear on the public website right after you save.</p>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error.message}</p>}
      {!error && !courses?.length && (
        <p className="card p-6 text-sm text-muted">No courses found. Run supabase/seed.sql in the Supabase SQL editor first.</p>
      )}

      {courses?.map((c) => (
        <section key={c.id} className="card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CourseIcon slug={c.id} size={18} />
              <h2 className="font-display text-lg font-semibold">{c.title}</h2>
            </div>
            <Link href={`/courses/${c.id}`} target="_blank" className="text-xs text-lav-300 hover:text-lav-200">
              View on site ↗
            </Link>
          </div>
          <CourseForm course={c} />
          <details className="mt-6 border-t border-line pt-4">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">Project max marks</summary>
            <div className="mt-4">
              <MaxMarksForm projects={(projects ?? []).filter((p) => p.course_id === c.id)} />
            </div>
          </details>
        </section>
      ))}
    </div>
  );
}
