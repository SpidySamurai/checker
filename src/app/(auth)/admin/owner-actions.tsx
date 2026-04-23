"use client";

import { useState } from "react";
import { updateOwnerStatus } from "./actions";

interface Props {
  ownerId: string;
  currentStatus: string;
  ownerName: string;
}

export function OwnerActions({ ownerId, currentStatus, ownerName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(status: "active" | "suspended") {
    setLoading(true);
    setError(null);
    const result = await updateOwnerStatus(ownerId, status);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus === "trial" && (
        <button
          onClick={() => handle("active")}
          disabled={loading}
          className="px-2 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-500/40 hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/20 dark:text-green-400"
        >
          Activar
        </button>
      )}
      {currentStatus === "active" && (
        <button
          onClick={() => handle("suspended")}
          disabled={loading}
          className="px-2 py-1 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-500/40 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-400"
          title={`Suspender cuenta de ${ownerName}`}
        >
          Suspender
        </button>
      )}
      {currentStatus === "suspended" && (
        <button
          onClick={() => handle("active")}
          disabled={loading}
          className="px-2 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-500/40 hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/20 dark:text-green-400"
        >
          Reactivar
        </button>
      )}
      {loading && <span className="text-xs text-muted-sk">…</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
