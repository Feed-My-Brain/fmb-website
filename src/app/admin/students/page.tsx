import type { Metadata } from "next";
import Link from "next/link";
import { Search, UserPlus, X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Select } from "@/components/Select";
import { courseShortName } from "@/lib/batches";
import { site } from "@/lib/site";
import { createSessionClient } from "@/lib/supabase/server";
import { addToBatch, moveToBatch, removeEnrollment } from "../actions";
import { getBatches } from "../data";
import { AddStudentForm, DeleteStudentButton, ResetPasswordButton } from "./StudentForms";

export const metadata: Metadata = { title: "Students", robots: { index: false } };

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  college: string | null;
  created_at: string;
  enrollments: { course_id: string; batch_id: string | null }[];
};

export default async function StudentsPage({ searchParams }: PageProps<"/admin/students">) {
  const { q, filter } = await searchParams;
  const search = typeof q === "string" ? q.trim() : "";
  const unassignedOnly = filter === "unassigned";

  const supabase = await createSessionClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, college, created_at, enrollments(course_id, batch_id)")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(500);
  if (search) {
    const s = search.replace(/[%,()]/g, "");
    query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,college.ilike.%${s}%`);
  }
  const [{ data }, { batches }] = await Promise.all([query, getBatches(supabase)]);
  const students = ((data as Student[] | null) ?? []).filter((s) => !unassignedOnly || s.enrollments.some((e) => !e.batch_id));
  const loginUrl = `${site.url}/login`;
  const batchById = new Map(batches.map((b) => [b.id, b]));
  const openBatches = batches.filter((b) => b.status !== "completed");
  const pill = (active: boolean) => `rounded-full border px-3 py-1.5 text-xs ${active ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-3xl">Students</h1>
        <p className="mt-2 text-sm text-muted">
          Every student across all batches. To manage one group at a time, open it from{" "}
          <Link href="/admin/batches" className="text-lav-300 hover:text-lav-200">
            Batches
          </Link>
          .
        </p>
      </div>

      <details className="card group p-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-display text-lg font-semibold">
          <UserPlus size={18} className="text-lav-300" /> Add a student
        </summary>
        <p className="mt-1 text-sm text-muted">Creates their login and adds them to a batch. Leave password empty to auto-generate one.</p>
        <div className="mt-5">
          {openBatches.length === 0 ? (
            <p className="text-sm text-muted">
              Create a batch first:{" "}
              <Link href="/admin/batches" className="text-lav-300 hover:text-lav-200">
                Batches → New batch
              </Link>
            </p>
          ) : (
            <AddStudentForm batches={openBatches.map((b) => ({ id: b.id, name: b.name, courseShort: courseShortName(b.course_id) }))} loginUrl={loginUrl} />
          )}
        </div>
      </details>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-lg font-semibold">
              {unassignedOnly ? "Not in a batch" : "All students"} <span className="text-sm font-normal text-subtle">({students.length})</span>
            </h2>
            <Link href={search ? `/admin/students?q=${encodeURIComponent(search)}` : "/admin/students"} className={pill(!unassignedOnly)}>
              All
            </Link>
            <Link href={`/admin/students?filter=unassigned${search ? `&q=${encodeURIComponent(search)}` : ""}`} className={pill(unassignedOnly)}>
              Not in a batch
            </Link>
          </div>
          <form className="relative w-full max-w-xs">
            {unassignedOnly && <input type="hidden" name="filter" value="unassigned" />}
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-subtle" />
            <input name="q" defaultValue={search} placeholder="Search name, email, phone, college" className="input pl-9" aria-label="Search students" />
          </form>
        </div>

        {students.length === 0 ? (
          <div className="card mt-5 p-10 text-center text-muted">
            {search ? "No students match your search." : unassignedOnly ? "Every enrolled student is in a batch. 🎉" : "No students yet. Add your first one above."}
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {students.map((s) => {
              const enrolledCourses = new Set(s.enrollments.map((e) => e.course_id));
              const joinable = openBatches.filter((b) => !enrolledCourses.has(b.course_id));
              return (
                <li key={s.id} className="card grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="font-medium">{s.full_name || "—"}</div>
                    <div className="mt-0.5 text-sm break-all text-muted">
                      {s.email}
                      {s.phone && <span className="text-subtle"> · {s.phone}</span>}
                      {s.college && <span className="text-subtle"> · {s.college}</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {s.enrollments.map((e) => {
                        const batch = e.batch_id ? batchById.get(e.batch_id) : undefined;
                        const courseBatches = batches.filter((b) => b.course_id === e.course_id);
                        return (
                          <div key={e.course_id} className="inline-flex items-center gap-1 rounded-full border border-lav-300/30 bg-lav-300/10 py-1 pr-1.5 pl-3 text-xs text-lav-100">
                            {courseShortName(e.course_id)} ·{" "}
                            {batch ? (
                              <Link href={`/admin/batches/${batch.id}`} className="underline decoration-lav-300/40 underline-offset-2 hover:decoration-lav-300">
                                {batch.name}
                              </Link>
                            ) : courseBatches.length ? (
                              <form action={moveToBatch}>
                                <input type="hidden" name="studentId" value={s.id} />
                                <input type="hidden" name="course" value={e.course_id} />
                                <Select
                                  variant="inline"
                                  autoSubmit
                                  name="batch"
                                  placeholder="Assign batch"
                                  aria-label="Assign a batch"
                                  options={courseBatches.map((b) => ({ value: b.id, label: b.name }))}
                                />
                              </form>
                            ) : (
                              <span className="text-amber-200">no batch</span>
                            )}
                            <form action={removeEnrollment}>
                              <input type="hidden" name="studentId" value={s.id} />
                              <input type="hidden" name="course" value={e.course_id} />
                              <ConfirmButton
                                message={`Remove ${s.full_name || s.email} from ${courseShortName(e.course_id)}${batch ? ` (${batch.name})` : ""}? Their login and past submissions are kept.`}
                                className="rounded-full p-0.5 text-lav-300 hover:bg-white/10 hover:text-white"
                                title="Remove from batch"
                              >
                                <X size={12} />
                              </ConfirmButton>
                            </form>
                          </div>
                        );
                      })}
                      {s.enrollments.length === 0 && <span className="text-xs text-amber-200">Not in any batch</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    {joinable.length > 0 && (
                      <form action={addToBatch} className="flex gap-2">
                        <input type="hidden" name="studentId" value={s.id} />
                        <div className="w-52">
                          <Select
                            size="sm"
                            name="batch"
                            required
                            placeholder="Choose a batch"
                            aria-label="Batch to add"
                            options={joinable.map((b) => ({ value: b.id, label: b.name, group: courseShortName(b.course_id) }))}
                          />
                        </div>
                        <button type="submit" className="btn-ghost btn-sm shrink-0">
                          Add to batch
                        </button>
                      </form>
                    )}
                    <ResetPasswordButton student={s} loginUrl={loginUrl} />
                    <DeleteStudentButton student={s} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
