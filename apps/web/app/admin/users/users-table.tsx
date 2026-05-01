"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  role: string;
  monthly_used: number;
  monthly_quota: number;
  onboarded: boolean;
  created_at: string;
}

export default function UsersTable({ users: initial }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ plan: string; role: string; monthly_quota: number }>({
    plan: "free",
    role: "user",
    monthly_quota: 30,
  });
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  function startEdit(u: UserRow) {
    setEditing(u.id);
    setDraft({ plan: u.plan, role: u.role, monthly_quota: u.monthly_quota });
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${editing}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (!res.ok) {
      toast.push({ variant: "error", title: "Save failed" });
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === editing ? { ...u, ...draft } : u)),
    );
    setEditing(null);
    toast.push({ variant: "success", title: "User updated" });
  }

  async function resetUsage(id: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthly_used: 0 }),
    });
    setBusy(false);
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, monthly_used: 0 } : u)),
      );
      toast.push({ variant: "success", title: "Usage reset" });
    }
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Permanently delete ${email}? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.push({ variant: "success", title: "Account deleted" });
    } else {
      toast.push({ variant: "error", title: "Delete failed" });
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Usage</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isEditing = editing === u.id;
            return (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {u.full_name || u.email.split("@")[0]}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <Select
                      value={draft.plan}
                      onChange={(e) =>
                        setDraft({ ...draft, plan: e.target.value })
                      }
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="team">Team</option>
                    </Select>
                  ) : (
                    <Badge
                      variant={u.plan === "free" ? "muted" : "info"}
                      className="capitalize"
                    >
                      {u.plan}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <Select
                      value={draft.role}
                      onChange={(e) =>
                        setDraft({ ...draft, role: e.target.value })
                      }
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                  ) : (
                    <Badge
                      variant={u.role === "admin" ? "warning" : "default"}
                      className="capitalize"
                    >
                      {u.role}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={draft.monthly_quota}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          monthly_quota: Number(e.target.value),
                        })
                      }
                      className="w-20"
                    />
                  ) : (
                    <span>
                      {u.monthly_used}{" "}
                      <span className="text-gray-400">/ {u.monthly_quota}</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-1">
                      <Button size="sm" loading={busy} onClick={save}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(u)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resetUsage(u.id)}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteUser(u.id, u.email)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
