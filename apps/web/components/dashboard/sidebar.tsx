"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  accent: string; // tailwind gradient classes for the icon chip
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "🏠", accent: "from-violet-500 to-indigo-600" },
  { href: "/try", label: "Playground", icon: "✨", accent: "from-sky-500 to-blue-600" },
  { href: "/history", label: "History", icon: "📜", accent: "from-amber-500 to-orange-600" },
  { href: "/voice", label: "Voice", icon: "🎙️", accent: "from-rose-500 to-pink-600" },
  { href: "/settings", label: "Settings", icon: "⚙️", accent: "from-emerald-500 to-teal-600" },
];

export function Sidebar({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-3 py-5 sm:flex">
      <Link href="/dashboard" className="mb-7 flex items-center gap-2 px-2 text-base font-bold tracking-tight">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          🚀
        </span>
        <span>ReplyRocket</span>
      </Link>

      <nav className="flex flex-col gap-0.5 text-sm">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                active
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-md text-xs",
                  active
                    ? `bg-gradient-to-br ${item.accent} text-white shadow-sm`
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="mt-3 flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 px-2.5 py-2 text-sm font-medium text-violet-700 hover:from-violet-100 hover:to-indigo-100"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 text-xs text-white shadow-sm">
              🛠️
            </span>
            Admin
          </Link>
        )}
      </nav>

      <div className="mt-auto border-t border-gray-100 pt-3">
        <div className="px-3 pb-3 text-xs">
          <p className="text-gray-400">Signed in as</p>
          <p className="truncate text-gray-700">{email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            ↪ Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
