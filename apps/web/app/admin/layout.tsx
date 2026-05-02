import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin — ReplyRocket" };

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/pricing", label: "Pricing" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (!session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen dashboard-bg">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-violet-200 bg-gradient-to-b from-violet-600 to-indigo-700 px-3 py-5 sm:flex">
        <Link
          href="/admin"
          className="mb-7 flex items-center gap-2 px-2 text-base font-bold text-white"
        >
          <span>🛠️</span>
          <span>ReplyRocket Admin</span>
        </Link>
        <nav className="flex flex-col gap-0.5 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-white/90 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-white/10 pt-3 text-xs text-white/80">
          <Link href="/dashboard" className="block px-3 py-2 hover:text-white">
            ↩ Back to app
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/10"
            >
              ↪ Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 sm:px-10">{children}</main>
    </div>
  );
}
