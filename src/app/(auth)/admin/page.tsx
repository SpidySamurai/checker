import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/checker/stat-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // All fleet owners
  const { data: owners } = await supabase
    .from("profiles")
    .select("id, name, company_name, status, trial_ends_at, created_at")
    .eq("role", "fleet_owner")
    .order("created_at", { ascending: false });

  const now = new Date();
  const total    = owners?.length ?? 0;
  const active   = (owners ?? []).filter((o) => o.status === "active").length;
  const onTrial  = (owners ?? []).filter((o) => o.status === "trial").length;
  const expiring = (owners ?? []).filter((o) => {
    if (o.status !== "trial" || !o.trial_ends_at) return false;
    const days = (new Date(o.trial_ends_at).getTime() - now.getTime()) / 86400000;
    return days < 7;
  }).length;

  function trialDaysLeft(t: string | null) {
    if (!t) return null;
    const d = Math.ceil((new Date(t).getTime() - now.getTime()) / 86400000);
    return d;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Fleet owners</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} cuentas · {onTrial} en trial</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={String(total)} sub={`+${total} registrados`} />
        <StatCard label="Activos" value={String(active)} sub={`${total ? Math.round(active/total*100) : 0}% activación`} />
        <StatCard label="En trial" value={String(onTrial)} sub={`${expiring} vencen <7d`} highlight={expiring > 0} />
        <StatCard label="MRR" value="—" sub="pendiente de billing" />
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Trial</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Alta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(!owners || owners.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Sin fleet owners registrados.</td></tr>
            )}
            {(owners ?? []).map((o) => {
              const days = trialDaysLeft(o.trial_ends_at);
              return (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{o.company_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{o.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn(
                      "font-medium",
                      o.status === "active"    && "border-green-500/40 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400",
                      o.status === "trial"     && "border-blue-500/40 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
                      o.status === "suspended" && "border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
                    )}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {days !== null ? (
                      <span className={cn(days < 3 && "text-red-600 font-semibold", days < 7 && days >= 3 && "text-orange-600 font-medium")}>
                        {days > 0 ? `${days}d restantes` : "Vencido"}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
