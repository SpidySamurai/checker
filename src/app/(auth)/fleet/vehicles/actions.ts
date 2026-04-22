"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addVehicle(formData: FormData) {
  const plate = (formData.get("plate") as string)?.trim().toUpperCase();
  const make  = formData.get("make")  as string;
  const model = formData.get("model") as string;
  const year  = Number(formData.get("year"));
  const color = formData.get("color") as string;

  if (!plate || !make || !model) return { error: "Placa, marca y modelo son requeridos" };

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
    year: year || null,
    color: color || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/fleet/vehicles");
  revalidatePath("/fleet");
  return { success: true };
}
