"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export type SubmitState = { ok: boolean; message: string } | null;

export async function submitProject(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const profile = await requireProfile();
  const projectId = String(formData.get("projectId") ?? "");
  const link = String(formData.get("link") ?? "").trim();

  try {
    const url = new URL(link);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
  } catch {
    return { ok: false, message: "Paste a full link starting with https:// (for example your GitHub repo)." };
  }
  if (link.length > 500) return { ok: false, message: "That link is too long." };

  const supabase = await createSessionClient();
  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("student_id", profile.id)
    .eq("project_id", projectId)
    .maybeSingle();

  if (existing?.status === "evaluated") {
    return { ok: false, message: "This project has already been evaluated, so the link is locked." };
  }

  const { error } = existing
    ? await supabase.from("submissions").update({ link }).eq("id", existing.id)
    : await supabase.from("submissions").insert({ student_id: profile.id, project_id: projectId, link });

  if (error) {
    console.error("submission failed", error.message);
    return { ok: false, message: "Couldn't save your submission. Make sure you're enrolled in this course, then try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: existing ? "Link updated." : "Submitted! Your mentor will review it soon." };
}
