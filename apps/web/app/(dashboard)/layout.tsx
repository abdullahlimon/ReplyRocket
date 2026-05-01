import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-white px-4 py-6 sm:flex">
        <Link href="/dashboard" className="mb-8 text-lg font-bold">
          🚀 ReplyRocket
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-gray-100">
            Overview
          </Link>
          <Link href="/history" className="rounded px-3 py-2 hover:bg-gray-100">
            History
          </Link>
          <Link href="/voice" className="rounded px-3 py-2 hover:bg-gray-100">
            Voice
          </Link>
          <Link href="/settings" className="rounded px-3 py-2 hover:bg-gray-100">
            Settings
          </Link>
        </nav>
        <div className="mt-auto text-xs text-gray-500">{user.email}</div>
      </aside>
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
