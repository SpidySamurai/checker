"use client";

import { useState } from "react";
import { completeOnboarding } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await completeOnboarding(name);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // redirect("/driver") called inside server action on success
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-7">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">✓</div>
          <span className="font-bold text-foreground">Checker</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-foreground">¡Bienvenido!</h2>
          <p className="text-base text-foreground/80 mt-1">
            Cuéntanos tu nombre para empezar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-base font-medium">Tu nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
              autoFocus
              className="h-12 text-base px-4 rounded-xl shadow-sm border-border bg-card"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Guardando…" : "Continuar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
