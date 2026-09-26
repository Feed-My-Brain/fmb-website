"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Select } from "@/components/Select";
import { batchStatuses, type Batch } from "@/lib/batches";
import { createBatch, deleteBatch, updateBatch, type ActionState } from "../actions";

/** Create a batch (pass `courses`) or edit one (pass `batch`). */
export function BatchForm({ batch, courses, defaultCourse }: { batch?: Batch; courses?: { slug: string; shortTitle: string }[]; defaultCourse?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(batch ? updateBatch : createBatch, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_150px_150px_140px]">
      {batch ? (
        <input type="hidden" name="batchId" value={batch.id} />
      ) : (
        <div>
          <label className="label" htmlFor="batch-course">
            Course
          </label>
          <Select
            id="batch-course"
            name="course"
            required
            defaultValue={defaultCourse}
            placeholder="Choose a course"
            options={(courses ?? []).map((c) => ({ value: c.slug, label: c.shortTitle }))}
          />
        </div>
      )}
      <div className={batch ? "lg:col-span-2" : ""}>
        <label className="label" htmlFor={`batch-name-${batch?.id ?? "new"}`}>
          Batch name
        </label>
        <input
          id={`batch-name-${batch?.id ?? "new"}`}
          name="name"
          required
          maxLength={80}
          defaultValue={batch?.name}
          placeholder="e.g. Nov 2026 · Weekend"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor={`batch-start-${batch?.id ?? "new"}`}>
          Start date
        </label>
        <input id={`batch-start-${batch?.id ?? "new"}`} name="startDate" type="date" defaultValue={batch?.start_date ?? ""} className="input" />
      </div>
      <div>
        <label className="label" htmlFor={`batch-end-${batch?.id ?? "new"}`}>
          End date
        </label>
        <input id={`batch-end-${batch?.id ?? "new"}`} name="endDate" type="date" defaultValue={batch?.end_date ?? ""} className="input" />
      </div>
      <div>
        <label className="label" htmlFor={`batch-status-${batch?.id ?? "new"}`}>
          Status
        </label>
        <Select
          id={`batch-status-${batch?.id ?? "new"}`}
          name="status"
          defaultValue={batch?.status ?? "upcoming"}
          options={batchStatuses.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-5">
        <button type="submit" disabled={pending} className="btn-primary btn-sm">
          {pending ? "Saving..." : batch ? "Save changes" : "Create batch"}
        </button>
        {state && <p className={`text-xs ${state.ok ? "text-mint-glow" : "text-red-300"}`}>{state.message}</p>}
      </div>
    </form>
  );
}

export function DeleteBatchButton({ batch, studentCount }: { batch: Batch; studentCount: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteBatch, null);
  const blocked = studentCount > 0;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete the batch “${batch.name}”? This can't be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="batchId" value={batch.id} />
      <button type="submit" disabled={pending || blocked} className="btn-ghost btn-sm border-red-400/30 text-red-300 hover:border-red-400/60 hover:bg-red-500/10">
        <Trash2 size={13} /> {pending ? "Deleting..." : "Delete batch"}
      </button>
      <p className="mt-2 text-xs text-subtle">
        {blocked
          ? `This batch still has ${studentCount} student${studentCount === 1 ? "" : "s"}. Move or remove them first.`
          : "Only empty batches can be deleted."}
      </p>
      {state && !state.ok && <p className="mt-2 text-xs text-red-300">{state.message}</p>}
    </form>
  );
}
