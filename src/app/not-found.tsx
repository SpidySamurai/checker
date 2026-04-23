import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">✓</div>
        </div>

        <div className="space-y-2">
          <p className="text-7xl font-bold text-hatch select-none">404</p>
          <h1 className="text-xl font-semibold text-ink">Página no encontrada</h1>
          <p className="text-sm text-muted-sk">Esta ruta no existe o no tienes acceso.</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
