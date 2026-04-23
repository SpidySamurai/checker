import { BarChart2 } from "lucide-react";

export default function MetricsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">Métricas</h1>
        <p className="text-sm text-muted-sk mt-0.5">Análisis global de la plataforma</p>
      </div>

      <div className="border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-4 text-center bg-canvas">
        <div className="h-14 w-14 rounded-full bg-hatch flex items-center justify-center">
          <BarChart2 size={24} className="text-muted-sk" />
        </div>
        <div>
          <p className="font-semibold text-ink">Próximamente</p>
          <p className="text-sm text-muted-sk mt-1">Gráficas de retención, churn, MRR y crecimiento de flota.</p>
        </div>
      </div>
    </div>
  );
}
