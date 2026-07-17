import { useState } from "react";
import { LayoutList, CreditCard } from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import { useAuth } from "~/core/auth";
import { useSalesReport } from "~/features/sales/hooks/useSalesReport";
import { SalesStats } from "~/features/sales/table/SalesStats";
import { SalesTable } from "~/features/sales/table/SalesTable";
import { POSView } from "~/features/sales/pos/POSView";
import type { ViewMode } from "~/features/sales/types";

export function SalesPage() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  const { user, isAdmin } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>(isAdmin ? "tabla" : "pos");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");

  const { boletas, isLoading, reload, totalHoy, ticketPromedio } = useSalesReport(currentStore.id);

  const handleVentaCompletada = () => {
    reload();
    if (isAdmin) setViewMode("tabla");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {viewMode === "tabla" ? "Ventas del Día" : "Modo Caja"}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{currentStore.name}</p>
        </div>
        <div className="flex items-center p-1 rounded-xl gap-1"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
          <button type="button" onClick={() => setViewMode("tabla")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={viewMode === "tabla" ? { background: "var(--primary)", color: "white", boxShadow: "var(--shadow-sm)" } : { color: "var(--text-secondary)", background: "transparent" }}>
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">Vista Ventas</span>
          </button>
          <button type="button" onClick={() => setViewMode("pos")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={viewMode === "pos" ? { background: "var(--primary)", color: "white", boxShadow: "var(--shadow-sm)" } : { color: "var(--text-secondary)", background: "transparent" }}>
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Modo Caja</span>
          </button>
        </div>
      </div>

      {/* Vista Tabla */}
      {viewMode === "tabla" && (
        <div className="space-y-6">
          <SalesStats count={boletas.length} totalHoy={totalHoy} ticketPromedio={ticketPromedio}
            storeName={currentStore.name} isLoading={isLoading} />
          <SalesTable boletas={boletas} isLoading={isLoading} searchTerm={searchTerm}
            filterPayment={filterPayment} storeName={currentStore.name}
            onSearchChange={setSearchTerm} onFilterChange={setFilterPayment}
            onReload={reload} onNuevaVenta={() => setViewMode("pos")} />
        </div>
      )}

      {/* Modo Caja / POS */}
      {viewMode === "pos" && (
        <POSView
          storeName={currentStore.name}
          storeId={currentStore.id}
          empleadoId={isAdmin ? null : (user?.id ?? null)}
          empleadoNombre={user ? `${user.nombre} ${user.apellidos}` : "—"}
          onVentaCompletada={handleVentaCompletada}
        />
      )}
    </div>
  );
}
