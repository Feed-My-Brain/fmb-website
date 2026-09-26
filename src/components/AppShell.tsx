import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/auth";

export function AppShell({
  profile,
  links,
  children,
}: {
  profile: Profile;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-ink-950/85 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo compact />
            <nav className="hidden items-center gap-1 md:flex">
              <NavLinks links={links} variant="desktop" />
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{profile.full_name || profile.email}</div>
              <div className="font-mono text-[11px] text-subtle uppercase">{profile.role}</div>
            </div>
            <form action={signOut}>
              <button type="submit" className="btn-ghost btn-sm" title="Log out">
                <LogOut size={14} /> <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
        <nav className="container-x flex gap-1 overflow-x-auto pb-3 md:hidden">
          <NavLinks links={links} variant="mobile" />
        </nav>
      </header>
      <main className="container-x flex-1 py-10">{children}</main>
    </div>
  );
}
