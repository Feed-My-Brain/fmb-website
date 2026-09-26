import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden px-4 py-24 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <p className="font-mono text-sm text-lav-300">error 404 · brain.not_found</p>
        <h1 className="h-display mt-3 text-4xl">This page wandered off</h1>
        <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">
            Go home
          </Link>
          <Link href="/courses" className="btn-ghost">
            See courses
          </Link>
        </div>
      </div>
    </main>
  );
}
