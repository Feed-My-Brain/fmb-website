import { AppShell } from "@/components/AppShell";
import { requireProfile } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const profile = await requireProfile();
  const links = [
    { href: "/dashboard", label: "My projects" },
    { href: "/dashboard/password", label: "Change password" },
    ...(profile.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <AppShell profile={profile} links={links}>
      {children}
    </AppShell>
  );
}
