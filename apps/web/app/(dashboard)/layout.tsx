import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="flex min-h-screen bg-[#fafafb]">
      <Sidebar email={user.email ?? ""} />
      <main className="flex-1 px-5 py-8 sm:px-10">{children}</main>
    </div>
  );
}
