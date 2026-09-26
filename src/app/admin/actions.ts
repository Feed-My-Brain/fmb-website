"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, createSessionClient } from "@/lib/supabase/server";

export type ActionState = { ok: boolean; message: string; credentials?: { name: string; email: string; password: string; phone: string | null } } | null;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "FMB-" + Array.from({ length: 8 }, () => chars[randomInt(chars.length)]).join("");
}

// ───────────── Students ─────────────

export async function createStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(formData.get("name"));
  const email = str(formData.get("email")).toLowerCase();
  const phone = str(formData.get("phone")) || null;
  const college = str(formData.get("college")) || null;
  const courseId = str(formData.get("course"));
  const password = str(formData.get("password")) || generatePassword();

  if (!name || !email) return { ok: false, message: "Name and email are required." };
  if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, message: "SUPABASE_SECRET_KEY is not configured on the server." };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, phone, college },
  });
  if (error || !data.user) {
    const exists = /already|registered|exists/i.test(error?.message ?? "");
    return { ok: false, message: exists ? "A student with this email already exists. Use “Add course” on their row instead." : `Could not create login: ${error?.message}` };
  }

  if (courseId) {
    const { error: enrollError } = await admin.from("enrollments").insert({ student_id: data.user.id, course_id: courseId });
    if (enrollError) return { ok: false, message: `Login created, but enrollment failed: ${enrollError.message}` };
  }

  revalidatePath("/admin/students");
  return { ok: true, message: "Student created.", credentials: { name, email, password, phone } };
}

export async function resetStudentPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("studentId"));
  const name = str(formData.get("name"));
  const email = str(formData.get("email"));
  const phone = str(formData.get("phone")) || null;
  const password = generatePassword();

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, message: "SUPABASE_SECRET_KEY is not configured on the server." };
  }
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "New temporary password generated.", credentials: { name, email, password, phone } };
}

export async function addEnrollment(formData: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const studentId = str(formData.get("studentId"));
  const courseId = str(formData.get("course"));
  if (studentId && courseId) {
    await supabase.from("enrollments").upsert({ student_id: studentId, course_id: courseId }, { onConflict: "student_id,course_id", ignoreDuplicates: true });
  }
  revalidatePath("/admin/students");
}

export async function removeEnrollment(formData: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  await supabase.from("enrollments").delete().eq("student_id", str(formData.get("studentId"))).eq("course_id", str(formData.get("course")));
  revalidatePath("/admin/students");
}

// ───────────── Grading ─────────────

export async function gradeSubmission(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const adminProfile = await requireAdmin();
  const id = str(formData.get("submissionId"));
  const maxMarks = Number(formData.get("maxMarks"));
  const marksRaw = str(formData.get("marks"));
  const marks = Number(marksRaw);
  const remark = str(formData.get("remark")).slice(0, 1000) || null;

  if (marksRaw === "" || Number.isNaN(marks)) return { ok: false, message: "Enter marks." };
  if (marks < 0 || marks > maxMarks) return { ok: false, message: `Marks must be between 0 and ${maxMarks}.` };

  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("submissions")
    .update({ marks, remark, status: "evaluated", evaluated_at: new Date().toISOString(), evaluated_by: adminProfile.id })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
  return { ok: true, message: "Saved. The student can see these marks now." };
}

export async function reopenSubmission(formData: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  await supabase
    .from("submissions")
    .update({ status: "submitted", marks: null, remark: null, evaluated_at: null, evaluated_by: null })
    .eq("id", str(formData.get("submissionId")));
  revalidatePath("/admin/submissions");
}

// ───────────── Courses & pricing ─────────────

export async function updateCourse(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("courseId"));
  const price = Number(str(formData.get("price")));
  const nextBatch = str(formData.get("nextBatch")).slice(0, 120) || null;
  const enrollmentOpen = formData.get("enrollmentOpen") === "on";

  if (!Number.isInteger(price) || price < 0) return { ok: false, message: "Price must be a whole number of rupees." };

  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("courses")
    .update({ price_inr: price, next_batch: nextBatch, enrollment_open: enrollmentOpen, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  // Refresh every public page that shows prices.
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved. The website now shows the new details." };
}

export async function updateMaxMarks(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSessionClient();
  const updates: { id: string; max: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("max_")) continue;
    const max = Number(value);
    if (!Number.isInteger(max) || max <= 0) return { ok: false, message: "Max marks must be whole numbers above 0." };
    updates.push({ id: key.slice(4), max });
  }
  for (const u of updates) {
    const { error } = await supabase.from("projects").update({ max_marks: u.max }).eq("id", u.id);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath("/admin/courses");
  return { ok: true, message: "Max marks saved." };
}

// ───────────── Enquiries ─────────────

export async function updateLeadStatus(formData: FormData) {
  await requireAdmin();
  const status = str(formData.get("status"));
  if (!["new", "contacted", "closed"].includes(status)) return;
  const supabase = await createSessionClient();
  await supabase.from("leads").update({ status }).eq("id", str(formData.get("leadId")));
  revalidatePath("/admin/enquiries");
}
