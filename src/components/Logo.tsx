import Link from "next/link";

/** Recreates the FMB | FEED MY BRAIN lockup from the logo, so it stays crisp on dark backgrounds. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="Feed My Brain — home" className="group flex items-center gap-3">
      <span className="font-serif text-[27px] leading-none tracking-tight text-lav-100 transition group-hover:text-white">FMB</span>
      <span aria-hidden className="h-9 w-px bg-lav-300/50" />
      {!compact && (
        <span className="flex flex-col text-[10px] leading-[1.35] font-medium tracking-[0.42em] text-lav-300">
          <span>FEED</span>
          <span>MY</span>
          <span>BRAIN</span>
        </span>
      )}
    </Link>
  );
}
