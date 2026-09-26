import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Select } from "@/components/Select";
import { courseShortName } from "@/lib/batches";
import { courses } from "@/lib/courses";
import { createSessionClient } from "@/lib/supabase/server";
import { getBatches, getSubmissions } from "../data";
import { SubmissionList } from "./SubmissionList";

export const metadata: Metadata = { title: "Submissions", robots: { index: false } };

const statuses = [
  { value: "submitted", label: "Awaiting evaluation" },
  { value: "evaluated", label: "Evaluated" },
  { value: "all", label: "All" },
] as const;

type Status = (typeof statuses)[number]["value"];

export default async function SubmissionsPage({ searchParams }: PageProps<"/admin/submissions">) {
  const sp = await searchParams;
  const status: Status = statuses.find((s) => s.value === sp.status)?.value ?? "submitted";
  const course = typeof sp.course === "string" ? sp.course : "";
  const batchId = typeof sp.batch === "string" ? sp.batch : "";

  const supabase = await createSessionClient();
  const [{ batches }, { data: enrollments }] = await Promise.all([
    getBatches(supabase),
    supabase.from("enrollments").select("student_id, course_id, batch_id").not("batch_id", "is", null),
  ]);
  const batch = batches.find((b) => b.id === batchId);
  const batchName = new Map(batches.map((b) => [b.id, b.name]));
  // "student|course" → batch name, to label each submission with its batch.
  const batchNames = new Map((enrollments ?? []).map((e) => [`${e.student_id}|${e.course_id}`, batchName.get(e.batch_id!) ?? ""]));

  const { rows, error } = await getSubmissions(supabase, {
    status,
    courseId: batch?.course_id || course || undefined,
    studentIds: batch ? (enrollments ?? []).filter((e) => e.batch_id === batch.id).map((e) => e.student_id) : undefined,
  });

  const href = (s: string, c: string) => `/admin/submissions?status=${s}${c ? `&course=${c}` : ""}`;
  const pill = (active: boolean) => `rounded-full border px-3 py-1.5 text-xs ${active ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`;
  const batchOptions = batches.filter((b) => !course || b.course_id === course);

  return (
    <div>
      <h1 className="h-display text-3xl">Submissions</h1>
      <p className="mt-2 text-sm text-muted">Open the student&apos;s link, review the work, then enter marks. Students see marks on their dashboard immediately.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <Link key={s.value} href={`${href(s.value, course)}${batchId ? `&batch=${batchId}` : ""}`} className={pill(status === s.value)}>
            {s.label}
          </Link>
        ))}
        <span className="mx-2 h-5 w-px bg-line" />
        <Link href={href(status, "")} className={pill(!course && !batchId)}>
          All courses
        </Link>
        {courses.map((c) => (
          <Link key={c.slug} href={href(status, c.slug)} className={pill(course === c.slug)}>
            {c.shortTitle}
          </Link>
        ))}
        {batchOptions.length > 0 && (
          <Form action="/admin/submissions" className="ml-auto w-56">
            <input type="hidden" name="status" value={status} />
            {course && <input type="hidden" name="course" value={course} />}
            <Select
              key={batchId}
              size="sm"
              autoSubmit
              name="batch"
              defaultValue={batchId}
              aria-label="Filter by batch"
              options={[
                { value: "", label: "All batches" },
                ...batchOptions.map((b) => ({ value: b.id, label: b.name, group: course ? undefined : courseShortName(b.course_id) })),
              ]}
            />
          </Form>
        )}
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error.message}</p>}

      <SubmissionList rows={rows} batchNames={batchNames} emptyText={status === "submitted" ? "Nothing to evaluate right now. 🎉" : "No submissions found."} />
    </div>
  );
}
