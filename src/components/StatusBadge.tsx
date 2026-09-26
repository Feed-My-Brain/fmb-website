export function StatusBadge({ status }: { status: "not_submitted" | "submitted" | "evaluated" }) {
  const map = {
    not_submitted: { label: "Not submitted", cls: "border-line-strong text-subtle" },
    submitted: { label: "Submitted · awaiting review", cls: "border-amber-300/40 bg-amber-300/10 text-amber-200" },
    evaluated: { label: "Evaluated", cls: "border-mint-glow/40 bg-mint-glow/10 text-mint-glow" },
  }[status];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map.cls}`}>{map.label}</span>;
}
