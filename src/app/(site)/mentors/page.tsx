import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { PageHero } from "@/components/ui";
import { mentors } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentors",
  description: "Meet the mentors who teach Feed My Brain courses.",
};

export default function MentorsPage() {
  return (
    <>
      <PageHero eyebrow="Mentors" title="Learn from people who build and teach AI">
        Our mentors teach live, run the labs and review your projects themselves.
      </PageHero>
      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {mentors.map((m) => (
            <article key={m.name} className="card relative overflow-hidden p-8">
              <div className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-lav-500/20 blur-3xl" />
              <div className="relative flex items-center gap-5">
                <span className="grid size-20 place-items-center rounded-2xl border border-line-strong bg-gradient-to-br from-lav-400/30 to-cyan-glow/10">
                  <UserRound size={36} className="text-lav-200" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="h-display text-2xl">{m.name}</h2>
                  <p className="text-sm text-lav-300">{m.role}</p>
                </div>
              </div>
              <p className="relative mt-6 text-lg leading-8 text-muted">{m.bio}</p>
              <div className="relative mt-6 flex flex-wrap gap-2">
                {m.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
