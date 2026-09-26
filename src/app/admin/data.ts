import "server-only";
import { batchColumns, sortBatches, type Batch } from "@/lib/batches";
import { createSessionClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createSessionClient>>;

export type SubmissionRow = {
  id: string;
  link: string;
  status: "submitted" | "evaluated";
  marks: number | null;
  remark: string | null;
  submitted_at: string;
  student_id: string;
  student: { full_name: string; email: string } | null;
  project: { title: string; week: number | null; max_marks: number; course_id: string; sort: number } | null;
};

export async function getBatches(db: Db) {
  const { data, error } = await db.from("batches").select(batchColumns);
  return { batches: sortBatches((data as Batch[] | null) ?? []), error };
}

/**
 * Submissions for review. Pass `studentIds` + `courseId` to scope to a batch
 * (a student's submissions for other courses are excluded).
 */
export async function getSubmissions(
  db: Db,
  { status, studentIds, courseId }: { status: "submitted" | "evaluated" | "all"; studentIds?: string[]; courseId?: string },
) {
  let query = db
    .from("submissions")
    .select(
      "id, link, status, marks, remark, submitted_at, student_id, student:profiles!submissions_student_id_fkey(full_name, email), project:projects(title, week, max_marks, course_id, sort)",
    )
    // Oldest first when working through the queue; newest first otherwise.
    .order("submitted_at", { ascending: status === "submitted" })
    .limit(1000);
  if (status !== "all") query = query.eq("status", status);
  if (studentIds) query = query.in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]);
  const { data, error } = await query;
  const rows = ((data as unknown as SubmissionRow[] | null) ?? []).filter((r) => !courseId || r.project?.course_id === courseId);
  return { rows, error };
}
