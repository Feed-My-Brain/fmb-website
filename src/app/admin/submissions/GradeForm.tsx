"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { gradeSubmission, type ActionState } from "../actions";

export function GradeForm({ submissionId, maxMarks, marks, remark }: { submissionId: string; maxMarks: number; marks: number | null; remark: string | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(gradeSubmission, null);
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="maxMarks" value={maxMarks} />
      <div className="flex items-center gap-2">
        <input
          name="marks"
          type="number"
          step="0.5"
          min={0}
          max={maxMarks}
          required
          defaultValue={marks ?? ""}
          className="input w-24 text-center font-mono"
          aria-label="Marks"
        />
        <span className="font-mono text-sm text-subtle">/ {maxMarks}</span>
      </div>
      <input name="remark" defaultValue={remark ?? ""} placeholder="Remark (optional)" className="input text-xs" aria-label="Remark" />
      <button type="submit" disabled={pending} className="btn-primary btn-sm">
        <Check size={13} /> {pending ? "Saving..." : marks != null ? "Update marks" : "Save marks"}
      </button>
      {state && <p className={`text-xs ${state.ok ? "text-mint-glow" : "text-red-300"}`}>{state.message}</p>}
    </form>
  );
}
