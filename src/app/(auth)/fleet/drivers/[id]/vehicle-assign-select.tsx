"use client";

import { useState } from "react";
import { assignVehicle } from "../actions";

interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
}

interface Props {
  driverId: string;
  currentVehicleId: string | null;
  vehicles: Vehicle[];
}

export function VehicleAssignSelect({ driverId, currentVehicleId, vehicles }: Props) {
  const [value, setValue] = useState(currentVehicleId ?? "none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleChange(vehicleId: string) {
    setValue(vehicleId);
    setLoading(true);
    setError(null);
    setSaved(false);
    const result = await assignVehicle(driverId, vehicleId === "none" ? null : vehicleId);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-sk uppercase tracking-wide">Vehículo asignado</label>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
          className="border border-border rounded-md text-sm bg-paper px-3 py-2 text-ink disabled:opacity-50"
        >
          <option value="none">Sin vehículo</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.plate} — {v.make} {v.model}</option>
          ))}
        </select>
        {loading && <span className="text-xs text-muted-sk">Guardando…</span>}
        {saved && <span className="text-xs text-primary">Guardado ✓</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
