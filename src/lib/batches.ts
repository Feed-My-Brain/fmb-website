import { courses } from "@/lib/courses";

export type BatchStatus = "upcoming" | "active" | "completed";

export type Batch = {
  id: string;
  course_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: BatchStatus;
};

export const batchColumns = "id, course_id, name, start_date, end_date, status";

export const batchStatuses: { value: BatchStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

export const courseShortName = (id: string) => courses.find((c) => c.slug === id)?.shortTitle ?? id;

/** '2026-11-15' → '15 Nov 2026'. Dates are stored without a time zone, so format them in UTC. */
export function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatBatchDates(b: Pick<Batch, "start_date" | "end_date">) {
  const start = formatDate(b.start_date);
  const end = formatDate(b.end_date);
  if (start && end) return `${start} → ${end}`;
  if (start) return `Starts ${start}`;
  if (end) return `Ends ${end}`;
  return "Dates not set";
}

/** Active first, then upcoming, then completed; newest start date first within each. */
export function sortBatches<T extends Pick<Batch, "status" | "start_date">>(list: T[]) {
  const rank = { active: 0, upcoming: 1, completed: 2 };
  return [...list].sort((a, b) => rank[a.status] - rank[b.status] || (b.start_date ?? "").localeCompare(a.start_date ?? ""));
}
