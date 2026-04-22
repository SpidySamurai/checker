"use client";

import { useState, useEffect } from "react";
import { checkIn, checkOut, logTrip } from "./actions";
import { PlatformBadge } from "@/components/checker/platform-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, TrendingUp, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface Trip {
  id: string;
  platform: string;
  netAmount: number;
  grossAmount: number;
  distanceKm: number | null;
  createdAt: string;
}

interface Props {
  driverName: string;
  activeShift: { id: string; checkIn: string } | null;
  shiftTrips: Trip[];
}

function useDuration(checkIn: string | null) {
  const [duration, setDuration] = useState("0:00");
  useEffect(() => {
    if (!checkIn) return;
    const tick = () => {
      const ms = Date.now() - new Date(checkIn).getTime();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setDuration(`${h}:${String(m).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [checkIn]);
  return duration;
}

export function DriverDashboardClient({ driverName, activeShift, shiftTrips }: Props) {
  const [loading, setLoading] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);
  const [platform, setPlatform] = useState("");

  const duration = useDuration(activeShift?.checkIn ?? null);
  const netTotal = shiftTrips.reduce((s, t) => s + t.netAmount, 0);
  const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

  async function handleCheckIn() {
    setLoading(true);
    await checkIn();
    setLoading(false);
  }

  async function handleCheckOut() {
    if (!activeShift) return;
    setLoading(true);
    await checkOut(activeShift.id);
    setLoading(false);
  }

  async function handleLogTrip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeShift) return;
    setTripError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("platform", platform);
    const result = await logTrip(activeShift.id, fd);
    setLoading(false);
    if ("error" in result) {
      setTripError(result.error);
    } else {
      setTripOpen(false);
      setPlatform("");
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col max-w-sm mx-auto">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
          {driverName[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Hola, {driverName.split(" ")[0]}</p>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" })}</p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Shift status card */}
        <div className={cn(
          "rounded-xl border p-5 text-center",
          activeShift
            ? "border-orange-500/40 bg-orange-50 dark:bg-orange-950/20"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        )}>
          {activeShift ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-1">Turno activo</p>
              <p className="text-5xl font-bold font-mono text-slate-900 dark:text-slate-50">{duration}</p>
              <p className="text-xs text-slate-500 mt-1">
                desde {new Date(activeShift.checkIn).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} hrs
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-1">Sin turno activo</p>
              <p className="text-xs text-slate-400">Toca Iniciar turno para comenzar</p>
            </>
          )}
        </div>

        {/* Stats row */}
        {activeShift && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1"><TrendingUp size={13} /><span className="text-xs uppercase tracking-wide font-semibold">Viajes</span></div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{shiftTrips.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Car size={13} /><span className="text-xs uppercase tracking-wide font-semibold">Ganado</span></div>
              <p className="text-2xl font-bold text-orange-500">{fmt.format(netTotal)}</p>
            </div>
          </div>
        )}

        {/* Log trip button */}
        {activeShift && (
          <Dialog open={tripOpen} onOpenChange={setTripOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors">
                <Plus size={20} />
                Registrar viaje
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar viaje</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLogTrip} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona plataforma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uber">Uber</SelectItem>
                      <SelectItem value="didi">Didi</SelectItem>
                      <SelectItem value="cabify">Cabify</SelectItem>
                      <SelectItem value="indrive">InDrive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="gross">Monto bruto</Label>
                    <Input id="gross" name="gross" type="number" step="0.01" min="0" placeholder="$0.00" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="net">Monto neto</Label>
                    <Input id="net" name="net" type="number" step="0.01" min="0" placeholder="$0.00" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="distance">Km (opcional)</Label>
                  <Input id="distance" name="distance" type="number" step="0.1" min="0" placeholder="0.0" />
                </div>
                {tripError && <p className="text-sm text-red-600">{tripError}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setTripOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
                    {loading ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Check in / out button */}
        <button
          onClick={activeShift ? handleCheckOut : handleCheckIn}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50",
            activeShift
              ? "border-2 border-slate-900 dark:border-slate-50 text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800"
              : "bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
          )}
        >
          <Clock size={18} />
          {activeShift ? "Terminar turno" : "Iniciar turno"}
        </button>

        {/* Recent trips */}
        {shiftTrips.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Viajes de este turno</p>
            <div className="space-y-2">
              {shiftTrips.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <PlatformBadge platform={t.platform} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      {t.distanceKm ? ` · ${t.distanceKm} km` : ""}
                    </p>
                  </div>
                  <p className="font-semibold text-sm text-orange-500">{fmt.format(t.netAmount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-3 px-2 py-2">
        {[
          { icon: Clock, label: "Inicio",    active: true  },
          { icon: TrendingUp, label: "Historial" },
          { icon: Car,  label: "Perfil" },
        ].map(({ icon: Icon, label, active }) => (
          <button key={label} className={cn(
            "flex flex-col items-center gap-0.5 py-1.5 rounded-md text-xs transition-colors",
            active ? "text-orange-500 font-semibold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}>
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
