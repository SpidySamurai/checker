"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function checkIn() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  today.setHours(0, 0, 0, 0);
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("driver_id", user.id)
    .gte("check_in", today.toISOString())
    .is("check_out", null)
    .maybeSingle();

  if (existing) return { error: "Ya tienes un turno activo" };

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

  const platform = formData.get("platform") as string;
  const gross    = Number(formData.get("gross"));
  const net      = Number(formData.get("net"));
  const distance = Number(formData.get("distance"));

  if (!platform || !gross || !net) return { error: "Plataforma, bruto y neto son requeridos" };

  const { data: shift } = await supabase
    .from("attendance")
    .select("driver_id")
    .eq("id", attendanceId)
    .single();
  if (!shift || shift.driver_id !== user.id) return { error: "No autorizado" };

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

export async function deleteTrip(tripId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: trip } = await supabase
    .from("trips")
    .select("driver_id")
    .eq("id", tripId)
    .single();

  if (!trip || trip.driver_id !== user.id) return { error: "No autorizado" };

  const { error } = await supabase
    .from("trips")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("driver_id", user.id);

  if (error) return { error: error.message };

  await logAudit("trip.delete", "trips", tripId, {});
  revalidatePath("/driver");
  return {};
}
