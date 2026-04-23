import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { setupProfile } from "@/app/(public)/register/actions";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // "recovery" for password reset links

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset or first-time invite — send to set-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      if (type === "invite") {
        return NextResponse.redirect(`${origin}/reset-password?setup=1`);
      }

      // New registration — ensure profile exists
      await setupProfile();
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
