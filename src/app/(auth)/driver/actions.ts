"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkIn() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("attendance")
    .insert({ driver_id: user.id, check_in: new Date().toISOString() });

  if (error) return { error: error.message };
  revalidatePath("/driver");
  return { success: true };
}

export async function checkOut(attendanceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("attendance")
    .update({ check_out: new Date().toISOString() })
    .eq("id", attendanceId)
    .eq("driver_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/driver");
  return { success: true };
}

export async function logTrip(attendanceId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const platform    = formData.get("platform")     as string;
  const gross       = Number(formData.get("gross"));
  const net         = Number(formData.get("net"));
  const distance    = Number(formData.get("distance"));

  if (!platform || !gross || !net) return { error: "Plataforma, bruto y neto son requeridos" };

  const { error } = await supabase.from("trips").insert({
    driver_id: user.id,
    attendance_id: attendanceId,
    platform,
    gross_amount: gross,
    net_amount: net,
    distance_km: distance || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/driver");
  return { success: true };
}
