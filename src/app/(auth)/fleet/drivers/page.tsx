import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DriverStatusBadge } from "@/components/checker/driver-status-badge";
import { AddDriverDialog } from "./add-driver-dialog";
import { Search } from "lucide-react";
import Link from "next/link";

export default async function DriversPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) redirect("/fleet");

  const { data: fleetDrivers } = await supabase
    .from("fleet_drivers")
    .select("driver_id, profiles:driver_id(id, name)")
    .eq("fleet_id", fleet.id);

  const driverIds = (fleetDrivers ?? []).map((fd) => fd.driver_id);

  // Active today
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

  const activeSet = new Set((activeAttendance ?? []).map((a) => a.driver_id));

  // Week trips per driver
  const weekStart = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
  weekStart.setHours(0, 0, 0, 0);

  const { data: weekTrips } = driverIds.length
    ? await supabase
        .from("trips")
        .select("driver_id, net_amount")
        .in("driver_id", driverIds)
        .gte("created_at", weekStart.toISOString())
    : { data: [] };

  type DriverRow = { id: string; name: string; active: boolean; trips: number; earnings: number };
  const drivers: DriverRow[] = (fleetDrivers ?? []).map((fd) => {
    const dTrips = (weekTrips ?? []).filter((t) => t.driver_id === fd.driver_id);
    return {
      id: fd.driver_id,
      // @ts-expect-error nested join type
      name: fd.profiles?.name ?? "Sin nombre",
      active: activeSet.has(fd.driver_id),
      trips: dTrips.length,
      earnings: dTrips.reduce((s, t) => s + Number(t.net_amount), 0),
    };
  });

  const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Conductores</h1>
          <p className="text-sm text-slate-500 mt-0.5">{drivers.length} conductores</p>
        </div>
        <AddDriverDialog />
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-900 w-64 placeholder:text-slate-400"
            placeholder="Buscar por nombre…"
            readOnly
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Viajes sem.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ganancias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {drivers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Sin conductores. Agrega uno con el botón de arriba.
                </td>
              </tr>
            )}
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/fleet/drivers/${d.id}`} className="flex items-center gap-2.5 hover:text-orange-600">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {d.name[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-50">{d.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3"><DriverStatusBadge active={d.active} /></td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{d.trips}</td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{fmt.format(d.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
