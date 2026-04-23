"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function addDriver(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Todos los campos son requeridos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: fleet } = await supabase
    .from("fleets")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!fleet) return { error: "Flotilla no encontrada" };

  // Create user via Admin API (service_role)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !newUser.user) return { error: createError?.message ?? "Error creando usuario" };

  const driverId = newUser.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: driverId,
    name,
    role: "driver",
    status: "active",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(driverId);
    return { error: profileError.message };
  }

  const { error: linkError } = await admin.from("fleet_drivers").insert({
    fleet_id: fleet.id,
    driver_id: driverId,
  });

  if (linkError) {
    await admin.auth.admin.deleteUser(driverId);
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
