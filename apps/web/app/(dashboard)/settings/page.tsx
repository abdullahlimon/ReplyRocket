"use client";

import { useEffect, useState } from "react";
import {
  GOALS,
  GOAL_LABELS,
  TONES,
  TONE_LABELS,
  type Goal,
  type Tone,
} from "@replyrocket/shared";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const toast = useToast();
  const [tone, setTone] = useState<Tone>("friendly");
  const [goal, setGoal] = useState<Goal>("follow_up");
  const [insertMode, setInsertMode] = useState<"replace" | "append">("replace");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings) {
          setTone(d.settings.default_tone);
          setGoal(d.settings.default_goal);
          setInsertMode(d.settings.insert_mode);
        }
        if (d?.profile) {
          setFullName(d.profile.full_name ?? "");
          setEmail(d.profile.email ?? "");
        }
      })
      .catch(() => {});
  }, []);

  async function savePrefs() {
    setSavingPrefs(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        default_tone: tone,
        default_goal: goal,
        insert_mode: insertMode,
      }),
    });
    setSavingPrefs(false);
    toast.push({
      variant: res.ok ? "success" : "error",
      title: res.ok ? "Defaults saved" : "Save failed",
    });
  }

  async function saveProfile() {
    setSavingProfile(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName.trim() || null }),
    });
    setSavingProfile(false);
    toast.push({
      variant: res.ok ? "success" : "error",
      title: res.ok ? "Profile updated" : "Save failed",
    });
  }

  async function deleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/profile", { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/?deleted=1";
    } else {
      const j = await res.json().catch(() => ({}));
      setDeleting(false);
      toast.push({
        variant: "error",
        title: "Delete failed",
        description: j.error || "Try again or contact support.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Profile, defaults, and account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How we address you in drafts.</CardDescription>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
            />
          </div>
          <div>
            <Button onClick={saveProfile} loading={savingProfile} size="sm">
              Save profile
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply defaults</CardTitle>
          <CardDescription>
            Pre-selected when you open the extension popover.
          </CardDescription>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label>Default tone</Label>
            <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {TONE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Default goal</Label>
            <Select value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {GOAL_LABELS[g]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Insert mode</Label>
            <Select
              value={insertMode}
              onChange={(e) => setInsertMode(e.target.value as "replace" | "append")}
            >
              <option value="replace">Replace existing draft</option>
              <option value="append">Append to existing draft</option>
            </Select>
          </div>
          <div>
            <Button onClick={savePrefs} loading={savingPrefs} size="sm">
              Save defaults
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Delete account</CardTitle>
          <CardDescription>
            Permanently remove your account, voice profile, and all reply history. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardBody>
          {!confirmDelete ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              Delete account
            </Button>
          ) : (
            <div className="space-y-3">
              <Label>
                Type <code className="rounded bg-red-50 px-1.5 py-0.5 text-red-700">DELETE</code> to confirm:
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleting}
                  disabled={deleteConfirmText !== "DELETE"}
                  onClick={deleteAccount}
                >
                  I understand, delete everything
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteConfirmText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
