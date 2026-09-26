"use client";

import { useActionState, useState } from "react";
import { Copy, KeyRound, MessageCircle, Trash2, UserPlus } from "lucide-react";
import { Select } from "@/components/Select";
import { addExistingToBatch, createStudent, deleteStudent, resetStudentPassword, type ActionState } from "../actions";

type Creds = NonNullable<NonNullable<ActionState>["credentials"]>;

function waNumber(phone: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  return digits;
}

function CredentialsCard({ creds, loginUrl }: { creds: Creds; loginUrl: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Hi ${creds.name}, welcome to Feed My Brain! 🎉\n\nYour student login:\n${loginUrl}\nEmail: ${creds.email}\nPassword: ${creds.password}\n\nPlease change your password after logging in (Dashboard → Change password).`;
  const num = waNumber(creds.phone);
  return (
    <div className="rounded-xl border border-mint-glow/30 bg-mint-glow/5 p-4 text-sm">
      <p className="font-medium text-mint-glow">Share these login details with the student. The password won&apos;t be shown again.</p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-950/70 p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-fg">{text}</pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
        >
          <Copy size={13} /> {copied ? "Copied!" : "Copy message"}
        </button>
        <a
          href={`https://wa.me/${num}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener"
          className="btn btn-sm bg-[#25D366] text-white hover:bg-[#1fb857]"
        >
          <MessageCircle size={13} /> Send on WhatsApp
        </a>
      </div>
    </div>
  );
}

export type BatchOption = { id: string; name: string; courseShort: string };

export function AddStudentForm({ batches, loginUrl, fixedBatch }: { batches: BatchOption[]; loginUrl: string; fixedBatch?: BatchOption }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createStudent, null);
  return (
    <div>
      <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input name="name" required placeholder="Full name *" className="input" aria-label="Full name" />
        <input name="email" type="email" required placeholder="Email *" className="input" aria-label="Email" />
        <input name="phone" type="tel" placeholder="Phone / WhatsApp" className="input" aria-label="Phone" />
        <input name="college" placeholder="College" className="input" aria-label="College" />
        {fixedBatch ? (
          <input type="hidden" name="batch" value={fixedBatch.id} />
        ) : (
          <Select
            name="batch"
            required
            placeholder="Add to batch *"
            aria-label="Batch"
            options={[...batches].sort((a, b) => a.courseShort.localeCompare(b.courseShort)).map((b) => ({ value: b.id, label: b.name, group: b.courseShort }))}
          />
        )}
        <input name="password" placeholder="Password (optional, auto-generated)" className="input font-mono" aria-label="Password" autoComplete="off" />
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={pending} className="btn-primary">
            <UserPlus size={15} /> {pending ? "Creating..." : fixedBatch ? `Create & add to ${fixedBatch.name}` : "Create student"}
          </button>
        </div>
      </form>
      {state && !state.ok && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.message}</p>}
      {state?.ok && !state.credentials && <p className="mt-4 rounded-lg bg-mint-glow/10 px-3 py-2 text-sm text-mint-glow">{state.message}</p>}
      {state?.ok && state.credentials && (
        <div className="mt-5">
          <CredentialsCard creds={state.credentials} loginUrl={loginUrl} />
        </div>
      )}
    </div>
  );
}

/** Adds a student who already has a login (e.g. from an earlier course) to a batch. */
export function AddExistingStudentForm({ batchId, candidates }: { batchId: string; candidates: { email: string; full_name: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addExistingToBatch, null);
  return (
    <div>
      <form action={action} className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="batch" value={batchId} />
        <input name="email" type="email" required list={`students-${batchId}`} placeholder="Start typing the student's email" className="input" aria-label="Student email" autoComplete="off" />
        <datalist id={`students-${batchId}`}>
          {candidates.map((c) => (
            <option key={c.email} value={c.email}>
              {c.full_name}
            </option>
          ))}
        </datalist>
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? "Adding..." : "Add to batch"}
        </button>
      </form>
      {state && <p className={`mt-3 text-sm ${state.ok ? "text-mint-glow" : "text-red-300"}`}>{state.message}</p>}
    </div>
  );
}

export function DeleteStudentButton({ student }: { student: { id: string; full_name: string; email: string } }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteStudent, null);
  const who = student.full_name || student.email;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = confirm(
          `Permanently delete ${who}?\n\nThis removes their login, all course enrollments, every submission and all marks. This can't be undone.\n\nTo only take them out of a course, use “Remove from batch” instead.`,
        );
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="studentId" value={student.id} />
      <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 text-xs text-red-300/80 hover:text-red-300">
        <Trash2 size={12} /> {pending ? "Deleting..." : "Delete student"}
      </button>
      {state && !state.ok && <p className="mt-2 text-xs text-red-300">{state.message}</p>}
    </form>
  );
}

export function ResetPasswordButton({
  student,
  loginUrl,
}: {
  student: { id: string; full_name: string; email: string; phone: string | null };
  loginUrl: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(resetStudentPassword, null);
  return (
    <div>
      <form
        action={action}
        onSubmit={(e) => {
          if (!confirm(`Generate a new password for ${student.full_name}? Their old password will stop working.`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="studentId" value={student.id} />
        <input type="hidden" name="name" value={student.full_name} />
        <input type="hidden" name="email" value={student.email} />
        <input type="hidden" name="phone" value={student.phone ?? ""} />
        <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg">
          <KeyRound size={12} /> {pending ? "Resetting..." : "Reset password"}
        </button>
      </form>
      {state && !state.ok && <p className="mt-2 text-xs text-red-300">{state.message}</p>}
      {state?.ok && state.credentials && (
        <div className="mt-3">
          <CredentialsCard creds={state.credentials} loginUrl={loginUrl} />
        </div>
      )}
    </div>
  );
}
