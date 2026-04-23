import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/checker/stat-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OwnerActions } from "./owner-actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (callerProfile?.role !== "admin") redirect("/");

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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Fleet owners</h1>
        <p className="text-sm text-muted-sk mt-0.5">{total} cuentas · {onTrial} en trial</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total" value={String(total)} sub={`+${total} registrados`} />
        <StatCard label="Activos" value={String(active)} sub={`${total ? Math.round(active/total*100) : 0}% activación`} />
        <StatCard label="En trial" value={String(onTrial)} sub={`${expiring} vencen <7d`} highlight={expiring > 0} />
        <StatCard label="MRR" value="—" sub="pendiente de billing" />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-canvas">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Trial</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Alta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!owners || owners.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-sk">Sin fleet owners registrados.</td></tr>
            )}
            {(owners ?? []).map((o) => {
              const days = trialDaysLeft(o.trial_ends_at);
              return (
                <tr key={o.id} className="hover:bg-tint">
                  <td className="px-4 py-3 font-medium text-ink">{o.company_name ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{o.name}</td>
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
                  <td className="px-4 py-3 text-ink/70">
                    {days !== null ? (
                      <span className={cn(days < 3 && "text-red-600 font-semibold", days < 7 && days >= 3 && "text-orange-600 font-medium")}>
                        {days > 0 ? `${days}d restantes` : "Vencido"}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-sk text-xs">
                    {new Date(o.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <OwnerActions ownerId={o.id} currentStatus={o.status} ownerName={o.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
