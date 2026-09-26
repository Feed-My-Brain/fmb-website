"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { nav } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-ink-950/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-[76px] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[15px] font-medium transition ${
                  active ? "bg-white/5 text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <Link href="/login" className="btn-ghost">
            Student login
          </Link>
          <Link href="/contact" className="btn-primary">
            Enquire now
          </Link>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-muted hover:text-fg xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav className="container-x flex flex-col gap-1 pb-5 xl:hidden" aria-label="Mobile">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-muted hover:bg-white/5 hover:text-fg">
              {item.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">
              Student login
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary">
              Enquire now
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
