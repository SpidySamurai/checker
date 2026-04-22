"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    // Redirect based on role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (!profile) {
      router.replace("/onboarding");
    } else if (profile.role === "fleet_owner") {
      router.replace("/fleet");
    } else if (profile.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/driver");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold text-sm">✓</div>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-50">Checker</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Bienvenido</h1>
          <p className="text-sm text-slate-500">Entra a tu flotilla</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <span className="text-xs text-slate-500 underline cursor-pointer">¿Olvidaste tu contraseña?</span>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿Nuevo?{" "}
          <Link href="/register" className="text-slate-900 dark:text-slate-50 underline font-medium">
            Crea una cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
