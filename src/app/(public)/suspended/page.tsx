import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SuspendedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">✓</div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-ink">Cuenta suspendida</h1>
          <p className="text-sm text-muted-sk">
            Tu acceso ha sido suspendido. Contacta al administrador para reactivar tu cuenta.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="mailto:soporte@checker.mx"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
          >
            Contactar soporte
          </a>
          <Link
            href="/login"
            className="text-sm text-muted-sk hover:text-ink transition-colors"
          >
            Cerrar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
