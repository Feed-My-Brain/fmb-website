"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitLead, type LeadState } from "@/app/actions/leads";

type Props = {
  kind?: "contact" | "enquiry" | "college";
  defaultCourse?: string;
  courses: { slug: string; shortTitle: string }[];
};

export function LeadForm({ kind = "contact", defaultCourse, courses }: Props) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, null);

  if (state?.ok) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 size={40} className="text-mint-glow" />
        <p className="text-lg font-medium">{state.message}</p>
      </div>
    );
  }

  const isCollege = kind === "college";

  return (
    <form action={action} className="card space-y-4 p-6 sm:p-8">
      <input type="hidden" name="kind" value={kind} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="lead-name">
            {isCollege ? "Your name" : "Full name"} *
          </label>
          <input id="lead-name" name="name" required className="input" placeholder="Your name" />
        </div>
        <div>
          <label className="label" htmlFor="lead-phone">
            Phone / WhatsApp
          </label>
          <input id="lead-phone" name="phone" type="tel" className="input" placeholder="+91" />
        </div>
        <div>
          <label className="label" htmlFor="lead-email">
            Email
          </label>
          <input id="lead-email" name="email" type="email" className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="lead-college">
            {isCollege ? "College / institution *" : "College"}
          </label>
          <input id="lead-college" name="college" required={isCollege} className="input" placeholder="College name" />
        </div>
      </div>
      {!isCollege && (
        <div>
          <label className="label" htmlFor="lead-course">
            Interested in
          </label>
          <select id="lead-course" name="course" defaultValue={defaultCourse ?? ""} className="input">
            <option value="">Not sure yet</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.shortTitle}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="label" htmlFor="lead-message">
          {isCollege ? "Tell us about your students and what you're looking for" : "Message"}
        </label>
        <textarea id="lead-message" name="message" rows={4} className="input resize-y" placeholder="Anything you'd like to ask" />
      </div>
      {state && !state.ok && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        <Send size={15} /> {pending ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
