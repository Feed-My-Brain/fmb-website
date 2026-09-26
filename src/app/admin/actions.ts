"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, createSessionClient } from "@/lib/supabase/server";

export type ActionState = { ok: boolean; message: string; credentials?: { name: string; email: string; password: string; phone: string | null } } | null;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "FMB-" + Array.from({ length: 8 }, () => chars[randomInt(chars.length)]).join("");
}

/** Every admin page shows batch/student counts, so refresh them all after a change. */
function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

type Db = Awaited<ReturnType<typeof createSessionClient>>;

/** Puts a student in a batch. Returns an error message, or null on success. */
async function enrollInBatch(db: Db, studentId: string, batchId: string): Promise<string | null> {
  const { data: batch } = await db.from("batches").select("id, course_id, name").eq("id", batchId).maybeSingle();
  if (!batch) return "That batch no longer exists.";

  const { data: existing } = await db
    .from("enrollments")
    .select("batch_id, batch:batches!enrollments_batch_fkey(name)")
    .eq("student_id", studentId)
    .eq("course_id", batch.course_id)
    .maybeSingle();
  if (existing?.batch_id === batch.id) return "This student is already in this batch.";
  if (existing?.batch_id) {
    const other = (existing.batch as unknown as { name: string } | null)?.name ?? "another batch";
    return `This student is already in “${other}” for this course. Use “Move” on their row instead.`;
  }

  // No enrollment yet, or enrolled in the course without a batch: attach them.
  const { error } = existing
    ? await db.from("enrollments").update({ batch_id: batch.id }).eq("student_id", studentId).eq("course_id", batch.course_id)
    : await db.from("enrollments").insert({ student_id: studentId, course_id: batch.course_id, batch_id: batch.id });
  return error ? error.message : null;
}

// ───────────── Students ─────────────

export async function createStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(formData.get("name"));
  const email = str(formData.get("email")).toLowerCase();
  const phone = str(formData.get("phone")) || null;
  const college = str(formData.get("college")) || null;
  const batchId = str(formData.get("batch"));
  const password = str(formData.get("password")) || generatePassword();

  if (!name || !email) return { ok: false, message: "Name and email are required." };
  if (!batchId) return { ok: false, message: "Choose a batch." };
  if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, message: "SUPABASE_SECRET_KEY is not configured on the server." };
  }
  const supabase = await createSessionClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, phone, college },
  });
  if (error || !data.user) {
    if (!/already|registered|exists/i.test(error?.message ?? "")) return { ok: false, message: `Could not create login: ${error?.message}` };

    // They already have a login (e.g. from an earlier course): just add them to the batch.
    const { data: profile } = await supabase.from("profiles").select("id, role").eq("email", email).maybeSingle();
    if (!profile || profile.role !== "student") return { ok: false, message: "This email belongs to an existing non-student account." };
    const enrollError = await enrollInBatch(supabase, profile.id, batchId);
    if (enrollError) return { ok: false, message: enrollError };
    refreshAdmin();
    return { ok: true, message: "This student already had a login, so they were added to the batch. Their password is unchanged." };
  }

  const enrollError = await enrollInBatch(supabase, data.user.id, batchId);
  if (enrollError) return { ok: false, message: `Login created, but adding to the batch failed: ${enrollError}` };

  refreshAdmin();
  return { ok: true, message: "Student created.", credentials: { name, email, password, phone } };
}

/** Adds a student who already has a login to a batch, by email. */
export async function addExistingToBatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const email = str(formData.get("email")).toLowerCase();
  const batchId = str(formData.get("batch"));
  if (!email) return { ok: false, message: "Enter the student's email." };

  const supabase = await createSessionClient();
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role").eq("email", email).maybeSingle();
  if (!profile || profile.role !== "student") return { ok: false, message: "No student found with that email. Use “New student” instead." };

  const enrollError = await enrollInBatch(supabase, profile.id, batchId);
  if (enrollError) return { ok: false, message: enrollError };
  refreshAdmin();
  return { ok: true, message: `${profile.full_name || email} added to the batch.` };
}

export async function deleteStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("studentId"));

  const supabase = await createSessionClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  if (!profile) return { ok: false, message: "Student not found." };
  if (profile.role !== "student") return { ok: false, message: "Admin accounts can't be deleted from here." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, message: "SUPABASE_SECRET_KEY is not configured on the server." };
  }
  // Deleting the auth user cascades to their profile, enrollments and submissions.
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { ok: false, message: error.message };

  refreshAdmin();
  return { ok: true, message: "Student deleted." };
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

export async function addToBatch(formData: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const studentId = str(formData.get("studentId"));
  const batchId = str(formData.get("batch"));
  if (studentId && batchId) await enrollInBatch(supabase, studentId, batchId);
  refreshAdmin();
}

/** Moves a student to another batch of the same course. Submissions and marks are kept. */
export async function moveToBatch(formData: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  const batchId = str(formData.get("batch"));
  if (!batchId) return;
  await supabase.from("enrollments").update({ batch_id: batchId }).eq("student_id", str(formData.get("studentId"))).eq("course_id", str(formData.get("course")));
  refreshAdmin();
}

/** Removes a student from a course (and so its batch). Their login and past submissions are kept. */
export async function removeEnrollment(formData: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  await supabase.from("enrollments").delete().eq("student_id", str(formData.get("studentId"))).eq("course_id", str(formData.get("course")));
  refreshAdmin();
}

// ───────────── Batches ─────────────

const batchStatuses = ["upcoming", "active", "completed"];

function readBatch(formData: FormData) {
  const name = str(formData.get("name")).slice(0, 80);
  const start = str(formData.get("startDate")) || null;
  const end = str(formData.get("endDate")) || null;
  const status = str(formData.get("status"));
  if (!name) return { error: "Give the batch a name." };
  if (!batchStatuses.includes(status)) return { error: "Choose a status." };
  if (start && end && end < start) return { error: "End date can't be before the start date." };
  return { values: { name, start_date: start, end_date: end, status } };
}

const duplicateName = (message: string) => (/duplicate|unique/i.test(message) ? "A batch with this name already exists for this course." : message);

export async function createBatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const courseId = str(formData.get("course"));
  if (!courseId) return { ok: false, message: "Choose a course." };
  const parsed = readBatch(formData);
  if (!parsed.values) return { ok: false, message: parsed.error };

  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("batches")
    .insert({ course_id: courseId, ...parsed.values })
    .select("id")
    .single();
  if (error) return { ok: false, message: duplicateName(error.message) };

  refreshAdmin();
  redirect(`/admin/batches/${data.id}`);
}

export async function updateBatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = readBatch(formData);
  if (!parsed.values) return { ok: false, message: parsed.error };

  const supabase = await createSessionClient();
  const { error } = await supabase.from("batches").update(parsed.values).eq("id", str(formData.get("batchId")));
  if (error) return { ok: false, message: duplicateName(error.message) };

  refreshAdmin();
  return { ok: true, message: "Batch saved." };
}

export async function deleteBatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("batches").delete().eq("id", str(formData.get("batchId")));
  if (error) {
    const inUse = /foreign key|violates/i.test(error.message);
    return { ok: false, message: inUse ? "Move or remove every student from this batch before deleting it." : error.message };
  }
  refreshAdmin();
  redirect("/admin/batches");
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

  refreshAdmin();
  return { ok: true, message: "Saved. The student can see these marks now." };
}

export async function reopenSubmission(formData: FormData) {
  await requireAdmin();
  const supabase = await createSessionClient();
  await supabase
    .from("submissions")
    .update({ status: "submitted", marks: null, remark: null, evaluated_at: null, evaluated_by: null })
    .eq("id", str(formData.get("submissionId")));
  refreshAdmin();
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
