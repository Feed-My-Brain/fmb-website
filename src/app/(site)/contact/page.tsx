import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { PageHero } from "@/components/ui";
import { courses } from "@/lib/courses";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Enquire about Feed My Brain courses, batches and fees.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { course } = await searchParams;
  const defaultCourse = typeof course === "string" && courses.some((c) => c.slug === course) ? course : undefined;

  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk about your next step">
        Ask about batches, fees or which course fits you. WhatsApp is the quickest way to reach us.
      </PageHero>
      <section className="container-x grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <a href={whatsappLink()} target="_blank" rel="noopener" className="card card-hover flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
              <MessageCircle size={20} />
            </span>
            <span>
              <span className="block text-xs text-subtle">WhatsApp</span>
              <span className="font-medium">{site.whatsappDisplay}</span>
            </span>
          </a>
          <a href={`mailto:${site.email}`} className="card card-hover flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-lav-300/15 text-lav-300">
              <Mail size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-subtle">Email</span>
              <span className="block truncate font-medium">{site.email}</span>
            </span>
          </a>
        </div>
        <LeadForm kind={defaultCourse ? "enquiry" : "contact"} defaultCourse={defaultCourse} courses={courses.map(({ slug, shortTitle }) => ({ slug, shortTitle }))} />
      </section>
    </>
  );
}
