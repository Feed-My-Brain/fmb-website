import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MessageCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CourseIcon } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { whatsappLink } from "@/lib/site";
import { SubmitForm } from "./SubmitForm";

export const metadata: Metadata = { title: "My projects", robots: { index: false } };

type Project = { id: string; course_id: string; week: number | null; title: string; brief: string; max_marks: number; sort: number };
type Submission = { project_id: string; link: string; status: "submitted" | "evaluated"; marks: number | null; remark: string | null; submitted_at: string };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createSessionClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses(title)")
    .eq("student_id", profile.id)
    .order("enrolled_at");

  const courseIds = (enrollments ?? []).map((e) => e.course_id);
  const [{ data: projects }, { data: submissions }] = await Promise.all([
    supabase.from("projects").select("id, course_id, week, title, brief, max_marks, sort").in("course_id", courseIds.length ? courseIds : ["-"]).order("sort"),
    supabase.from("submissions").select("project_id, link, status, marks, remark, submitted_at").eq("student_id", profile.id),
  ]);

  const subByProject = new Map((submissions as Submission[] | null)?.map((s) => [s.project_id, s]));
  const firstName = profile.full_name.split(" ")[0] || "there";

  if (!enrollments?.length) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <h1 className="h-display text-2xl">Hi {firstName} 👋</h1>
        <p className="mt-3 text-muted">You&apos;re not enrolled in a course yet. Once your enrollment is confirmed, your projects will appear here.</p>
        <a href={whatsappLink("Hi! I've logged in but can't see my course on the dashboard.")} target="_blank" rel="noopener" className="btn-ghost mt-6">
          <MessageCircle size={15} /> Contact us
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      <div>
        <p className="eyebrow">Student dashboard</p>
        <h1 className="h-display mt-2 text-3xl">Hi {firstName}, keep shipping 🚀</h1>
      </div>

      {enrollments.map((enr) => {
        const list = ((projects as Project[] | null) ?? []).filter((p) => p.course_id === enr.course_id);
        const subs = list.map((p) => subByProject.get(p.id));
        const submitted = subs.filter(Boolean).length;
        const evaluated = subs.filter((s) => s?.status === "evaluated");
        const earned = evaluated.reduce((t, s) => t + Number(s!.marks ?? 0), 0);
        const possible = list.filter((p) => subByProject.get(p.id)?.status === "evaluated").reduce((t, p) => t + p.max_marks, 0);
        const courseTitle = (enr.courses as unknown as { title: string } | null)?.title ?? enr.course_id;

        return (
          <section key={enr.course_id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CourseIcon slug={enr.course_id} size={18} />
                <div>
                  <h2 className="font-display text-xl font-semibold">{courseTitle}</h2>
                  <Link href={`/courses/${enr.course_id}#syllabus`} className="text-xs text-lav-300 hover:text-lav-200">
                    View syllabus
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Projects", v: String(list.length) },
                { k: "Submitted", v: `${submitted}/${list.length}` },
                { k: "Evaluated", v: String(evaluated.length) },
                { k: "Marks so far", v: possible ? `${fmt(earned)}/${possible}` : "—" },
              ].map((s) => (
                <div key={s.k} className="card p-4">
                  <div className="text-xs text-subtle">{s.k}</div>
                  <div className="mt-1 font-display text-2xl font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800" aria-label={`${submitted} of ${list.length} projects submitted`}>
              <div className="h-full rounded-full bg-gradient-to-r from-lav-400 to-cyan-glow" style={{ width: `${list.length ? (submitted / list.length) * 100 : 0}%` }} />
            </div>

            <ol className="mt-8 space-y-3">
              {list.map((p) => {
                const s = subByProject.get(p.id);
                return (
                  <li key={p.id} className="card p-5">
                    <div className="flex flex-wrap items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line-strong font-mono text-xs text-lav-200">
                        {p.week ? `W${String(p.week).padStart(2, "0")}` : "CAP"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">{p.title}</h3>
                          <StatusBadge status={s ? s.status : "not_submitted"} />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted">{p.brief}</p>
                      </div>
                      <div className="text-right">
                        {s?.status === "evaluated" ? (
                          <>
                            <div className="font-display text-2xl font-semibold text-mint-glow">
                              {fmt(Number(s.marks))}
                              <span className="text-sm text-subtle">/{p.max_marks}</span>
                            </div>
                            <div className="text-[11px] text-subtle">marks</div>
                          </>
                        ) : (
                          <div className="font-mono text-xs text-subtle">out of {p.max_marks}</div>
                        )}
                      </div>
                    </div>

                    {s?.status === "evaluated" ? (
                      <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-mono text-xs break-all text-lav-300 hover:text-lav-200">
                          <ExternalLink size={12} /> {s.link}
                        </a>
                        {s.remark && (
                          <p className="rounded-lg bg-ink-950/60 px-3 py-2 text-muted">
                            <span className="text-fg">Mentor remark:</span> {s.remark}
                          </p>
                        )}
                      </div>
                    ) : (
                      <SubmitForm projectId={p.id} currentLink={s?.link} />
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
