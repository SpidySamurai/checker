"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/checker/platform-badge";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
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
    <main className="min-h-screen flex">
      {/* Left panel — brand hero */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-muted border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">✓</div>
          <span className="font-bold text-lg text-foreground">Checker</span>
        </div>

        {/* Hero text */}
        <div>
          <h1 className="text-6xl font-extrabold leading-[0.95] text-foreground tracking-tight">
            Maneja<br />tu flotilla.
          </h1>
          <h1 className="text-6xl font-extrabold leading-[0.95] text-primary tracking-tight mt-1">
            turno a turno.
          </h1>
          <p className="mt-6 text-base text-foreground/80 max-w-sm">
            Rastrea turnos, viajes y ganancias de cada conductor. Desde el celular, en tiempo real.
          </p>
        </div>

        {/* Platform logos */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground/80 mr-1">Compatible con</span>
          <PlatformBadge platform="uber" />
          <PlatformBadge platform="didi" />
          <PlatformBadge platform="cabify" />
          <PlatformBadge platform="indrive" />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile logo (hidden on lg) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">✓</div>
            <span className="font-bold text-foreground">Checker</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground">Bienvenido</h2>
            <p className="text-base text-foreground/80 mt-1">Entra a tu flotilla</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {resetSuccess && (
              <p className="text-sm text-primary font-medium">Contraseña actualizada. Ya puedes iniciar sesión.</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
                className="h-12 text-base px-4 rounded-xl shadow-sm border-border bg-card"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-medium">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-12 text-base px-4 rounded-xl shadow-sm border-border bg-card"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-medium text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-base text-foreground/80">
            ¿Nuevo?{" "}
            <Link href="/register" className="text-foreground underline font-bold">
              Crea una cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
