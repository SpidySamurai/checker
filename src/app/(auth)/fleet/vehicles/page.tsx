import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddVehicleDialog } from "./add-vehicle-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  available: { label: "Disponible", className: "border-green-500/40 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" },
  in_use:    { label: "En uso",     className: "border-accent-orange/40 bg-accent-soft text-primary dark:bg-accent-soft" },
  workshop:  { label: "Taller",     className: "border-border text-muted-sk" },
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
          <h1 className="text-2xl font-bold text-ink">Vehículos</h1>
          <p className="text-sm text-muted-sk mt-0.5">{vehicles?.length ?? 0} vehículos</p>
        </div>
        <AddVehicleDialog />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Placa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Marca / Modelo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Color</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Año</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-sk uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!vehicles || vehicles.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-sk">Sin vehículos. Agrega uno con el botón de arriba.</td></tr>
            )}
            {(vehicles ?? []).map((v) => {
              const s = STATUS_LABELS[v.status] ?? STATUS_LABELS.available;
              return (
                <tr key={v.id} className="hover:bg-tint">
                  <td className="px-4 py-3 font-mono font-semibold text-ink">{v.plate}</td>
                  <td className="px-4 py-3 text-ink/70">{v.make} {v.model}</td>
                  <td className="px-4 py-3 text-ink/70">{v.color ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{v.year ?? "—"}</td>
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
