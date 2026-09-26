import type { Metadata } from "next";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = { title: "Change password", robots: { index: false } };

export default function PasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="h-display text-2xl">Change password</h1>
      <p className="mt-2 mb-6 text-sm text-muted">If we gave you a temporary password, set your own here.</p>
      <PasswordForm />
    </div>
  );
}
