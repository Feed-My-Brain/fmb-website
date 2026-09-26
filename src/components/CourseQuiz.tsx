"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

type Slug = "agentic-ai" | "ml-dl-transformers" | "data-science";

const questions: { q: string; options: { label: string; score: Partial<Record<Slug, number>> }[] }[] = [
  {
    q: "What excites you most?",
    options: [
      { label: "Building AI assistants that use tools and take actions", score: { "agentic-ai": 3 } },
      { label: "Understanding how models like GPT actually work inside", score: { "ml-dl-transformers": 3 } },
      { label: "Finding answers hidden in data and explaining them", score: { "data-science": 3 } },
    ],
  },
  {
    q: "Which project would you rather show off?",
    options: [
      { label: "A voice assistant or live agent deployed on the web", score: { "agentic-ai": 3 } },
      { label: "A mini GPT or an image classifier I trained myself", score: { "ml-dl-transformers": 3 } },
      { label: "A business dashboard that drives a real decision", score: { "data-science": 3 } },
    ],
  },
  {
    q: "How do you feel about maths?",
    options: [
      { label: "Keep it light, I want to build apps", score: { "agentic-ai": 2, "data-science": 1 } },
      { label: "I enjoy it: gradients, matrices, bring it on", score: { "ml-dl-transformers": 2 } },
      { label: "Statistics and probability sound useful", score: { "data-science": 2 } },
    ],
  },
  {
    q: "Which role sounds like future you?",
    options: [
      { label: "AI engineer / full-stack AI developer", score: { "agentic-ai": 3 } },
      { label: "ML engineer / deep learning researcher", score: { "ml-dl-transformers": 3 } },
      { label: "Data scientist / data analyst", score: { "data-science": 3 } },
    ],
  },
  {
    q: "How much time can you commit?",
    options: [
      { label: "4 months, I want to ship fast", score: { "agentic-ai": 1 } },
      { label: "5 months is fine for deeper coverage", score: { "ml-dl-transformers": 1, "data-science": 1 } },
    ],
  },
];

const results: Record<Slug, { title: string; why: string }> = {
  "agentic-ai": {
    title: "Agentic AI Development",
    why: "You want to build things that act: tool-using, database-backed, real-time AI agents. In 16 weeks you'll go from Python to a deployed agent.",
  },
  "ml-dl-transformers": {
    title: "ML, Deep Learning & Transformers",
    why: "You want to understand models from the inside: build algorithms from scratch, train neural nets in PyTorch and create your own mini GPT.",
  },
  "data-science": {
    title: "Data Science",
    why: "You love turning messy data into decisions: SQL, statistics, A/B tests, dashboards, ML and forecasting, presented like a pro.",
  },
};

export function CourseQuiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const step = answers.length;
  const done = step >= questions.length;

  const scores = answers.reduce<Record<Slug, number>>(
    (acc, optionIndex, qi) => {
      const s = questions[qi].options[optionIndex].score;
      for (const k of Object.keys(s) as Slug[]) acc[k] += s[k] ?? 0;
      return acc;
    },
    { "agentic-ai": 0, "ml-dl-transformers": 0, "data-science": 0 },
  );
  const best = (Object.keys(scores) as Slug[]).sort((a, b) => scores[b] - scores[a])[0];

  return (
    <div className="card relative overflow-hidden p-6 sm:p-10">
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-lav-500/20 blur-3xl" />
      <div className="relative">
        <div className="mb-8 flex gap-1.5" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full transition ${i < step ? "bg-lav-300" : "bg-ink-700"}`} />
          ))}
        </div>

        {!done ? (
          <div key={step}>
            <p className="font-mono text-xs text-subtle">
              Question {step + 1} of {questions.length}
            </p>
            <h3 className="h-display mt-2 text-2xl">{questions[step].q}</h3>
            <div className="mt-6 grid gap-3">
              {questions[step].options.map((o, i) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setAnswers((a) => [...a, i])}
                  className="rounded-xl border border-line-strong bg-ink-950/50 px-5 py-4 text-left text-sm transition hover:border-lav-300/70 hover:bg-lav-300/5"
                >
                  {o.label}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setAnswers((a) => a.slice(0, -1))} className="mt-5 text-sm text-muted hover:text-fg">
                ← Back
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="eyebrow">Your best match</p>
            <h3 className="h-display mt-3 text-3xl text-gradient">{results[best].title}</h3>
            <p className="mt-4 max-w-2xl leading-7 text-muted">{results[best].why}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/courses/${best}`} className="btn-primary">
                See the course <ArrowRight size={15} />
              </Link>
              <button type="button" onClick={() => setAnswers([])} className="btn-ghost">
                <RotateCcw size={15} /> Retake quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
