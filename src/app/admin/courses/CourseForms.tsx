"use client";

import { useActionState } from "react";
import { updateCourse, updateMaxMarks, type ActionState } from "../actions";

export function CourseForm({ course }: { course: { id: string; title: string; price_inr: number; next_batch: string | null; enrollment_open: boolean } }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateCourse, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[160px_1fr_auto] sm:items-end">
      <input type="hidden" name="courseId" value={course.id} />
      <div>
        <label className="label" htmlFor={`price-${course.id}`}>
          Fee (₹)
        </label>
        <input id={`price-${course.id}`} name="price" type="number" min={0} step={1} required defaultValue={course.price_inr} className="input font-mono" />
      </div>
      <div>
        <label className="label" htmlFor={`batch-${course.id}`}>
          Next batch (shown on website)
        </label>
        <input
          id={`batch-${course.id}`}
          name="nextBatch"
          defaultValue={course.next_batch ?? ""}
          placeholder="e.g. Next batch starts 15 Nov 2026"
          maxLength={120}
          className="input"
        />
      </div>
      <label className="flex items-center gap-2 pb-2.5 text-sm text-muted">
        <input type="checkbox" name="enrollmentOpen" defaultChecked={course.enrollment_open} className="size-4 accent-lav-400" />
        Enrollment open
      </label>
      <div className="flex items-center gap-3 sm:col-span-3">
        <button type="submit" disabled={pending} className="btn-primary btn-sm">
          {pending ? "Saving..." : "Save"}
        </button>
        {state && <p className={`text-xs ${state.ok ? "text-mint-glow" : "text-red-300"}`}>{state.message}</p>}
      </div>
    </form>
  );
}

export function MaxMarksForm({ projects }: { projects: { id: string; week: number | null; title: string; max_marks: number }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateMaxMarks, null);
  return (
    <form action={action}>
      <div className="grid gap-x-6 gap-y-2 md:grid-cols-2">
        {projects.map((p) => (
          <label key={p.id} className="flex items-center gap-3 border-b border-line py-2 text-sm">
            <span className="w-10 shrink-0 font-mono text-xs text-lav-300">{p.week ? `W${p.week}` : "CAP"}</span>
            <span className="min-w-0 flex-1 truncate text-muted" title={p.title}>
              {p.title}
            </span>
            <input name={`max_${p.id}`} type="number" min={1} step={1} defaultValue={p.max_marks} className="input w-20 py-1 text-center font-mono" aria-label={`Max marks for ${p.title}`} />
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-ghost btn-sm">
          {pending ? "Saving..." : "Save max marks"}
        </button>
        {state && <p className={`text-xs ${state.ok ? "text-mint-glow" : "text-red-300"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
