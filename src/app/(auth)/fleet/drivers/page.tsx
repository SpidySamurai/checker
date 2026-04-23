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
    .eq("fleet_id", fleet.id)
    .is("deleted_at", null);

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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Conductores</h1>
          <p className="text-sm text-muted-sk mt-0.5">{drivers.length} conductores</p>
        </div>
        <AddDriverDialog />
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-sk" />
          <input
            className="pl-8 pr-3 py-1.5 border border-border rounded-md text-sm bg-paper w-full max-w-xs placeholder:text-muted-sk"
            placeholder="Buscar por nombre…"
            readOnly
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-canvas">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Viajes sem.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Ganancias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {drivers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-sk">
                  Sin conductores. Agrega uno con el botón de arriba.
                </td>
              </tr>
            )}
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-tint transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/fleet/drivers/${d.id}`} className="flex items-center gap-2.5 hover:text-primary">
                    <div className="h-8 w-8 rounded-full bg-hatch flex items-center justify-center text-xs font-bold shrink-0">
                      {d.name[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-ink">{d.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3"><DriverStatusBadge active={d.active} /></td>
                <td className="px-4 py-3 text-ink/70">{d.trips}</td>
                <td className="px-4 py-3 font-semibold text-ink">{fmt.format(d.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
