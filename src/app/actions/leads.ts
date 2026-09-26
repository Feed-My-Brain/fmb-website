"use server";

import { createPublicClient } from "@/lib/supabase/public";

export type LeadState = { ok: boolean; message: string } | null;

const clip = (v: FormDataEntryValue | null, max: number) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Honeypot: bots fill every field, humans never see this one.
  if (clip(formData.get("website"), 200)) return { ok: true, message: "Thanks! We'll get back to you soon." };

  const kindRaw = clip(formData.get("kind"), 20);
  const kind = kindRaw === "college" || kindRaw === "enquiry" ? kindRaw : "contact";
  const lead = {
    kind,
    name: clip(formData.get("name"), 120),
    email: clip(formData.get("email"), 200),
    phone: clip(formData.get("phone"), 30),
    college: clip(formData.get("college"), 200),
    course: clip(formData.get("course"), 60),
    message: clip(formData.get("message"), 2000),
  };

  if (!lead.name) return { ok: false, message: "Please enter your name." };
  if (!lead.email && !lead.phone) return { ok: false, message: "Please share an email or phone number so we can reach you." };
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return { ok: false, message: "That email doesn't look right." };

  const supabase = createPublicClient();
  if (!supabase) {
    return { ok: false, message: "Online enquiries aren't set up yet. Please reach us on WhatsApp or email instead." };
  }
  const { error } = await supabase.from("leads").insert(lead);
  if (error) {
    console.error("lead insert failed", error.message);
    return { ok: false, message: "Something went wrong. Please try WhatsApp or email instead." };
  }
  return { ok: true, message: "Thanks! We've received your message and will get back to you soon." };
}
