"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { profileSchema, firstError } from "@/lib/schemas";

export async function updateProfile(name: string, company: string): Promise<{ error?: string }> {
  const parsed = profileSchema.safeParse({ name, company });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name, company_name: parsed.data.company })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/fleet/settings");
  return {};
}
