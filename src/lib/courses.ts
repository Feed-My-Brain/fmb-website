import agenticAi from "../../content/courses/agentic-ai.json";
import mlDl from "../../content/courses/ml-dl-transformers.json";
import dataScience from "../../content/courses/data-science.json";
import { createPublicClient } from "@/lib/supabase/public";

export type Week = {
  week: number;
  phase: number;
  title: string;
  outcomes: string[];
  topics: string[];
  lab: string;
  project: { title: string; brief: string; deliverables: string[]; stretch: string } | null;
};

export type Course = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  summary: string;
  durationWeeks: number;
  months: number;
  hoursPerWeek: number;
  totalHours: number;
  projectsLabel: string;
  prerequisites: string;
  audience: string;
  format: string;
  teamSize: string;
  hardware: string;
  outcome: string;
  learningOutcomes: string[];
  highlights: string[];
  phases: { number: number; title: string; weeks: string; summary: string; gate: string }[];
  weeks: Week[];
  capstone: { summary: string; ideas: string[]; milestones: { week: string; item: string }[] };
  assessment: { component: string; weight: string }[];
  tools: string[];
  policies: string[];
  defaultPrice: number;
  sort: number;
};

export const courses: Course[] = ([agenticAi, mlDl, dataScience] as Course[]).sort((a, b) => a.sort - b.sort);

/** Short marketing accents per course (visual only). */
export const courseAccent: Record<string, { from: string; to: string; icon: "bot" | "brain" | "chart" }> = {
  "agentic-ai": { from: "#a18cff", to: "#5ee7ff", icon: "bot" },
  "ml-dl-transformers": { from: "#ff8ad8", to: "#a18cff", icon: "brain" },
  "data-science": { from: "#5ee7ff", to: "#7cf5b8", icon: "chart" },
};

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}

export type CourseOffer = { price: number; nextBatch: string | null; enrollmentOpen: boolean };

/**
 * Live price + batch info, editable from the admin dashboard.
 * Falls back to the defaults in content/courses/*.json if Supabase isn't configured yet.
 */
export async function getOffers(): Promise<Record<string, CourseOffer>> {
  const offers: Record<string, CourseOffer> = Object.fromEntries(
    courses.map((c) => [c.slug, { price: c.defaultPrice, nextBatch: null, enrollmentOpen: true }]),
  );
  const supabase = createPublicClient();
  if (!supabase) return offers;
  const { data } = await supabase.from("courses").select("id, price_inr, next_batch, enrollment_open");
  for (const row of data ?? []) {
    offers[row.id] = { price: row.price_inr, nextBatch: row.next_batch, enrollmentOpen: row.enrollment_open };
  }
  return offers;
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

/** Strip the "(Phase N project)" suffix for display. */
export function cleanProjectTitle(title: string) {
  return title.replace(/\s*\((phase \d project[^)]*|teams)\)\s*$/i, "").trim();
}
