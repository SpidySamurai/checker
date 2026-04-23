"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" as const, user: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "No autorizado" as const, user: null };
  return { error: null, user };
}

export async function updateOwnerStatus(
  ownerId: string,
  status: "active" | "suspended"
): Promise<{ error?: string }> {
  const { error: authError } = await assertAdmin();
  if (authError) return { error: authError };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", ownerId)
    .eq("role", "fleet_owner");

  if (error) return { error: error.message };

  await logAudit(`fleet_owner.${status}`, "profiles", ownerId, { status });
  revalidatePath("/admin");
  return {};
}

export async function createFleetOwner(formData: FormData): Promise<{ error?: string }> {
  const { error: authError } = await assertAdmin();
  if (authError) return { error: authError };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const trialDays = Number(formData.get("trial_days") ?? 14);

  if (!name || !email || !company) return { error: "Nombre, email y empresa son requeridos" };

  const service = createServiceClient();

  const { data: invited, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: { name, company_name: company },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/fleet`,
  });
  if (inviteError) return { error: inviteError.message };
  if (!invited.user) return { error: "No se pudo crear el usuario" };

  const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

  const { error: profileError } = await service.from("profiles").insert({
    id: invited.user.id,
    name,
    company_name: company,
    role: "fleet_owner",
    status: "trial",
    trial_ends_at: trialEndsAt,
  });
  if (profileError) {
    await service.auth.admin.deleteUser(invited.user.id);
    return { error: profileError.message };
  }

  const { error: fleetError } = await service.from("fleets").insert({
    name: company,
    owner_id: invited.user.id,
  });
  if (fleetError) return { error: fleetError.message };

  await logAudit("fleet_owner.invite", "profiles", invited.user.id, { email, name, company, trial_days: trialDays });
  revalidatePath("/admin");
  return {};
}

export async function updateFleetOwner(
  ownerId: string,
  data: { name?: string; company_name?: string; status?: "trial" | "active" | "suspended"; trial_ends_at?: string }
): Promise<{ error?: string }> {
  const { error: authError } = await assertAdmin();
  if (authError) return { error: authError };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", ownerId)
    .eq("role", "fleet_owner");

  if (error) return { error: error.message };

  if (data.company_name) {
    await supabase.from("fleets").update({ name: data.company_name }).eq("owner_id", ownerId);
  }

  await logAudit("fleet_owner.update", "profiles", ownerId, data as Record<string, unknown>);
  revalidatePath("/admin");
  return {};
}

export async function extendTrial(ownerId: string, days: number): Promise<{ error?: string }> {
  const { error: authError } = await assertAdmin();
  if (authError) return { error: authError };

  const supabase = await createClient();
  const { data: owner } = await supabase
    .from("profiles")
    .select("trial_ends_at")
    .eq("id", ownerId)
    .single();

  const base = owner?.trial_ends_at && new Date(owner.trial_ends_at) > new Date()
    ? new Date(owner.trial_ends_at)
    : new Date();

  base.setDate(base.getDate() + days);

  const { error } = await supabase
    .from("profiles")
    .update({ trial_ends_at: base.toISOString(), status: "trial" })
    .eq("id", ownerId)
    .eq("role", "fleet_owner");

  if (error) return { error: error.message };

  await logAudit("fleet_owner.extend_trial", "profiles", ownerId, { days, new_trial_ends_at: base.toISOString() });
  revalidatePath("/admin");
  return {};
}
