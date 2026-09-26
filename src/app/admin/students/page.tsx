import type { Metadata } from "next";
import { Search, X } from "lucide-react";
import { courses } from "@/lib/courses";
import { site } from "@/lib/site";
import { createSessionClient } from "@/lib/supabase/server";
import { addEnrollment, removeEnrollment } from "../actions";
import { AddStudentForm, ResetPasswordButton } from "./StudentForms";

export const metadata: Metadata = { title: "Students", robots: { index: false } };

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  college: string | null;
  created_at: string;
  enrollments: { course_id: string }[];
};

export default async function StudentsPage({ searchParams }: PageProps<"/admin/students">) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.trim() : "";

  const supabase = await createSessionClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, college, created_at, enrollments(course_id)")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(500);
  if (search) {
    const s = search.replace(/[%,()]/g, "");
    query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,college.ilike.%${s}%`);
  }
  const { data } = await query;
  const students = (data as Student[] | null) ?? [];
  const loginUrl = `${site.url}/login`;
  const courseName = (id: string) => courses.find((c) => c.slug === id)?.shortTitle ?? id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-3xl">Students</h1>
        <p className="mt-2 text-sm text-muted">Add a student after their payment is confirmed. They log in with the email and password you share.</p>
      </div>

      <AddStudentForm courses={courses.map(({ slug, shortTitle }) => ({ slug, shortTitle }))} loginUrl={loginUrl} />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold">
            All students <span className="text-sm font-normal text-subtle">({students.length})</span>
          </h2>
          <form className="relative w-full max-w-xs">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-subtle" />
            <input name="q" defaultValue={search} placeholder="Search name, email, phone, college" className="input pl-9" aria-label="Search students" />
          </form>
        </div>

        {students.length === 0 ? (
          <div className="card mt-5 p-10 text-center text-muted">{search ? "No students match your search." : "No students yet. Add your first one above."}</div>
        ) : (
          <ul className="mt-5 space-y-3">
            {students.map((s) => {
              const enrolled = new Set(s.enrollments.map((e) => e.course_id));
              const available = courses.filter((c) => !enrolled.has(c.slug));
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
                      {[...enrolled].map((cid) => (
                        <form key={cid} action={removeEnrollment} className="inline-flex items-center gap-1 rounded-full border border-lav-300/30 bg-lav-300/10 py-1 pr-1.5 pl-3 text-xs text-lav-100">
                          {courseName(cid)}
                          <input type="hidden" name="studentId" value={s.id} />
                          <input type="hidden" name="course" value={cid} />
                          <button type="submit" className="rounded-full p-0.5 text-lav-300 hover:bg-white/10 hover:text-white" title="Remove from course">
                            <X size={12} />
                          </button>
                        </form>
                      ))}
                      {enrolled.size === 0 && <span className="text-xs text-amber-200">Not enrolled in any course</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    {available.length > 0 && (
                      <form action={addEnrollment} className="flex gap-2">
                        <input type="hidden" name="studentId" value={s.id} />
                        <select name="course" className="input py-1.5 text-xs" aria-label="Course to add" defaultValue={available[0].slug}>
                          {available.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.shortTitle}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="btn-ghost btn-sm shrink-0">
                          Add course
                        </button>
                      </form>
                    )}
                    <ResetPasswordButton student={s} loginUrl={loginUrl} />
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
