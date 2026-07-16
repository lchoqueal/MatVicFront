import { ShoppingCart } from "lucide-react";
import type { Boleta } from "~/features/dashboard/types";

interface RecentTransactionsProps {
  boletas: Boleta[];
  storeName: string;
  isLoading?: boolean;
}

export function RecentTransactions({ boletas, storeName, isLoading }: RecentTransactionsProps) {
  const formatCLP = (v: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(v);

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-main)",
        boxShadow: "var(--shadow-card)",
        animationDelay: "270ms",
        animationFillMode: "both",
      }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Últimas Transacciones</h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{storeName}</p>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full animate-pulse shrink-0" style={{ background: "var(--bg-muted)" }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded animate-pulse w-2/3" style={{ background: "var(--bg-muted)" }} />
                  <div className="h-2.5 rounded animate-pulse w-1/3" style={{ background: "var(--bg-muted)" }} />
                </div>
                <div className="h-3 rounded animate-pulse w-10" style={{ background: "var(--bg-muted)" }} />
              </div>
            ))}
          </div>
        ) : !boletas.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <ShoppingCart className="h-8 w-8 mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin transacciones</p>
          </div>
        ) : (
          boletas.slice(0, 5).map((boleta, i) => (
            <div
              key={boleta.id_boleta}
              className="flex items-center gap-3 px-5 py-3 cursor-default animate-in fade-in slide-in-from-right-2 border-b last:border-0"
              style={{
                borderColor: "var(--border-subtle)",
                animationDelay: `${i * 60 + 300}ms`,
                animationFillMode: "both",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
              >
                #{boleta.id_boleta}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {boleta.metodo_pago}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {new Date(boleta.fecha_emision).toLocaleDateString("es-CL")}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatCLP(Number(boleta.total))}
                </p>
                <span className={`text-[10px] font-bold uppercase ${
                  boleta.estado_boleta === "pagado"    ? "text-emerald-500" :
                  boleta.estado_boleta === "cancelado" ? "text-red-400"     : "text-amber-500"
                }`}>
                  {boleta.estado_boleta}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
