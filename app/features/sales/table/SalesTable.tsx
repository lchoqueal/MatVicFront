import { Receipt, Search, Plus, RefreshCw } from "lucide-react";
import type { Boleta, PaymentMethod } from "~/features/sales/types";
import { PAYMENT_METHODS } from "~/features/sales/types";
import { formatCLP } from "~/lib/utils";

interface SalesTableProps {
  boletas: Boleta[];
  isLoading: boolean;
  searchTerm: string;
  filterPayment: string;
  storeName: string;
  onSearchChange: (v: string) => void;
  onFilterChange: (v: string) => void;
  onReload: () => void;
  onNuevaVenta: () => void;
}

export function SalesTable({
  boletas, isLoading, searchTerm, filterPayment, storeName,
  onSearchChange, onFilterChange, onReload, onNuevaVenta,
}: SalesTableProps) {
  const filtered = boletas.filter((b) => {
    const matchSearch = String(b.id_boleta).includes(searchTerm) ||
      b.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPay = filterPayment === "all" || b.metodo_pago.toLowerCase() === filterPayment.toLowerCase();
    return matchSearch && matchPay;
  });

  return (
    <>
      {/* Filtros + botón */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Buscar por N° boleta o método de pago..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
              value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
          </div>
          <select value={filterPayment} onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}>
            <option value="all">Todos los métodos</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onReload} disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={onNuevaVenta}
            className="flex items-center gap-2 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-sm hover:scale-[1.02]"
            style={{ background: "var(--primary)" }}>
            <Plus className="h-5 w-5" /> Nueva Venta
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
        <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Boletas de Hoy — {storeName}</h3>
          <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: "var(--bg-muted)", color: "var(--text-muted)" }}>
            {isLoading ? "Cargando..." : `${filtered.length} boleta${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="h-12 w-12 mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No hay boletas para hoy</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Usa el Modo Caja para registrar una venta</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="text-xs uppercase font-bold tracking-wide" style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}>
                <tr>
                  <th className="px-6 py-4">N° Boleta</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Método de Pago</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {filtered.map((boleta, i) => (
                  <tr key={boleta.id_boleta}
                    className="transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--text-primary)" }}>#{boleta.id_boleta}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {new Date(boleta.fecha_emision).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium capitalize"
                        style={{ background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                        {boleta.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatCLP(Number(boleta.total))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        boleta.estado_boleta === "pagado"    ? "bg-emerald-500/10 text-emerald-500" :
                        boleta.estado_boleta === "cancelado" ? "bg-red-500/10 text-red-400"         : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {boleta.estado_boleta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
