"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitProject, type SubmitState } from "./actions";

export function SubmitForm({ projectId, currentLink }: { projectId: string; currentLink?: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitProject, null);
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="link"
          type="url"
          required
          defaultValue={currentLink}
          placeholder="https://github.com/your-name/project"
          className="input flex-1 font-mono text-[13px]"
          aria-label="Project link"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          <Send size={14} /> {pending ? "Saving..." : currentLink ? "Update link" : "Submit"}
        </button>
      </div>
      {state && <p className={`mt-2 text-xs ${state.ok ? "text-mint-glow" : "text-red-300"}`}>{state.message}</p>}
    </form>
  );
}
