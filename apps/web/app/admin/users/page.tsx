import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UsersTable from "./users-table";

export default async function AdminUsers() {
  const session = await requireAdmin();
  if (!session) return null;

  const { data: users, error } = await session.admin
    .from("profiles")
    .select("id, email, full_name, plan, role, monthly_used, monthly_quota, onboarded, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-gray-600">
            {users?.length ?? 0} accounts. Click any row to edit plan, quota, or role.
          </p>
        </div>
        <Badge variant="info">Admin only</Badge>
      </div>

      <Card className="mt-6 overflow-hidden">
        {error ? (
          <p className="p-6 text-sm text-red-600">{error.message}</p>
        ) : (
          <UsersTable users={users ?? []} />
        )}
      </Card>
    </div>
  );
}
