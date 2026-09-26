import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { faqs, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Feed My Brain courses, schedules, grading, fees and refunds.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" />
      <section className="container-x max-w-3xl py-16">
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="rotate-on-open text-xl text-lav-300 transition">+</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-center text-muted">
          Still have a question?{" "}
          <a href={whatsappLink()} target="_blank" rel="noopener" className="text-lav-300 hover:text-lav-200">
            Ask us on WhatsApp
          </a>{" "}
          or{" "}
          <Link href="/contact" className="text-lav-300 hover:text-lav-200">
            send an enquiry
          </Link>
          .
        </p>
      </section>
    </>
  );
}
