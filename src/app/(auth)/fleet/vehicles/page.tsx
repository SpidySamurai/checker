import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddVehicleDialog } from "./add-vehicle-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  available: { label: "Disponible", className: "border-green-500/40 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" },
  in_use:    { label: "En uso",     className: "border-orange-500/40 bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400" },
  workshop:  { label: "Taller",     className: "border-slate-300 text-slate-500" },
};

export default async function VehiclesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) redirect("/fleet");

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate, make, model, year, color, status")
    .eq("fleet_id", fleet.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Vehículos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{vehicles?.length ?? 0} vehículos</p>
        </div>
        <AddVehicleDialog />
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Placa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Marca / Modelo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Año</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(!vehicles || vehicles.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Sin vehículos. Agrega uno con el botón de arriba.</td></tr>
            )}
            {(vehicles ?? []).map((v) => {
              const s = STATUS_LABELS[v.status] ?? STATUS_LABELS.available;
              return (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-50">{v.plate}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.make} {v.model}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.color ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.year ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("font-medium", s.className)}>{s.label}</Badge>
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
