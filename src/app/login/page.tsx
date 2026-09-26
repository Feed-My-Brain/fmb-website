import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getProfile } from "@/lib/auth";
import { whatsappLink } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Student login", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const profile = await getProfile();
  if (profile) redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  const { next } = await searchParams;

  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden px-4 py-16">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-lav-500/25 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-7">
          <h1 className="h-display text-2xl">Welcome back</h1>
          <p className="mt-1.5 mb-6 text-sm text-muted">Log in to submit projects and see your marks.</p>
          <LoginForm next={typeof next === "string" ? next : undefined} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Forgot your password?{" "}
          <a href={whatsappLink("Hi! I need help resetting my Feed My Brain student password.")} target="_blank" rel="noopener" className="text-lav-300 hover:text-lav-200">
            Message us on WhatsApp
          </a>
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          Not a student yet?{" "}
          <Link href="/courses" className="text-lav-300 hover:text-lav-200">
            Explore courses
          </Link>
        </p>
      </div>
    </main>
  );
}
