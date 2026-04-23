import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, company_name, status, trial_ends_at")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  return (
    <div className="p-6 max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Ajustes</h1>
        <p className="text-sm text-muted-sk mt-0.5">Configura tu cuenta y flotilla</p>
      </div>

      <SettingsForm
        defaultName={profile.name}
        defaultCompany={profile.company_name ?? ""}
        email={user.email ?? ""}
        status={profile.status}
        trialEndsAt={profile.trial_ends_at}
      />
    </div>
  );
}
