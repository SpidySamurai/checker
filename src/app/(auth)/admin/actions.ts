"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOwnerStatus(
  ownerId: string,
  status: "active" | "suspended"
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (callerProfile?.role !== "admin") return { error: "No autorizado" };

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", ownerId)
    .eq("role", "fleet_owner");

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return {};
}
