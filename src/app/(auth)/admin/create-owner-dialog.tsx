"use client";

import { useState } from "react";
import { createFleetOwner } from "./actions";

export function CreateOwnerDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createFleetOwner(new FormData(e.currentTarget));
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => { setOpen(false); setSuccess(false); }, 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
      >
        + Crear fleet owner
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-paper border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-ink">Nuevo fleet owner</h2>
          <button onClick={() => setOpen(false)} className="text-muted-sk hover:text-ink text-lg leading-none">✕</button>
        </div>

        {success ? (
          <div className="px-6 py-8 text-center text-primary font-medium">
            ✓ Invitación enviada — el usuario recibirá un email para configurar su cuenta.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Nombre completo</label>
              <input name="name" required placeholder="Juan Pérez"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-canvas placeholder:text-muted-sk focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Email</label>
              <input name="email" type="email" required placeholder="juan@empresa.com"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-canvas placeholder:text-muted-sk focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Empresa / Flotilla</label>
              <input name="company" required placeholder="Transportes XYZ"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-canvas placeholder:text-muted-sk focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Días de trial</label>
              <div className="flex gap-2">
                <input name="trial_days" type="number" min="1" max="365" defaultValue="14"
                  className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {[7, 14, 30, 90].map((d) => (
                  <button key={d} type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.closest("form")?.querySelector<HTMLInputElement>("input[name=trial_days]");
                      if (input) input.value = String(d);
                    }}
                    className="px-2.5 py-1.5 border border-border rounded-md text-xs text-muted-sk hover:border-primary hover:text-primary transition-colors">
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-ink hover:bg-tint transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {loading ? "Enviando…" : "Crear y enviar invitación"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
