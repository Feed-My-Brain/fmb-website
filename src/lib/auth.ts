import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  college: string | null;
  role: "student" | "admin";
};

/** Returns the signed-in user's profile, or null. */
export async function getProfile() {
  await connection(); // always per-request, never prerendered
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id, full_name, email, phone, college, role").eq("id", user.id).single();
  return (data as Profile | null) ?? null;
}

export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
