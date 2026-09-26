import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ClipboardCheck, UserMinus, UserPlus, Users } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Select } from "@/components/Select";
import { BatchStatusBadge } from "@/components/StatusBadge";
import { CourseIcon } from "@/components/ui";
import { batchColumns, courseShortName, formatBatchDates, sortBatches, type Batch } from "@/lib/batches";
import { site } from "@/lib/site";
import { createSessionClient } from "@/lib/supabase/server";
import { moveToBatch, removeEnrollment } from "../../actions";
import { getSubmissions } from "../../data";
import { AddExistingStudentForm, AddStudentForm, DeleteStudentButton, ResetPasswordButton } from "../../students/StudentForms";
import { SubmissionList } from "../../submissions/SubmissionList";
import { BatchForm, DeleteBatchButton } from "../BatchForms";

export const metadata: Metadata = { title: "Batch", robots: { index: false } };

type Student = { id: string; full_name: string; email: string; phone: string | null; college: string | null };
type Project = { id: string; week: number | null; title: string; max_marks: number };
type Sub = { student_id: string; project_id: string; status: "submitted" | "evaluated"; marks: number | null };

const tabs = [
  { value: "roster", label: "Students" },
  { value: "review", label: "Review" },
  { value: "gradebook", label: "Gradebook" },
  { value: "settings", label: "Settings" },
] as const;

const reviewStatuses = [
  { value: "submitted", label: "Awaiting evaluation" },
  { value: "evaluated", label: "Evaluated" },
  { value: "all", label: "All" },
] as const;

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const pill = (active: boolean) => `rounded-full border px-3 py-1.5 text-xs ${active ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`;

export default async function BatchPage({ params, searchParams }: PageProps<"/admin/batches/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = tabs.find((t) => t.value === sp.tab)?.value ?? "roster";

  const supabase = await createSessionClient();
  const { data: batch } = await supabase.from("batches").select(batchColumns).eq("id", id).maybeSingle<Batch>();
  if (!batch) notFound();

  const [{ data: enrollments }, { data: projects }, { data: siblings }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("enrolled_at, student:profiles(id, full_name, email, phone, college)")
      .eq("batch_id", batch.id)
      .order("enrolled_at"),
    supabase.from("projects").select("id, week, title, max_marks").eq("course_id", batch.course_id).order("sort"),
    supabase.from("batches").select(batchColumns).eq("course_id", batch.course_id).neq("id", batch.id),
  ]);

  const roster = ((enrollments ?? []).map((e) => e.student) as unknown as Student[]).filter(Boolean).sort((a, b) => a.full_name.localeCompare(b.full_name));
  const studentIds = roster.map((s) => s.id);
  const projectList = (projects as Project[] | null) ?? [];
  const otherBatches = sortBatches((siblings as Batch[] | null) ?? []);

  const { data: subsData } = await supabase
    .from("submissions")
    .select("student_id, project_id, status, marks")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
    .in("project_id", projectList.length ? projectList.map((p) => p.id) : ["00000000-0000-0000-0000-000000000000"]);
  const subs = (subsData as Sub[] | null) ?? [];
  const subKey = new Map(subs.map((s) => [`${s.student_id}|${s.project_id}`, s]));
  const maxOf = new Map(projectList.map((p) => [p.id, p.max_marks]));

  const statsFor = (studentId: string) => {
    const mine = subs.filter((s) => s.student_id === studentId);
    const evaluated = mine.filter((s) => s.status === "evaluated");
    return {
      submitted: mine.length,
      pending: mine.length - evaluated.length,
      earned: evaluated.reduce((t, s) => t + Number(s.marks ?? 0), 0),
      possible: evaluated.reduce((t, s) => t + (maxOf.get(s.project_id) ?? 0), 0),
    };
  };
  const pendingTotal = subs.filter((s) => s.status === "submitted").length;
  const completion = roster.length && projectList.length ? Math.round((subs.length / (roster.length * projectList.length)) * 100) : 0;

  const base = `/admin/batches/${batch.id}`;
  const courseName = courseShortName(batch.course_id);

  return (
    <div>
      <Link href="/admin/batches" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg">
        <ArrowLeft size={13} /> All batches
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <CourseIcon slug={batch.course_id} size={18} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="h-display text-3xl">{batch.name}</h1>
              <BatchStatusBadge status={batch.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span>{courseName}</span>
              <span className="inline-flex items-center gap-1.5 text-subtle">
                <CalendarDays size={13} /> {formatBatchDates(batch)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Students", v: String(roster.length), href: `${base}?tab=roster` },
          { k: "Awaiting review", v: String(pendingTotal), href: `${base}?tab=review`, accent: pendingTotal > 0 },
          { k: "Projects", v: String(projectList.length), href: `${base}?tab=gradebook` },
          { k: "Submission rate", v: `${completion}%`, href: `${base}?tab=gradebook` },
        ].map((s) => (
          <Link key={s.k} href={s.href} className={`card card-hover p-4 ${s.accent ? "border-amber-300/40" : ""}`}>
            <div className="text-xs text-subtle">{s.k}</div>
            <div className={`mt-1 font-display text-2xl font-semibold ${s.accent ? "text-amber-200" : ""}`}>{s.v}</div>
          </Link>
        ))}
      </div>

      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-line" aria-label="Batch sections">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`${base}?tab=${t.value}`}
            aria-current={tab === t.value ? "page" : undefined}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm ${tab === t.value ? "border-lav-300 text-fg" : "border-transparent text-muted hover:text-fg"}`}
          >
            {t.label}
            {t.value === "review" && pendingTotal > 0 && <span className="ml-1.5 rounded-full bg-amber-300/15 px-1.5 py-0.5 font-mono text-[10px] text-amber-200">{pendingTotal}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "roster" && <Roster batch={batch} roster={roster} otherBatches={otherBatches} statsFor={statsFor} projectCount={projectList.length} />}
        {tab === "review" && <Review batch={batch} studentIds={studentIds} roster={roster} sp={sp} />}
        {tab === "gradebook" && <Gradebook base={base} roster={roster} projects={projectList} subKey={subKey} statsFor={statsFor} />}
        {tab === "settings" && (
          <div className="space-y-6">
            <section className="card p-6">
              <h2 className="font-display text-lg font-semibold">Batch details</h2>
              <div className="mt-5">
                <BatchForm batch={batch} />
              </div>
            </section>
            <section className="card border-red-400/20 p-6">
              <h2 className="font-display text-lg font-semibold">Delete batch</h2>
              <div className="mt-4">
                <DeleteBatchButton batch={batch} studentCount={roster.length} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────── Students tab ─────────────

async function Roster({
  batch,
  roster,
  otherBatches,
  statsFor,
  projectCount,
}: {
  batch: Batch;
  roster: Student[];
  otherBatches: Batch[];
  statsFor: (id: string) => { submitted: number; pending: number; earned: number; possible: number };
  projectCount: number;
}) {
  const supabase = await createSessionClient();
  // Suggestions for "existing student": everyone not already in this course.
  const [{ data: all }, { data: inCourse }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").eq("role", "student").order("full_name").limit(1000),
    supabase.from("enrollments").select("student_id").eq("course_id", batch.course_id),
  ]);
  const taken = new Set((inCourse ?? []).map((e) => e.student_id));
  const candidates = (all ?? []).filter((s) => !taken.has(s.id));
  const loginUrl = `${site.url}/login`;
  const courseName = courseShortName(batch.course_id);

  return (
    <div className="space-y-8">
      <details className="card group p-6" open={roster.length === 0}>
        <summary className="flex cursor-pointer list-none items-center gap-2 font-display text-lg font-semibold">
          <UserPlus size={18} className="text-lav-300" /> Add students to this batch
        </summary>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h3 className="text-sm font-medium">New student</h3>
            <p className="mt-1 mb-4 text-xs text-muted">Creates their login and adds them here. You&apos;ll get a WhatsApp-ready message with their password.</p>
            <AddStudentForm batches={[]} fixedBatch={{ id: batch.id, name: batch.name, courseShort: courseName }} loginUrl={loginUrl} />
          </div>
          <div className="lg:border-l lg:border-line lg:pl-8">
            <h3 className="text-sm font-medium">Existing student</h3>
            <p className="mt-1 mb-4 text-xs text-muted">Already has a login (e.g. from another course)? Add them by email.</p>
            <AddExistingStudentForm batchId={batch.id} candidates={candidates} />
          </div>
        </div>
      </details>

      {roster.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          <Users size={22} className="mx-auto text-subtle" />
          <p className="mt-3">No students in this batch yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {roster.map((s) => {
            const st = statsFor(s.id);
            const pct = projectCount ? (st.submitted / projectCount) * 100 : 0;
            return (
              <li key={s.id} className="card grid gap-4 p-5 lg:grid-cols-[1fr_220px_auto]">
                <div className="min-w-0">
                  <div className="font-medium">{s.full_name || "—"}</div>
                  <div className="mt-0.5 text-sm break-all text-muted">
                    {s.email}
                    {s.phone && <span className="text-subtle"> · {s.phone}</span>}
                    {s.college && <span className="text-subtle"> · {s.college}</span>}
                  </div>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between text-muted">
                    <span>
                      {st.submitted}/{projectCount} submitted
                    </span>
                    <span className="font-mono">{st.possible ? `${fmt(st.earned)}/${st.possible}` : "—"}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-lav-400 to-cyan-glow" style={{ width: `${pct}%` }} />
                  </div>
                  {st.pending > 0 && (
                    <Link href={`/admin/batches/${batch.id}?tab=review&student=${s.id}`} className="mt-2 inline-flex items-center gap-1 text-amber-200 hover:text-amber-100">
                      <ClipboardCheck size={12} /> {st.pending} to review
                    </Link>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2.5 lg:items-end">
                  {otherBatches.length > 0 && (
                    <form action={moveToBatch} className="w-48">
                      <input type="hidden" name="studentId" value={s.id} />
                      <input type="hidden" name="course" value={batch.course_id} />
                      <Select
                        size="sm"
                        autoSubmit
                        name="batch"
                        placeholder="Move to batch…"
                        aria-label={`Move ${s.full_name} to another batch`}
                        options={otherBatches.map((b) => ({ value: b.id, label: b.name }))}
                      />
                    </form>
                  )}
                  <form action={removeEnrollment}>
                    <input type="hidden" name="studentId" value={s.id} />
                    <input type="hidden" name="course" value={batch.course_id} />
                    <ConfirmButton
                      message={`Remove ${s.full_name || s.email} from ${batch.name}?\n\nThey lose access to ${courseName} projects. Their login and past submissions are kept, and you can add them back any time.`}
                      pendingText="Removing..."
                      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg"
                    >
                      <UserMinus size={12} /> Remove from batch
                    </ConfirmButton>
                  </form>
                  <ResetPasswordButton student={s} loginUrl={loginUrl} />
                  <DeleteStudentButton student={s} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ───────────── Review tab ─────────────

async function Review({ batch, studentIds, roster, sp }: { batch: Batch; studentIds: string[]; roster: Student[]; sp: Record<string, string | string[] | undefined> }) {
  const status = reviewStatuses.find((s) => s.value === sp.status)?.value ?? "submitted";
  const student = typeof sp.student === "string" && studentIds.includes(sp.student) ? sp.student : "";

  const supabase = await createSessionClient();
  const { rows, error } = await getSubmissions(supabase, { status, courseId: batch.course_id, studentIds: student ? [student] : studentIds });
  const href = (s: string, stu: string) => `/admin/batches/${batch.id}?tab=review&status=${s}${stu ? `&student=${stu}` : ""}`;
  const who = roster.find((s) => s.id === student);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {reviewStatuses.map((s) => (
          <Link key={s.value} href={href(s.value, student)} className={pill(status === s.value)}>
            {s.label}
          </Link>
        ))}
        {who && (
          <>
            <span className="mx-2 h-5 w-px bg-line" />
            <Link href={href(status, "")} className="inline-flex items-center gap-1.5 rounded-full border border-lav-300 bg-lav-300/10 px-3 py-1.5 text-xs text-lav-100">
              {who.full_name || who.email} <span aria-hidden>×</span>
              <span className="sr-only">Clear student filter</span>
            </Link>
          </>
        )}
      </div>
      {error && <p className="mt-6 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error.message}</p>}
      <SubmissionList rows={rows} emptyText={status === "submitted" ? "Nothing to evaluate in this batch right now. 🎉" : "No submissions found."} />
    </div>
  );
}

// ───────────── Gradebook tab ─────────────

function Gradebook({
  base,
  roster,
  projects,
  subKey,
  statsFor,
}: {
  base: string;
  roster: Student[];
  projects: Project[];
  subKey: Map<string, Sub>;
  statsFor: (id: string) => { submitted: number; pending: number; earned: number; possible: number };
}) {
  if (roster.length === 0) return <div className="card p-10 text-center text-muted">Add students to see their progress here.</div>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-mint-glow">8</span> marks awarded
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-300" /> submitted, awaiting review (click to review)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-subtle">·</span> not submitted
        </span>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-subtle">
              <th className="sticky left-0 z-10 bg-ink-900 px-4 py-3 font-medium">Student</th>
              {projects.map((p) => (
                <th key={p.id} className="px-2 py-3 text-center font-mono font-medium" title={`${p.title} (out of ${p.max_marks})`}>
                  {p.week ? `W${p.week}` : "CAP"}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => {
              const st = statsFor(s.id);
              return (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-white/[0.02]">
                  <th scope="row" className="sticky left-0 z-10 max-w-48 truncate bg-ink-900 px-4 py-2.5 text-left font-normal" title={s.email}>
                    {s.full_name || s.email}
                  </th>
                  {projects.map((p) => {
                    const sub = subKey.get(`${s.id}|${p.id}`);
                    return (
                      <td key={p.id} className="px-2 py-2.5 text-center font-mono text-xs">
                        {!sub ? (
                          <span className="text-subtle">·</span>
                        ) : sub.status === "evaluated" ? (
                          <span className="text-mint-glow" title={`${fmt(Number(sub.marks))} / ${p.max_marks}`}>
                            {fmt(Number(sub.marks))}
                          </span>
                        ) : (
                          <Link href={`${base}?tab=review&student=${s.id}`} className="inline-block size-2.5 rounded-full bg-amber-300 hover:ring-2 hover:ring-amber-300/40" title="Awaiting review">
                            <span className="sr-only">Awaiting review</span>
                          </Link>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-right font-mono text-xs whitespace-nowrap">
                    {st.possible ? `${fmt(st.earned)}/${st.possible}` : "—"}
                    <div className="text-[10px] text-subtle">
                      {st.submitted}/{projects.length} in
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
