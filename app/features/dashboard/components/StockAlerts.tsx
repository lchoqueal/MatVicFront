import { AlertTriangle, Package } from "lucide-react";
import type { AlertaStock } from "~/features/dashboard/types";

interface StockAlertsProps {
  alertas: AlertaStock[];
  isLoading?: boolean;
}

export function StockAlerts({ alertas, isLoading }: StockAlertsProps) {
  return (
    <div
      className="rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-main)",
        boxShadow: "var(--shadow-card)",
        animationDelay: "350ms",
        animationFillMode: "both",
      }}
    >
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
        <div>
          <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Alertas de Stock</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Productos por agotarse</p>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {!isLoading && alertas.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
              {alertas.length}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
          ))}
        </div>
      ) : alertas.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <Package className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-600">¡Todo el inventario está en orden!</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {alertas.map((alerta, i) => (
            <div
              key={alerta.idProducto}
              className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
              style={{
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border-subtle)",
                animationDelay: `${i * 60}ms`,
                animationFillMode: "both",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {alerta.nombre}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Mín: {alerta.stockMinimo} · Falta: {alerta.diferencia}
                </p>
              </div>
              <span className={`ml-3 shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${
                alerta.urgencia === "alta" || alerta.stockActual <= 2
                  ? "bg-red-500/10 text-red-500"
                  : "bg-amber-500/10 text-amber-600"
              }`}>
                {alerta.stockActual} ud{alerta.stockActual !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
