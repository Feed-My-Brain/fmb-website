import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarDays, ClipboardCheck, Plus, Users } from "lucide-react";
import { BatchStatusBadge } from "@/components/StatusBadge";
import { CourseIcon } from "@/components/ui";
import { batchStatuses, formatBatchDates, type BatchStatus } from "@/lib/batches";
import { courses } from "@/lib/courses";
import { createSessionClient } from "@/lib/supabase/server";
import { getBatches } from "../data";
import { BatchForm } from "./BatchForms";

export const metadata: Metadata = { title: "Batches", robots: { index: false } };

export default async function BatchesPage({ searchParams }: PageProps<"/admin/batches">) {
  const sp = await searchParams;
  const filter = batchStatuses.find((s) => s.value === sp.status)?.value ?? ("" as BatchStatus | "");
  const newFor = typeof sp.new === "string" ? sp.new : undefined;

  const supabase = await createSessionClient();
  const [{ batches, error }, { data: enrollments }, { data: pending }] = await Promise.all([
    getBatches(supabase),
    supabase.from("enrollments").select("student_id, course_id, batch_id"),
    supabase.from("submissions").select("student_id, project:projects(course_id)").eq("status", "submitted"),
  ]);

  // "student|course" → batch, so pending reviews can be counted per batch.
  const batchOf = new Map((enrollments ?? []).map((e) => [`${e.student_id}|${e.course_id}`, e.batch_id as string | null]));
  const students = new Map<string, number>();
  for (const e of enrollments ?? []) if (e.batch_id) students.set(e.batch_id, (students.get(e.batch_id) ?? 0) + 1);
  const reviews = new Map<string, number>();
  for (const s of pending ?? []) {
    const b = batchOf.get(`${s.student_id}|${(s.project as unknown as { course_id: string } | null)?.course_id}`);
    if (b) reviews.set(b, (reviews.get(b) ?? 0) + 1);
  }
  const unassigned = (enrollments ?? []).filter((e) => !e.batch_id).length;
  const visible = batches.filter((b) => !filter || b.status === filter);

  const pill = (active: boolean) => `rounded-full border px-3 py-1.5 text-xs ${active ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-3xl">Batches</h1>
        <p className="mt-2 text-sm text-muted">Each batch is a group of students taking one course together. Open a batch to add or remove students and review their work.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error.message}. If the batches table is missing, re-run <code>supabase/schema.sql</code> in the Supabase SQL editor.
        </p>
      )}

      {unassigned > 0 && (
        <Link href="/admin/students?filter=unassigned" className="flex items-center gap-3 rounded-xl border border-amber-300/30 bg-amber-300/5 px-4 py-3 text-sm text-amber-100 hover:border-amber-300/60">
          <AlertTriangle size={16} className="shrink-0 text-amber-300" />
          <span>
            {unassigned} enrollment{unassigned === 1 ? " isn't" : "s aren't"} in a batch yet. <span className="underline underline-offset-4">Assign them →</span>
          </span>
        </Link>
      )}

      <details className="card group p-6" open={batches.length === 0 || Boolean(newFor)}>
        <summary className="flex cursor-pointer list-none items-center gap-2 font-display text-lg font-semibold">
          <Plus size={18} className="text-lav-300 transition group-open:rotate-45" /> New batch
        </summary>
        <div className="mt-5">
          <BatchForm courses={courses.map(({ slug, shortTitle }) => ({ slug, shortTitle }))} defaultCourse={newFor} />
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/batches" className={pill(!filter)}>
          All
        </Link>
        {batchStatuses.map((s) => (
          <Link key={s.value} href={`/admin/batches?status=${s.value}`} className={pill(filter === s.value)}>
            {s.label}
          </Link>
        ))}
      </div>

      {courses.map((c) => {
        const list = visible.filter((b) => b.course_id === c.slug);
        return (
          <section key={c.slug}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CourseIcon slug={c.slug} size={18} />
                <h2 className="font-display text-lg font-semibold">{c.shortTitle}</h2>
              </div>
              <Link href={`/admin/batches?new=${c.slug}`} className="inline-flex items-center gap-1 text-xs text-lav-300 hover:text-lav-200">
                <Plus size={13} /> New batch
              </Link>
            </div>
            {list.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-subtle">
                {filter ? `No ${filter} batches.` : "No batches yet."}
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((b) => {
                  const pendingCount = reviews.get(b.id) ?? 0;
                  return (
                    <Link key={b.id} href={`/admin/batches/${b.id}`} className="card card-hover p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-medium">{b.name}</div>
                        <BatchStatusBadge status={b.status} />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
                        <CalendarDays size={12} /> {formatBatchDates(b)}
                      </div>
                      <div className="mt-4 flex gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-muted">
                          <Users size={14} /> {students.get(b.id) ?? 0} students
                        </span>
                        <span className={`inline-flex items-center gap-1.5 ${pendingCount ? "text-amber-200" : "text-subtle"}`}>
                          <ClipboardCheck size={14} /> {pendingCount} to review
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
