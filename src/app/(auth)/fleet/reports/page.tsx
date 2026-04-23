import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/checker/stat-card";
import { TrendingUp } from "lucide-react";

const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

function weekStart() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthStart() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) redirect("/fleet");

  const { data: fleetDrivers } = await supabase
    .from("fleet_drivers")
    .select("driver_id")
    .eq("fleet_id", fleet.id);

  const driverIds = (fleetDrivers ?? []).map((fd) => fd.driver_id);

  const [{ data: weekTrips }, { data: monthTrips }] = await Promise.all([
    driverIds.length
      ? supabase.from("trips").select("driver_id, net_amount, platform, created_at")
          .in("driver_id", driverIds)
          .gte("created_at", weekStart().toISOString())
      : { data: [] },
    driverIds.length
      ? supabase.from("trips").select("driver_id, net_amount, platform, created_at")
          .in("driver_id", driverIds)
          .gte("created_at", monthStart().toISOString())
      : { data: [] },
  ]);

  const weekTotal   = (weekTrips  ?? []).reduce((s, t) => s + Number(t.net_amount), 0);
  const monthTotal  = (monthTrips ?? []).reduce((s, t) => s + Number(t.net_amount), 0);
  const weekCount   = weekTrips?.length  ?? 0;
  const monthCount  = monthTrips?.length ?? 0;
  const avgPerTrip  = weekCount > 0 ? weekTotal / weekCount : 0;

  // Platform breakdown (week)
  const platformMap: Record<string, { trips: number; earnings: number }> = {};
  for (const t of weekTrips ?? []) {
    const p = t.platform ?? "otro";
    platformMap[p] ??= { trips: 0, earnings: 0 };
    platformMap[p].trips++;
    platformMap[p].earnings += Number(t.net_amount);
  }
  const platforms = Object.entries(platformMap).sort((a, b) => b[1].earnings - a[1].earnings);

  // Top drivers (week)
  const driverMap: Record<string, { trips: number; earnings: number }> = {};
  for (const t of weekTrips ?? []) {
    driverMap[t.driver_id] ??= { trips: 0, earnings: 0 };
    driverMap[t.driver_id].trips++;
    driverMap[t.driver_id].earnings += Number(t.net_amount);
  }

  // Fetch driver names for top entries
  const topDriverIds = Object.entries(driverMap)
    .sort((a, b) => b[1].earnings - a[1].earnings)
    .slice(0, 5)
    .map(([id]) => id);

  const { data: driverProfiles } = topDriverIds.length
    ? await supabase.from("profiles").select("id, name").in("id", topDriverIds)
    : { data: [] };

  const nameMap = Object.fromEntries((driverProfiles ?? []).map((p) => [p.id, p.name]));

  const topDrivers = topDriverIds.map((id) => ({
    id,
    name: nameMap[id] ?? "—",
    ...driverMap[id],
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Reportes</h1>
        <p className="text-sm text-muted-sk mt-0.5">{fleet.name}</p>
      </div>

      {/* KPI cards */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-sk uppercase tracking-wide">Esta semana</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <StatCard label="Ganancias" value={fmt.format(weekTotal)} sub="neto MXN" highlight />
          <StatCard label="Viajes" value={String(weekCount)} sub="registrados" />
          <StatCard label="Prom. por viaje" value={fmt.format(avgPerTrip)} sub="neto MXN" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-sk uppercase tracking-wide">Este mes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <StatCard label="Ganancias" value={fmt.format(monthTotal)} sub="neto MXN" />
          <StatCard label="Viajes" value={String(monthCount)} sub="registrados" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
        {/* Top conductores */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <h2 className="font-semibold text-sm text-ink">Top conductores (semana)</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[360px]">
            <thead className="bg-muted/40">
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Conductor</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Viajes</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Ganancias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topDrivers.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-sk">Sin viajes esta semana.</td></tr>
              )}
              {topDrivers.map((d, i) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2.5">
                    <span className="text-xs font-mono text-muted-sk w-4">{i + 1}</span>
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {d.name[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-ink">{d.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{d.trips}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{fmt.format(d.earnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Plataformas */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm text-ink">Por plataforma (semana)</h2>
          </div>
          <div className="p-4 space-y-3">
            {platforms.length === 0 && (
              <p className="text-sm text-muted-sk">Sin datos esta semana.</p>
            )}
            {platforms.map(([platform, data]) => {
              const pct = weekTotal > 0 ? (data.earnings / weekTotal) * 100 : 0;
              return (
                <div key={platform} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink capitalize">{platform}</span>
                    <span className="text-muted-sk">{data.trips} viajes</span>
                  </div>
                  <div className="h-1.5 bg-hatch rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-sk">{fmt.format(data.earnings)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
