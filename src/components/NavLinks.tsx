"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** App navigation that highlights the current section. The first link is treated as the section root (exact match). */
export function NavLinks({ links, variant }: { links: { href: string; label: string }[]; variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const isActive = (href: string, i: number) => (i === 0 ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return links.map((l, i) => {
    const active = isActive(l.href, i);
    const cls =
      variant === "desktop"
        ? `rounded-full px-3 py-1.5 text-sm transition ${active ? "bg-lav-300/10 text-lav-100" : "text-muted hover:bg-white/5 hover:text-fg"}`
        : `shrink-0 rounded-full border px-3 py-1 text-xs ${active ? "border-lav-300 bg-lav-300/10 text-lav-100" : "border-line text-muted"}`;
    return (
      <Link key={l.href} href={l.href} className={cls} aria-current={active ? "page" : undefined}>
        {l.label}
      </Link>
    );
  });
}
