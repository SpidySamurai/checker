import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { DriverStatusBadge } from "@/components/checker/driver-status-badge";
import { StatCard } from "@/components/checker/stat-card";
import { PlatformBadge } from "@/components/checker/platform-badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RemoveDriverButton } from "./remove-driver-button";
import { VehicleAssignSelect } from "./vehicle-assign-select";

export default async function DriverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify this driver belongs to the owner's fleet
  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) redirect("/fleet");

  // Fleet vehicles for assignment dropdown
  const { data: fleetVehicles } = await supabase
    .from("vehicles")
    .select("id, plate, make, model")
    .eq("fleet_id", fleet.id)
    .order("plate");

  // Current vehicle assignment (only active membership)
  const { data: assignment } = await supabase
    .from("fleet_drivers")
    .select("vehicle_id")
    .eq("fleet_id", fleet.id)
    .eq("driver_id", id)
    .is("deleted_at", null)
    .single();

  const { data: membership } = await supabase
    .from("fleet_drivers")
    .select("driver_id")
    .eq("fleet_id", fleet.id)
    .eq("driver_id", id)
    .is("deleted_at", null)
    .single();
  if (!membership) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", id)
    .single();
  if (!profile) notFound();

  // Active today
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  today.setHours(0, 0, 0, 0);
  const { data: activeShift } = await supabase
    .from("attendance")
    .select("id, check_in")
    .eq("driver_id", id)
    .gte("check_in", today.toISOString())
    .is("check_out", null)
    .maybeSingle();

  // Week stats
  const weekStart = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
  weekStart.setHours(0, 0, 0, 0);

  const { data: weekTrips } = await supabase
    .from("trips")
    .select("net_amount, gross_amount, distance_km, platform, created_at")
    .eq("driver_id", id)
    .gte("created_at", weekStart.toISOString());

  const { data: weekShifts } = await supabase
    .from("attendance")
    .select("check_in, check_out")
    .eq("driver_id", id)
    .gte("check_in", weekStart.toISOString());

  const totalTrips = weekTrips?.length ?? 0;
  const weekEarnings = (weekTrips ?? []).reduce((s, t) => s + Number(t.net_amount), 0);
  const weekKm = (weekTrips ?? []).reduce((s, t) => s + Number(t.distance_km ?? 0), 0);
  const weekHours = (weekShifts ?? []).reduce((s, sh) => {
    const out = sh.check_out ? new Date(sh.check_out) : new Date();
    const hrs = (out.getTime() - new Date(sh.check_in).getTime()) / 3600000;
    return s + hrs;
  }, 0);

  // Recent shifts
  const { data: recentShifts } = await supabase
    .from("attendance")
    .select("id, check_in, check_out")
    .eq("driver_id", id)
    .order("check_in", { ascending: false })
    .limit(10);

  const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  // eslint-disable-next-line react-hooks/purity -- server component: Date.now() runs once per request, not on re-render
  const nowMs = Date.now();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Back nav */}
      <Link href="/fleet/drivers" className="flex items-center gap-1.5 text-sm text-muted-sk hover:text-ink w-fit">
        <ArrowLeft size={14} />
        Conductores
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="h-14 w-14 rounded-full bg-hatch flex items-center justify-center text-xl font-bold text-ink/70">
          {profile.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-ink">{profile.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <DriverStatusBadge active={!!activeShift} />
          </div>
        </div>
        <RemoveDriverButton driverId={id} driverName={profile.name} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Turnos sem." value={String(weekShifts?.length ?? 0)} sub={`${weekHours.toFixed(0)}h totales`} />
        <StatCard label="Viajes sem." value={String(totalTrips)} sub={`${(totalTrips / 7).toFixed(1)} / día`} />
        <StatCard label="Ganancias" value={fmt.format(weekEarnings)} sub="neto MXN" highlight />
        <StatCard label="Km" value={weekKm.toFixed(0)} sub="esta semana" />
      </div>

      {/* Vehicle assignment */}
      <div className="border border-border rounded-lg p-4">
        <VehicleAssignSelect
          driverId={id}
          currentVehicleId={(assignment as { vehicle_id: string | null } | null)?.vehicle_id ?? null}
          vehicles={fleetVehicles ?? []}
        />
      </div>

      {/* Trips by platform */}
      {(weekTrips ?? []).length > 0 && (
        <div>
          <h2 className="font-semibold text-sm text-ink mb-3">Plataformas esta semana</h2>
          <div className="flex gap-3">
            {(["uber","didi","cabify","indrive"] as const).map((p) => {
              const pTrips = (weekTrips ?? []).filter((t) => t.platform === p);
              if (!pTrips.length) return null;
              return (
                <div key={p} className="flex items-center gap-2 px-3 py-2 border border-border rounded-md">
                  <PlatformBadge platform={p} size="sm" />
                  <span className="text-sm font-semibold">{pTrips.length} viajes</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shift history */}
      <div>
        <h2 className="font-semibold text-sm text-ink mb-3">Historial de turnos</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-canvas">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Duración</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Check in</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Check out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(recentShifts ?? []).map((sh) => {
                const inTime = new Date(sh.check_in);
                const outTime = sh.check_out ? new Date(sh.check_out) : null;
                const durMs = outTime ? outTime.getTime() - inTime.getTime() : nowMs - inTime.getTime();
                const durH = Math.floor(durMs / 3600000);
                const durM = Math.floor((durMs % 3600000) / 60000);
                return (
                  <tr key={sh.id} className="hover:bg-tint">
                    <td className="px-4 py-3 text-ink/70">
                      {inTime.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink/70">
                      {durH}h {durM}m{!outTime ? " (en curso)" : ""}
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {inTime.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {outTime ? outTime.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : <span className="text-primary font-medium">Activo</span>}
                    </td>
                  </tr>
                );
              })}
              {!recentShifts?.length && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-sk">Sin turnos registrados.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
