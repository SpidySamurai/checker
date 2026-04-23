"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(name: string, company: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("profiles")
    .update({ name, company_name: company })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/fleet/settings");
  return {};
}
