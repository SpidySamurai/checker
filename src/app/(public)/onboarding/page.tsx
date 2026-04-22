"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"driver" | "fleet_owner">("driver");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").upsert({ id: user.id, name, role });

    router.replace(role === "driver" ? "/driver" : "/fleet");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-xl font-bold">Welcome! Set up your account</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="border rounded px-3 py-2"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "driver" | "fleet_owner")}
          className="border rounded px-3 py-2"
        >
          <option value="driver">Driver</option>
          <option value="fleet_owner">Fleet owner</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
