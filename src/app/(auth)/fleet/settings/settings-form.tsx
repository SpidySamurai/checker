"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile } from "./actions";
import { CheckCircle2 } from "lucide-react";

interface SettingsFormProps {
  defaultName: string;
  defaultCompany: string;
  email: string;
  status: string;
  trialEndsAt: string | null;
}

export function SettingsForm({ defaultName, defaultCompany, email, status, trialEndsAt }: SettingsFormProps) {
  const [name, setName] = useState(defaultName);
  const [company, setCompany] = useState(defaultCompany);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [nowMs] = useState<number>(() => Date.now());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const result = await updateProfile(name, company);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  const trialDays = trialEndsAt
    ? Math.ceil((new Date(trialEndsAt).getTime() - nowMs) / 86400000)
    : null;

  return (
    <div className="space-y-8">
      {/* Account info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Tu cuenta</h2>
        <div className="border border-border rounded-lg divide-y divide-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-sk">Email</span>
            <span className="text-sm font-medium text-ink">{email}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-sk">Plan</span>
            <span className={`text-sm font-semibold capitalize ${status === "active" ? "text-green-600" : status === "trial" ? "text-primary" : "text-destructive"}`}>
              {status === "active" ? "Activo" : status === "trial" ? "Trial" : status}
            </span>
          </div>
          {trialDays !== null && (
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-sk">Trial</span>
              <span className={`text-sm font-medium ${trialDays < 3 ? "text-destructive" : trialDays < 7 ? "text-primary" : "text-ink"}`}>
                {trialDays > 0 ? `${trialDays} días restantes` : "Vencido"}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Edit profile */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-base font-medium">Tu nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 text-base rounded-xl border-border bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company" className="text-base font-medium">Nombre de la empresa</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="h-11 text-base rounded-xl border-border bg-card"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando…" : "Guardar cambios"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle2 size={14} /> Guardado
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
