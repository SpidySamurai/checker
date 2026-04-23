import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/checker/stat-card";
import { DriverStatusBadge } from "@/components/checker/driver-status-badge";
import { Car, Plus } from "lucide-react";
import Link from "next/link";

export default async function FleetDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get fleet id for this owner
  const { data: fleet } = await supabase
    .from("fleets")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!fleet) {
    return (
      <div className="p-6">
        <p className="text-slate-500">No tienes una flotilla registrada.</p>
      </div>
    );
  }

  // Drivers in this fleet
  const { data: fleetDrivers } = await supabase
    .from("fleet_drivers")
    .select("driver_id, profiles:driver_id(id, name)")
    .eq("fleet_id", fleet.id);

  const driverIds = (fleetDrivers ?? []).map((fd) => fd.driver_id);

  // Active today: attendance with no check_out
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  today.setHours(0, 0, 0, 0);
  const { data: activeAttendance } = driverIds.length
    ? await supabase
        .from("attendance")
        .select("driver_id")
        .in("driver_id", driverIds)
        .gte("check_in", today.toISOString())
        .is("check_out", null)
    : { data: [] };

  const activeDriverIds = new Set((activeAttendance ?? []).map((a) => a.driver_id));

  // This week trips + earnings
  const weekStart = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
  weekStart.setHours(0, 0, 0, 0);

  const { data: weekTrips } = driverIds.length
    ? await supabase
        .from("trips")
        .select("net_amount")
        .in("driver_id", driverIds)
        .gte("created_at", weekStart.toISOString())
    : { data: [] };

  const tripsCount = weekTrips?.length ?? 0;
  const weekEarnings = (weekTrips ?? []).reduce((sum, t) => sum + Number(t.net_amount), 0);

  // Vehicles
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate, make, model, status")
    .eq("fleet_id", fleet.id)
    .limit(5);

  const drivers = (fleetDrivers ?? []).map((fd) => ({
    id: fd.driver_id,
    // @ts-expect-error nested join type
    name: fd.profiles?.name ?? "Sin nombre",
    active: activeDriverIds.has(fd.driver_id),
  }));

  const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Hola 👋</h1>
          <p className="text-sm text-muted-sk mt-0.5">{fleet.name}</p>
        </div>
        <Link
          href="/fleet/drivers"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Conductor</span>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          label="Activos hoy"
          value={`${activeDriverIds.size} / ${driverIds.length}`}
          sub="conductores en turno"
        />
        <StatCard
          label="Viajes semana"
          value={String(tripsCount)}
          sub="viajes registrados"
          highlight
        />
        <StatCard
          label="Ganancias semana"
          value={fmt.format(weekEarnings)}
          sub="neto MXN"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
        {/* Drivers list */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm text-ink">Conductores</h2>
            <Link href="/fleet/drivers" className="text-xs text-muted-sk hover:text-ink">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {drivers.length === 0 && (
              <p className="p-4 text-sm text-muted-sk">Sin conductores. <Link href="/fleet/drivers" className="underline">Agrega uno →</Link></p>
            )}
            {drivers.slice(0, 8).map((d) => (
              <Link
                key={d.id}
                href={`/fleet/drivers/${d.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-tint transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-hatch flex items-center justify-center text-xs font-bold shrink-0">
                  {d.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{d.name}</p>
                </div>
                <DriverStatusBadge active={d.active} />
              </Link>
            ))}
          </div>
        </div>

        {/* Vehicles shortcut */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm text-ink">Vehículos</h2>
            <Link href="/fleet/vehicles" className="text-xs text-muted-sk hover:text-ink">
              Ver todos →
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {(vehicles ?? []).length === 0 && (
              <p className="text-sm text-muted-sk px-1">Sin vehículos.</p>
            )}
            {(vehicles ?? []).map((v) => (
              <div key={v.id} className="flex items-center gap-2 px-2 py-1.5 border border-border rounded-md text-sm">
                <Car size={14} className="text-muted-sk shrink-0" />
                <span className="font-mono text-xs font-semibold">{v.plate}</span>
                <span className="text-muted-sk text-xs truncate">{v.make} {v.model}</span>
              </div>
            ))}
            <Link
              href="/fleet/vehicles"
              className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 border border-dashed border-border rounded-md text-xs text-muted-sk hover:border-primary hover:text-primary transition-colors"
            >
              <Plus size={12} />
              Agregar vehículo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
