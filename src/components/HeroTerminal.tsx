"use client";

import { useEffect, useState } from "react";

type Line = { kind: "cmd" | "out" | "ok"; text: string };

const script: Line[] = [
  { kind: "cmd", text: "fmb enroll --student you --course agentic-ai" },
  { kind: "out", text: "Loading 16-week roadmap ..." },
  { kind: "ok", text: "week 01  CLI quiz game                 shipped" },
  { kind: "ok", text: "week 05  Canteen management API        shipped" },
  { kind: "ok", text: "week 08  College handbook RAG bot      shipped" },
  { kind: "ok", text: "week 12  Multi-agent content team      shipped" },
  { kind: "ok", text: "week 16  Real-time AI agent            deployed" },
  { kind: "out", text: "Portfolio: 15 projects + 1 capstone on GitHub" },
  { kind: "cmd", text: "fmb status" },
  { kind: "ok", text: "brain.fed = true  // trailblazer unlocked" },
];

export function HeroTerminal() {
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (shown >= script.length) return;
      const t = setTimeout(() => setShown(script.length), 0);
      return () => clearTimeout(t);
    }
    if (shown >= script.length) {
      const t = setTimeout(() => {
        setShown(0);
        setTyped("");
      }, 4500);
      return () => clearTimeout(t);
    }
    const line = script[shown];
    if (line.kind === "cmd" && typed.length < line.text.length) {
      const t = setTimeout(() => setTyped(line.text.slice(0, typed.length + 1)), 38);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => {
        setShown((s) => s + 1);
        setTyped("");
      },
      line.kind === "cmd" ? 350 : 420,
    );
    return () => clearTimeout(t);
  }, [shown, typed]);

  const current = script[shown];

  return (
    <div className="card relative overflow-hidden shadow-[0_30px_80px_-30px_rgb(132_102_245/0.55)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]/80" />
        <span className="size-3 rounded-full bg-[#febc2e]/80" />
        <span className="size-3 rounded-full bg-[#28c840]/80" />
        <span className="ml-3 font-mono text-xs text-subtle">~/feed-my-brain</span>
      </div>
      <div className="h-[330px] overflow-hidden p-5 font-mono text-[10.5px] leading-7 sm:text-[13px]" aria-hidden>
        {script.slice(0, shown).map((l, i) => (
          <TerminalLine key={i} line={l} />
        ))}
        {current?.kind === "cmd" && (
          <div className="whitespace-pre">
            <span className="text-mint-glow">$ </span>
            <span className="text-fg">{typed}</span>
            <span className="animate-blink text-lav-300">▋</span>
          </div>
        )}
        {shown >= script.length && (
          <div>
            <span className="text-mint-glow">$ </span>
            <span className="animate-blink text-lav-300">▋</span>
          </div>
        )}
      </div>
      <p className="sr-only">An animated terminal showing a student shipping weekly projects and deploying a real-time AI agent.</p>
    </div>
  );
}

function TerminalLine({ line }: { line: Line }) {
  if (line.kind === "cmd")
    return (
      <div className="whitespace-pre">
        <span className="text-mint-glow">$ </span>
        <span className="text-fg">{line.text}</span>
      </div>
    );
  if (line.kind === "ok")
    return (
      <div className="whitespace-pre text-lav-200">
        <span className="text-cyan-glow">✓ </span>
        {line.text}
      </div>
    );
  return <div className="whitespace-pre text-subtle">{line.text}</div>;
}
