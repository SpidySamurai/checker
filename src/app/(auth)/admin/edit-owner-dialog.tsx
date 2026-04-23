"use client";

import { useState } from "react";
import { updateFleetOwner, extendTrial } from "./actions";

interface Owner {
  id: string;
  name: string;
  company_name: string | null;
  status: string;
  trial_ends_at: string | null;
}

export function EditOwnerDialog({ owner }: { owner: Owner }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extending, setExtending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await updateFleetOwner(owner.id, {
        name: fd.get("name") as string,
        company_name: fd.get("company_name") as string,
        status: fd.get("status") as "trial" | "active" | "suspended",
        trial_ends_at: fd.get("trial_ends_at") ? new Date(fd.get("trial_ends_at") as string).toISOString() : undefined,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => { setOpen(false); setSaved(false); }, 800);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleExtend(days: number) {
    setExtending(days);
    setError(null);
    try {
      const result = await extendTrial(owner.id, days);
      if (result?.error) setError(result.error);
    } finally {
      setExtending(null);
    }
  }

  const trialDate = owner.trial_ends_at
    ? new Date(owner.trial_ends_at).toISOString().split("T")[0]
    : "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1 border border-border rounded-md text-xs text-muted-sk hover:border-primary hover:text-primary transition-colors"
      >
        Editar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-paper border border-border rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-paper">
              <h2 className="font-semibold text-ink">{owner.company_name ?? owner.name}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-sk hover:text-ink text-lg leading-none">✕</button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Edit form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Nombre</label>
                  <input name="name" defaultValue={owner.name} required
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Empresa</label>
                  <input name="company_name" defaultValue={owner.company_name ?? ""} required
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink">Estado</label>
                    <select name="status" defaultValue={owner.status}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="trial">Trial</option>
                      <option value="active">Activo</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-ink">Trial hasta</label>
                    <input name="trial_ends_at" type="date" defaultValue={trialDate}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {saved && <p className="text-sm text-primary">Guardado ✓</p>}

                <button type="submit" disabled={loading}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {loading ? "Guardando…" : "Guardar cambios"}
                </button>
              </form>

              {/* Quick extend */}
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-sk uppercase tracking-wide">Extender trial rápido</p>
                <p className="text-xs text-muted-sk">
                  Se suma desde la fecha actual de expiración (o desde hoy si ya venció).
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[{ label: "+7d", days: 7 }, { label: "+30d", days: 30 }, { label: "+90d", days: 90 }, { label: "+1 año", days: 365 }].map(({ label, days }) => (
                    <button
                      key={days}
                      onClick={() => handleExtend(days)}
                      disabled={extending !== null}
                      className="py-2 border border-border rounded-lg text-sm font-medium text-ink hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                    >
                      {extending === days ? "…" : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
