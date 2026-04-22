import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DriverDashboardClient } from "./driver-dashboard-client";

export default async function DriverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");
  if (profile.role !== "driver") redirect("/fleet");

  // Active shift (check_in today with no check_out)
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  today.setHours(0, 0, 0, 0);
  const { data: activeShift } = await supabase
    .from("attendance")
    .select("id, check_in")
    .eq("driver_id", user.id)
    .gte("check_in", today.toISOString())
    .is("check_out", null)
    .maybeSingle();

  // Trips in current shift
  const { data: shiftTrips } = activeShift
    ? await supabase
        .from("trips")
        .select("id, platform, net_amount, gross_amount, distance_km, created_at")
        .eq("attendance_id", activeShift.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <DriverDashboardClient
      driverName={profile.name}
      activeShift={activeShift ? { id: activeShift.id, checkIn: activeShift.check_in } : null}
      shiftTrips={(shiftTrips ?? []).map((t) => ({
        id: t.id,
        platform: t.platform,
        netAmount: Number(t.net_amount),
        grossAmount: Number(t.gross_amount),
        distanceKm: t.distance_km ? Number(t.distance_km) : null,
        createdAt: t.created_at,
      }))}
    />
  );
}
