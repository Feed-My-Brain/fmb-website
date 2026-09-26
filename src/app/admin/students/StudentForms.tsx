"use client";

import { useActionState, useState } from "react";
import { Copy, KeyRound, MessageCircle, UserPlus } from "lucide-react";
import { createStudent, resetStudentPassword, type ActionState } from "../actions";

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

export function AddStudentForm({ courses, loginUrl }: { courses: { slug: string; shortTitle: string }[]; loginUrl: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createStudent, null);
  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <UserPlus size={18} className="text-lav-300" /> Add a student
      </h2>
      <p className="mt-1 text-sm text-muted">Creates their login and enrolls them. Leave password empty to auto-generate one.</p>
      <form action={action} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input name="name" required placeholder="Full name *" className="input" aria-label="Full name" />
        <input name="email" type="email" required placeholder="Email *" className="input" aria-label="Email" />
        <input name="phone" type="tel" placeholder="Phone / WhatsApp" className="input" aria-label="Phone" />
        <input name="college" placeholder="College" className="input" aria-label="College" />
        <select name="course" required defaultValue="" className="input" aria-label="Course">
          <option value="" disabled>
            Enroll in course *
          </option>
          {courses.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.shortTitle}
            </option>
          ))}
        </select>
        <input name="password" placeholder="Password (optional)" className="input font-mono" aria-label="Password" autoComplete="off" />
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Creating..." : "Create student"}
          </button>
        </div>
      </form>
      {state && !state.ok && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.message}</p>}
      {state?.ok && state.credentials && (
        <div className="mt-5">
          <CredentialsCard creds={state.credentials} loginUrl={loginUrl} />
        </div>
      )}
    </div>
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
