import type { ReactNode } from "react";
import { Bot, BrainCircuit, ChartNoAxesCombined } from "lucide-react";
import { courseAccent } from "@/lib/courses";

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="h-display text-3xl sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-base leading-7 text-muted">{children}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-lav-500/20 blur-3xl" />
      <div className="container-x relative py-16 sm:py-20">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="h-display max-w-3xl text-4xl sm:text-5xl">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-lg leading-8 text-muted">{children}</div>}
      </div>
    </section>
  );
}

export function CourseIcon({ slug, size = 22 }: { slug: string; size?: number }) {
  const accent = courseAccent[slug];
  const Icon = accent?.icon === "brain" ? BrainCircuit : accent?.icon === "chart" ? ChartNoAxesCombined : Bot;
  return (
    <span
      className="grid size-11 place-items-center rounded-xl text-ink-950"
      style={{ background: `linear-gradient(135deg, ${accent?.from}, ${accent?.to})` }}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-fg sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-muted sm:text-sm">{label}</div>
    </div>
  );
}
