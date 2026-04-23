"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeDriverFromFleet } from "../actions";
import { Trash2 } from "lucide-react";

export function RemoveDriverButton({ driverId, driverName }: { driverId: string; driverName: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRemove() {
    setLoading(true);
    const result = await removeDriverFromFleet(driverId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setConfirm(false);
    } else {
      router.replace("/fleet/drivers");
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-destructive border border-destructive/40 hover:bg-destructive/5 transition-colors"
      >
        <Trash2 size={14} />
        Eliminar de flotilla
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-destructive font-medium">¿Confirmar?</span>
      <button
        onClick={handleRemove}
        disabled={loading}
        className="px-3 py-1.5 rounded-md text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
      >
        {loading ? "Eliminando…" : `Sí, eliminar a ${driverName.split(" ")[0]}`}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground"
      >
        Cancelar
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
