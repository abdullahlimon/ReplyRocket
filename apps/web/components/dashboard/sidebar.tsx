"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/try", label: "Playground", icon: "✨" },
  { href: "/history", label: "History", icon: "📜" },
  { href: "/voice", label: "Voice", icon: "🎙️" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-3 py-5 sm:flex">
      <Link href="/dashboard" className="mb-7 flex items-center gap-2 px-2 text-base font-bold tracking-tight">
        <span>🚀</span>
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
                "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
                active
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
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
