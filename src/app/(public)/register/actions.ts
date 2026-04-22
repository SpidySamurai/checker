"use server";

import { createClient } from "@/lib/supabase/server";

export async function completeRegistration(name: string, company: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    name,
    company_name: company,
    role: "fleet_owner",      // hardcoded server-side — never from user input
    status: "trial",
    trial_ends_at: trialEndsAt,
  });
  if (profileError) return { error: profileError.message };

  const { error: fleetError } = await supabase.from("fleets").insert({
    name: company,
    owner_id: user.id,
  });
  if (fleetError) return { error: fleetError.message };

  return { success: true };
}
