"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { vehicleSchema, firstError } from "@/lib/schemas";

export async function addVehicle(formData: FormData) {
  const rawYear = Number(formData.get("year"));
  const parsed = vehicleSchema.safeParse({
    plate: ((formData.get("plate") as string) ?? "").trim().toUpperCase(),
    make: formData.get("make"),
    model: formData.get("model"),
    year: Number.isFinite(rawYear) && rawYear > 0 ? rawYear : null,
    color: ((formData.get("color") as string) ?? "").trim() || null,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { plate, make, model, year, color } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) return { error: "Flotilla no encontrada" };

  const { error } = await supabase.from("vehicles").insert({
    fleet_id: fleet.id,
    plate,
    make,
    model,
    year,
    color,
  });

  if (error) return { error: error.message };

  revalidatePath("/fleet/vehicles");
  revalidatePath("/fleet");
  return { success: true };
}
