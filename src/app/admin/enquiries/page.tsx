import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { courses } from "@/lib/courses";
import { createSessionClient } from "@/lib/supabase/server";
import { Select } from "@/components/Select";
import { updateLeadStatus } from "../actions";

export const metadata: Metadata = { title: "Enquiries", robots: { index: false } };

type Lead = {
  id: string;
  kind: "contact" | "enquiry" | "college";
  name: string;
  email: string | null;
  phone: string | null;
  college: string | null;
  course: string | null;
  message: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
};

const kindLabel = { contact: "Contact", enquiry: "Course enquiry", college: "College partnership" };
const statusCls = { new: "text-amber-200 border-amber-300/40 bg-amber-300/10", contacted: "text-lav-200 border-lav-300/40 bg-lav-300/10", closed: "text-subtle border-line" };

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const { status } = await searchParams;
  const filter = typeof status === "string" && ["new", "contacted", "closed"].includes(status) ? status : "";

  const supabase = await createSessionClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(300);
  if (filter) query = query.eq("status", filter);
  const { data } = await query;
  const leads = (data as Lead[] | null) ?? [];

  const wa = (phone: string) => {
    const d = phone.replace(/\D/g, "");
    return `https://wa.me/${d.length === 10 ? "91" + d : d}`;
  };

  return (
    <div>
      <h1 className="h-display text-3xl">Enquiries</h1>
      <p className="mt-2 text-sm text-muted">Messages from the Contact, course enquiry and For colleges forms.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["", "All"],
          ["new", "New"],
          ["contacted", "Contacted"],
          ["closed", "Closed"],
        ].map(([v, l]) => (
          <Link
            key={v}
            href={v ? `/admin/enquiries?status=${v}` : "/admin/enquiries"}
            className={`rounded-full border px-3 py-1.5 text-xs ${filter === v ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted hover:text-fg"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-muted">No enquiries yet.</div>
      ) : (
        <ul className="mt-8 space-y-3">
          {leads.map((l) => (
            <li key={l.id} className="card grid gap-4 p-5 md:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{l.name}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusCls[l.status]}`}>{l.status}</span>
                  <span className="chip">{kindLabel[l.kind]}</span>
                  {l.course && <span className="chip">{courses.find((c) => c.slug === l.course)?.shortTitle ?? l.course}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  {l.phone && (
                    <a href={wa(l.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-fg">
                      <MessageCircle size={13} /> {l.phone}
                    </a>
                  )}
                  {l.email && (
                    <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 break-all hover:text-fg">
                      <Mail size={13} /> {l.email}
                    </a>
                  )}
                  {l.college && <span>{l.college}</span>}
                </div>
                {l.message && <p className="mt-3 rounded-lg bg-ink-950/60 px-3 py-2 text-sm whitespace-pre-line text-muted">{l.message}</p>}
                <div className="mt-2 text-[11px] text-subtle">
                  {new Date(l.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
                </div>
              </div>
              <form action={updateLeadStatus} className="w-36">
                <input type="hidden" name="leadId" value={l.id} />
                <Select
                  size="sm"
                  autoSubmit
                  name="status"
                  defaultValue={l.status}
                  aria-label="Status"
                  options={[
                    { value: "new", label: "New" },
                    { value: "contacted", label: "Contacted" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
