"use client";

import { useActionState } from "react";
import { changePassword, type PasswordState } from "@/app/actions/auth";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="password">
          New password
        </label>
        <input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">
          Confirm new password
        </label>
        <input id="confirm" name="confirm" type="password" minLength={8} autoComplete="new-password" required className="input" />
      </div>
      {state && (
        <p className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-mint-glow/10 text-mint-glow" : "bg-red-500/10 text-red-300"}`}>{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
