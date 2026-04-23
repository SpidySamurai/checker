"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MailCheck } from "lucide-react";

interface FormState {
  name: string;
  company: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({ name: "", company: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          company_name: form.company,
        },
        emailRedirectTo: `${location.origin}/auth/callback?next=/fleet`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user?.identities?.length === 0) {
      setError("Este email ya está registrado. Inicia sesión.");
      setLoading(false);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <MailCheck className="text-primary" size={28} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Revisa tu correo</h2>
            <p className="text-base text-foreground/80">
              Enviamos un enlace de confirmación a <span className="font-semibold text-foreground">{form.email}</span>.
              Haz clic en él para activar tu cuenta.
            </p>
          </div>
          <p className="text-sm text-foreground/60">
            ¿Ya confirmaste?{" "}
            <Link href="/login" className="text-foreground underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-muted border-r border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">✓</div>
          <span className="font-bold text-lg text-foreground">Checker</span>
        </div>

        <div>
          <h1 className="text-5xl font-extrabold leading-tight text-foreground tracking-tight">
            Gestiona tu flotilla.<br />
            <span className="text-primary">Crece con datos.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-base text-foreground/80">
            {[
              "✦ 14 días gratis · sin tarjeta de crédito",
              "✦ Rastrea turnos y viajes en tiempo real",
              "✦ Compatible con Uber, Didi, Cabify, InDrive",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-foreground/60">Checker · Para flotillas en Latinoamérica</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-7">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">✓</div>
            <span className="font-bold text-foreground">Checker</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground">Crea tu flotilla</h2>
            <p className="text-base text-foreground/80 mt-1">14 días gratis · sin tarjeta de crédito</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-base font-medium">Tu nombre</Label>
              <Input id="name" value={form.name} onChange={set("name")} placeholder="Juan Pérez" required className="h-12 text-base px-4 rounded-xl shadow-sm border-border bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-base font-medium">Nombre de la empresa</Label>
              <Input id="company" value={form.company} onChange={set("company")} placeholder="Flotilla Los Halcones" required className="h-12 text-base px-4 rounded-xl shadow-sm border-border bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="tu@correo.com" required autoComplete="email" className="h-12 text-base px-4 rounded-xl shadow-sm border-border bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-base font-medium">Contraseña</Label>
              <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="mín. 8 caracteres" minLength={8} required autoComplete="new-password" className="h-12 text-base px-4 rounded-xl shadow-sm border-border bg-card" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-center text-base text-foreground/80">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-foreground underline font-bold">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
