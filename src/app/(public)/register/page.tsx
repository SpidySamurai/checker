"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { completeRegistration } from "./actions";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    // 1. Create auth user (client-side is fine — just email+password)
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Create profile + fleet server-side (role hardcoded in server action)
    const result = await completeRegistration(form.name, form.company);
    if ("error" in result) {
      setError(result.error ?? null);
      setLoading(false);
      return;
    }

    router.replace("/fleet");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold text-sm">✓</div>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-50">Checker</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Crea tu flotilla</h1>
          <p className="text-sm text-slate-500">14 días gratis · sin tarjeta de crédito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tu nombre</Label>
            <Input id="name" value={form.name} onChange={set("name")} placeholder="Juan Pérez" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Nombre de la empresa</Label>
            <Input id="company" value={form.company} onChange={set("company")} placeholder="Flotilla Los Halcones" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="tu@correo.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="mín. 8 caracteres" minLength={8} required />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-slate-900 dark:text-slate-50 underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
