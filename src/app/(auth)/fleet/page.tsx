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
  const today = new Date();
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
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Hola 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">{fleet.name}</p>
        </div>
        <Link
          href="/fleet/drivers"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          Conductor
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
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

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Drivers list */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-50">Conductores</h2>
            <Link href="/fleet/drivers" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-50">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {drivers.length === 0 && (
              <p className="p-4 text-sm text-slate-500">Sin conductores. <Link href="/fleet/drivers" className="underline">Agrega uno →</Link></p>
            )}
            {drivers.slice(0, 8).map((d) => (
              <Link
                key={d.id}
                href={`/fleet/drivers/${d.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                  {d.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{d.name}</p>
                </div>
                <DriverStatusBadge active={d.active} />
              </Link>
            ))}
          </div>
        </div>

        {/* Vehicles shortcut */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-50">Vehículos</h2>
            <Link href="/fleet/vehicles" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-50">
              Ver todos →
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {(vehicles ?? []).length === 0 && (
              <p className="text-sm text-slate-500 px-1">Sin vehículos.</p>
            )}
            {(vehicles ?? []).map((v) => (
              <div key={v.id} className="flex items-center gap-2 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-sm">
                <Car size={14} className="text-slate-400 shrink-0" />
                <span className="font-mono text-xs font-semibold">{v.plate}</span>
                <span className="text-slate-500 text-xs truncate">{v.make} {v.model}</span>
              </div>
            ))}
            <Link
              href="/fleet/vehicles"
              className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-md text-xs text-slate-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
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
