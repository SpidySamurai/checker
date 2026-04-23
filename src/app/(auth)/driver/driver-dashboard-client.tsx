"use client";

import { useState, useEffect } from "react";
import { checkIn, checkOut, logTrip, deleteTrip } from "./actions";
import { PlatformBadge } from "@/components/checker/platform-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, TrendingUp, DollarSign, History, LogOut, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Trip {
  id: string;
  platform: string;
  netAmount: number;
  grossAmount: number;
  distanceKm: number | null;
  createdAt: string;
}

interface PastShift {
  id: string;
  checkIn: string;
  checkOut: string;
  tripCount: number;
  earnings: number;
}

interface Props {
  driverName: string;
  activeShift: { id: string; checkIn: string } | null;
  shiftTrips: Trip[];
  pastShifts: PastShift[];
  weekEarnings: number;
  monthEarnings: number;
}

type Tab = "home" | "history" | "profile";

function useDuration(checkInTime: string | null) {
  const [duration, setDuration] = useState("0:00");
  useEffect(() => {
    if (!checkInTime) return;
    const tick = () => {
      const ms = Date.now() - new Date(checkInTime).getTime();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setDuration(`${h}:${String(m).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [checkInTime]);
  return duration;
}

const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

export function DriverDashboardClient({ driverName, activeShift, shiftTrips, pastShifts, weekEarnings, monthEarnings }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [loading, setLoading] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);
  const [shiftError, setShiftError] = useState<string | null>(null);
  const [platform, setPlatform] = useState("");
  const router = useRouter();

  const duration = useDuration(activeShift?.checkIn ?? null);
  const netTotal = shiftTrips.reduce((s, t) => s + t.netAmount, 0);

  async function handleCheckIn() {
    setLoading(true);
    setShiftError(null);
    const result = await checkIn();
    setLoading(false);
    if ("error" in result) setShiftError(result.error ?? null);
  }

  async function handleCheckOut() {
    if (!activeShift) return;
    setLoading(true);
    setShiftError(null);
    const result = await checkOut(activeShift.id);
    setLoading(false);
    if ("error" in result) setShiftError(result.error ?? null);
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
      setTripError(result.error ?? null);
    } else {
      setTripOpen(false);
      setPlatform("");
      (e.target as HTMLFormElement).reset();
    }
  }

  async function handleDeleteTrip(tripId: string) {
    if (!confirm("¿Eliminar este viaje?")) return;
    setLoading(true);
    const result = await deleteTrip(tripId);
    setLoading(false);
    if (result?.error) alert(result.error);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-sm mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-border">
        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm">
          {driverName[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">Hola, {driverName.split(" ")[0]}</p>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" })}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-4 overflow-auto">

        {/* HOME TAB */}
        {activeTab === "home" && (
          <>
            {/* Earnings summary pills */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Esta semana</p>
                <p className="font-bold text-primary text-base">{fmt.format(weekEarnings)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Este mes</p>
                <p className="font-bold text-foreground text-base">{fmt.format(monthEarnings)}</p>
              </div>
            </div>

            {/* NO SHIFT */}
            {!activeShift && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Sin turno activo</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Toca el botón para comenzar</p>
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="h-44 w-44 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Clock size={32} />
                  <span className="font-bold text-lg">Iniciar</span>
                  <span className="text-xs opacity-80">turno</span>
                </button>
                {shiftError && <p className="text-sm text-destructive text-center">{shiftError}</p>}
              </div>
            )}

            {/* ACTIVE SHIFT */}
            {activeShift && (
              <>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Turno activo</p>
                  <p className="text-6xl font-bold font-mono text-foreground leading-none">{duration}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    desde {new Date(activeShift.checkIn).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} hrs
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                      <TrendingUp size={13} />
                      <span className="text-xs uppercase tracking-wide font-semibold">Viajes</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{shiftTrips.length}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                      <DollarSign size={13} />
                      <span className="text-xs uppercase tracking-wide font-semibold">Ganado</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">{fmt.format(netTotal)}</p>
                  </div>
                </div>

                <Dialog open={tripOpen} onOpenChange={setTripOpen}>
                  <DialogTrigger render={
                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all" />
                  }>
                    <Plus size={20} />
                    Registrar viaje
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar viaje</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLogTrip} className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <Label>Plataforma</Label>
                        <Select value={platform} onValueChange={(val) => setPlatform(val ?? "")} required>
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
                      {tripError && <p className="text-sm text-destructive">{tripError}</p>}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setTripOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Guardando…" : "Guardar"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {shiftError && <p className="text-sm text-destructive text-center">{shiftError}</p>}

                {shiftTrips.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Viajes de este turno</p>
                    <div className="space-y-2">
                      {shiftTrips.map((t) => (
                        <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 bg-card border border-border rounded-lg">
                          <PlatformBadge platform={t.platform} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                              {t.distanceKm ? ` · ${t.distanceKm} km` : ""}
                            </p>
                          </div>
                          <p className="font-semibold text-sm text-primary">{fmt.format(t.netAmount)}</p>
                          <button
                            onClick={() => handleDeleteTrip(t.id)}
                            disabled={loading}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 disabled:opacity-40"
                            aria-label="Eliminar viaje"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-2">
                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold border-2 transition-colors disabled:opacity-50",
                      "border-foreground text-foreground hover:bg-muted"
                    )}
                  >
                    <Clock size={18} />
                    Terminar turno
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Historial de turnos</h2>
            {pastShifts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Sin turnos anteriores.</p>
            )}
            {pastShifts.map((s) => {
              const inTime = new Date(s.checkIn);
              const outTime = new Date(s.checkOut);
              const durMs = outTime.getTime() - inTime.getTime();
              const durH = Math.floor(durMs / 3600000);
              const durM = Math.floor((durMs % 3600000) / 60000);
              return (
                <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {inTime.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inTime.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} → {outTime.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      {" · "}{durH}h {durM}m
                    </p>
                    <p className="text-xs text-muted-foreground">{s.tripCount} viajes</p>
                  </div>
                  <p className="font-bold text-primary">{fmt.format(s.earnings)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-lg">
                {driverName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{driverName}</p>
                <p className="text-sm text-muted-foreground">Conductor</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive font-semibold hover:bg-destructive/5 transition-colors"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-border bg-card grid grid-cols-3 px-2 py-2 shrink-0">
        {[
          { id: "home" as Tab,    icon: Clock,    label: "Inicio"    },
          { id: "history" as Tab, icon: History,  label: "Historial" },
          { id: "profile" as Tab, icon: DollarSign, label: "Perfil" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 rounded-md text-xs transition-colors",
              activeTab === id ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
