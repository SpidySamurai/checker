import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DriverDashboardClient } from "./driver-dashboard-client";

function weekStartDate() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthStartDate() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

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

  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  today.setHours(0, 0, 0, 0);

  const { data: activeShift } = await supabase
    .from("attendance")
    .select("id, check_in")
    .eq("driver_id", user.id)
    .gte("check_in", today.toISOString())
    .is("check_out", null)
    .maybeSingle();

  const { data: shiftTrips } = activeShift
    ? await supabase
        .from("trips")
        .select("id, platform, net_amount, gross_amount, distance_km, created_at")
        .eq("attendance_id", activeShift.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Past closed shifts — last 20, excluding active
  const { data: pastAttendance } = await supabase
    .from("attendance")
    .select("id, check_in, check_out")
    .eq("driver_id", user.id)
    .not("check_out", "is", null)
    .order("check_in", { ascending: false })
    .limit(20);

  // Trips for past shifts (to compute earnings per shift)
  const pastShiftIds = (pastAttendance ?? []).map((a) => a.id);
  const { data: pastTripRows } = pastShiftIds.length
    ? await supabase
        .from("trips")
        .select("attendance_id, net_amount")
        .in("attendance_id", pastShiftIds)
    : { data: [] };

  const pastShifts = (pastAttendance ?? []).map((a) => {
    const trips = (pastTripRows ?? []).filter((t) => t.attendance_id === a.id);
    return {
      id: a.id,
      checkIn: a.check_in,
      checkOut: a.check_out as string,
      tripCount: trips.length,
      earnings: trips.reduce((s, t) => s + Number(t.net_amount), 0),
    };
  });

  // Weekly + monthly earnings
  const weekStart = weekStartDate();
  const monthStart = monthStartDate();

  const [{ data: weekTripRows }, { data: monthTripRows }] = await Promise.all([
    supabase
      .from("trips")
      .select("net_amount")
      .eq("driver_id", user.id)
      .gte("created_at", weekStart.toISOString()),
    supabase
      .from("trips")
      .select("net_amount")
      .eq("driver_id", user.id)
      .gte("created_at", monthStart.toISOString()),
  ]);

  const weekEarnings = (weekTripRows ?? []).reduce((s, t) => s + Number(t.net_amount), 0);
  const monthEarnings = (monthTripRows ?? []).reduce((s, t) => s + Number(t.net_amount), 0);

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
      pastShifts={pastShifts}
      weekEarnings={weekEarnings}
      monthEarnings={monthEarnings}
    />
  );
}
