import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl">🚀</span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">404 — page not found</h1>
      <p className="mt-2 max-w-md text-gray-600">
        That page got intercepted somewhere. Let&rsquo;s get you back.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button>Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
