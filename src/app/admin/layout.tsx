import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const profile = await requireAdmin();
  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/submissions", label: "Submissions" },
    { href: "/admin/batches", label: "Batches" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/courses", label: "Courses & pricing" },
    { href: "/admin/enquiries", label: "Enquiries" },
  ];
  return (
    <AppShell profile={profile} links={links}>
      {children}
    </AppShell>
  );
}
