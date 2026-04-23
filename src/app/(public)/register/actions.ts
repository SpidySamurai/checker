"use server";

import { createClient } from "@/lib/supabase/server";

/** Called after email confirmation via auth/callback. Creates profile + fleet from user_metadata. */
export async function setupProfile(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, company_name")
    .eq("id", user.id)
    .single();

  if (existing) {
    // Profile exists — ensure fleet also exists (handles partial failures on first registration)
    const { data: existingFleet } = await supabase
      .from("fleets")
      .select("id")
      .eq("owner_id", user.id)
      .single();
    if (existingFleet) return {};
    // Fleet missing — create it
    const { error: fleetError } = await supabase.from("fleets").insert({
      name: existing.company_name ?? user.user_metadata?.company_name ?? "Mi flotilla",
      owner_id: user.id,
    });
    if (fleetError) return { error: fleetError.message };
    return {};
  }

  const name: string = user.user_metadata?.name ?? "";
  const companyName: string = user.user_metadata?.company_name ?? "";
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    name,
    company_name: companyName,
    role: "fleet_owner",
    status: "trial",
    trial_ends_at: trialEndsAt,
  });
  if (profileError) return { error: profileError.message };

  const { error: fleetError } = await supabase.from("fleets").insert({
    name: companyName,
    owner_id: user.id,
  });
  if (fleetError) return { error: fleetError.message };

  return {};
}
