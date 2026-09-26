import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Inbox, IndianRupee, Layers, Users } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminHome() {
  const supabase = await createSessionClient();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;

  const [students, activeBatches, pending, newLeads] = await Promise.all([
    count(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student")),
    count(supabase.from("batches").select("*", { count: "exact", head: true }).eq("status", "active")),
    count(supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "submitted")),
    count(supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new")),
  ]);

  const tiles = [
    { href: "/admin/submissions", icon: ClipboardCheck, label: "Awaiting evaluation", value: pending, accent: pending > 0 },
    { href: "/admin/batches?status=active", icon: Layers, label: "Active batches", value: activeBatches },
    { href: "/admin/students", icon: Users, label: "Students", value: students },
    { href: "/admin/enquiries", icon: Inbox, label: "New enquiries", value: newLeads, accent: newLeads > 0 },
  ];

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="h-display mt-2 text-3xl">Overview</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`card card-hover p-5 ${t.accent ? "border-lav-300/40" : ""}`}>
            <t.icon size={18} className="text-lav-300" />
            <div className="mt-4 font-display text-3xl font-semibold">{t.value}</div>
            <div className="mt-1 text-sm text-muted">{t.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { href: "/admin/submissions", icon: ClipboardCheck, title: "Evaluate submissions", text: "Open student links and enter marks." },
          { href: "/admin/batches", icon: Layers, title: "Manage batches", text: "Create a batch, add or remove its students and review their work." },
          { href: "/admin/courses", icon: IndianRupee, title: "Update prices & batches", text: "Change fees and next batch dates shown on the website." },
        ].map((a) => (
          <Link key={a.href + a.title} href={a.href} className="card card-hover group flex items-start gap-4 p-5">
            <a.icon size={20} className="mt-0.5 text-lav-300" />
            <div className="flex-1">
              <div className="font-medium">{a.title}</div>
              <div className="mt-1 text-sm text-muted">{a.text}</div>
            </div>
            <ArrowRight size={16} className="mt-1 text-subtle transition group-hover:translate-x-0.5 group-hover:text-fg" />
          </Link>
        ))}
      </div>
    </div>
  );
}
