import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { courses } from "@/lib/courses";
import { createSessionClient } from "@/lib/supabase/server";
import { reopenSubmission } from "../actions";
import { GradeForm } from "./GradeForm";

export const metadata: Metadata = { title: "Submissions", robots: { index: false } };

type Row = {
  id: string;
  link: string;
  status: "submitted" | "evaluated";
  marks: number | null;
  remark: string | null;
  submitted_at: string;
  student: { full_name: string; email: string } | null;
  project: { title: string; week: number | null; max_marks: number; course_id: string } | null;
};

const statuses = [
  { value: "submitted", label: "Awaiting evaluation" },
  { value: "evaluated", label: "Evaluated" },
  { value: "all", label: "All" },
];

export default async function SubmissionsPage({ searchParams }: PageProps<"/admin/submissions">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && ["submitted", "evaluated", "all"].includes(sp.status) ? sp.status : "submitted";
  const course = typeof sp.course === "string" ? sp.course : "";

  const supabase = await createSessionClient();
  let query = supabase
    .from("submissions")
    .select(
      "id, link, status, marks, remark, submitted_at, student:profiles!submissions_student_id_fkey(full_name, email), project:projects(title, week, max_marks, course_id)",
    )
    .order("submitted_at", { ascending: status === "submitted" })
    .limit(500);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;

  const rows = ((data as unknown as Row[]) ?? []).filter((r) => !course || r.project?.course_id === course);
  const courseName = (id?: string) => courses.find((c) => c.slug === id)?.shortTitle ?? id;
  const href = (s: string, c: string) => `/admin/submissions?status=${s}${c ? `&course=${c}` : ""}`;

  return (
    <div>
      <h1 className="h-display text-3xl">Submissions</h1>
      <p className="mt-2 text-sm text-muted">Open the student&apos;s link, review the work, then enter marks. Students see marks on their dashboard immediately.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <Link key={s.value} href={href(s.value, course)} className={`rounded-full border px-3 py-1.5 text-xs ${status === s.value ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`}>
            {s.label}
          </Link>
        ))}
        <span className="mx-2 h-5 w-px bg-line" />
        <Link href={href(status, "")} className={`rounded-full border px-3 py-1.5 text-xs ${!course ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`}>
          All courses
        </Link>
        {courses.map((c) => (
          <Link key={c.slug} href={href(status, c.slug)} className={`rounded-full border px-3 py-1.5 text-xs ${course === c.slug ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`}>
            {c.shortTitle}
          </Link>
        ))}
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error.message}</p>}

      {rows.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-muted">{status === "submitted" ? "Nothing to evaluate right now. 🎉" : "No submissions found."}</div>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="card grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.student?.full_name || "Unknown student"}</span>
                  <span className="text-xs text-subtle">{r.student?.email}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-2 text-sm text-muted">
                  <span className="font-mono text-xs text-lav-300">{r.project?.week ? `Week ${r.project.week}` : "Capstone"}</span> · {r.project?.title}
                  <span className="text-subtle"> · {courseName(r.project?.course_id)}</span>
                </div>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line bg-ink-950/60 px-3 py-2 font-mono text-xs break-all text-lav-200 hover:border-lav-300/50"
                >
                  <ExternalLink size={13} className="shrink-0" /> {r.link}
                </a>
                <div className="mt-2 text-[11px] text-subtle">
                  Submitted {new Date(r.submitted_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
                </div>
                {r.status === "evaluated" && (
                  <form action={reopenSubmission} className="mt-3">
                    <input type="hidden" name="submissionId" value={r.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg" title="Clears marks so the student can change their link">
                      <RotateCcw size={12} /> Clear marks and allow resubmission
                    </button>
                  </form>
                )}
              </div>
              <GradeForm submissionId={r.id} maxMarks={r.project?.max_marks ?? 10} marks={r.marks} remark={r.remark} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
