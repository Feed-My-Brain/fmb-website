import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { footerNav, site, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-950">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted">{site.slogan}.</p>
          <div className="space-y-2 text-sm">
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-muted hover:text-fg">
              <Mail size={15} /> {site.email}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="flex items-center gap-2 text-muted hover:text-fg">
              <MessageCircle size={15} /> WhatsApp {site.whatsappDisplay}
            </a>
          </div>
        </div>
        {footerNav.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-subtle">{group.title}</h3>
            <ul className="space-y-2">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-start justify-between gap-2 py-5 text-xs text-subtle sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="font-mono">Built by learners, for learners.</p>
        </div>
      </div>
    </footer>
  );
}
