import { ExternalLink, RotateCcw } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StatusBadge } from "@/components/StatusBadge";
import { courseShortName } from "@/lib/batches";
import { reopenSubmission } from "../actions";
import type { SubmissionRow } from "../data";
import { GradeForm } from "./GradeForm";

export function SubmissionList({ rows, emptyText, batchNames }: { rows: SubmissionRow[]; emptyText: string; batchNames?: Map<string, string> }) {
  if (rows.length === 0) return <div className="card mt-8 p-10 text-center text-muted">{emptyText}</div>;

  return (
    <ul className="mt-8 space-y-3">
      {rows.map((r) => {
        const batch = batchNames?.get(`${r.student_id}|${r.project?.course_id}`);
        return (
          <li key={r.id} className="card grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{r.student?.full_name || "Unknown student"}</span>
                <span className="text-xs text-subtle">{r.student?.email}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-2 text-sm text-muted">
                <span className="font-mono text-xs text-lav-300">{r.project?.week ? `Week ${r.project.week}` : "Capstone"}</span> · {r.project?.title}
                <span className="text-subtle">
                  {" "}
                  · {courseShortName(r.project?.course_id ?? "")}
                  {batch && ` · ${batch}`}
                </span>
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
                  <ConfirmButton
                    message="Clear these marks? The student will be able to change their link and it will go back to the review queue."
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg"
                    title="Clears marks so the student can change their link"
                  >
                    <RotateCcw size={12} /> Clear marks and allow resubmission
                  </ConfirmButton>
                </form>
              )}
            </div>
            <GradeForm submissionId={r.id} maxMarks={r.project?.max_marks ?? 10} marks={r.marks} remark={r.remark} />
          </li>
        );
      })}
    </ul>
  );
}
