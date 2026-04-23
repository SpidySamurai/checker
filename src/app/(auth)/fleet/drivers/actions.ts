"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export async function addDriver(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();

  if (!name || !email) return { error: "Nombre y email son requeridos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) return { error: "Flotilla no encontrada" };

  const service = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Invite user — Supabase sends email with link to set their own password
  const { data: invited, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: { name },
    redirectTo: `${appUrl}/auth/callback?next=/driver`,
  });
  if (inviteError) return { error: inviteError.message };
  if (!invited.user) return { error: "No se pudo crear el usuario" };

  const driverId = invited.user.id;

  const { error: profileError } = await service.from("profiles").insert({
    id: driverId,
    name,
    role: "driver",
    status: "active",
  });
  if (profileError) {
    await service.auth.admin.deleteUser(driverId);
    return { error: profileError.message };
  }

  const { error: linkError } = await service.from("fleet_drivers").insert({
    fleet_id: fleet.id,
    driver_id: driverId,
  });
  if (linkError) {
    await service.auth.admin.deleteUser(driverId);
    return { error: linkError.message };
  }

  revalidatePath("/fleet/drivers");
  return { success: true };
}

export async function removeDriverFromFleet(driverId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) return { error: "Flotilla no encontrada" };

  const { error } = await supabase
    .from("fleet_drivers")
    .delete()
    .eq("fleet_id", fleet.id)
    .eq("driver_id", driverId);

  if (error) return { error: error.message };
  revalidatePath("/fleet/drivers");
  return {};
}

export async function assignVehicle(driverId: string, vehicleId: string | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) return { error: "Flotilla no encontrada" };

  const { error } = await supabase
    .from("fleet_drivers")
    .update({ vehicle_id: vehicleId })
    .eq("fleet_id", fleet.id)
    .eq("driver_id", driverId);

  if (error) return { error: error.message };
  revalidatePath(`/fleet/drivers/${driverId}`);
  return {};
}
