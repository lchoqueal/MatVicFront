import { DollarSign, Package, ShoppingCart, TrendingUp, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import { useDashboardData } from "~/features/dashboard/hooks/useDashboardData";
import { MetricCard } from "~/features/dashboard/components/MetricCard";
import { SalesChart } from "~/features/dashboard/components/SalesChart";
import { RecentTransactions } from "~/features/dashboard/components/RecentTransactions";
import { StockAlerts } from "~/features/dashboard/components/StockAlerts";

const formatCLP = (v: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(v);

export function DashboardPage() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  const {
    boletasMes, historialVentas, alertas, inventario,
    isLoading, lastUpdated, refresh,
  } = useDashboardData(currentStore.id);

  const totalLocalMes    = boletasMes.reduce((s, b) => s + Number(b.total), 0);
  const cantidadLocalMes = boletasMes.length;
  const promedioLocalMes = cantidadLocalMes > 0 ? totalLocalMes / cantidadLocalMes : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Resumen del Mes</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {currentStore.name}
            {lastUpdated && (
              <span style={{ color: "var(--text-muted)" }}>
                {" "}· {lastUpdated.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <button onClick={refresh} disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", color: "var(--text-secondary)", boxShadow: "var(--shadow-card)" }}>
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando…" : "Actualizar"}
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="VENTAS DEL MES" value={isLoading ? "—" : formatCLP(totalLocalMes)}
          sub={`${cantidadLocalMes} transacciones`} icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-blue-500/10" iconText="text-blue-500" badge={cantidadLocalMes > 0 ? "+activo" : null}
          badgeColor="text-emerald-500" isLoading={isLoading} delay={0} />
        <MetricCard title="PRODUCTOS EN STOCK" value={isLoading ? "—" : String(inventario?.totalProductos ?? 0)}
          sub={`${inventario?.productosBajo ?? 0} bajo mínimo`} icon={<Package className="h-5 w-5" />}
          iconBg="bg-violet-500/10" iconText="text-violet-500"
          badge={inventario && inventario.productosBajo > 0 ? `−${inventario.productosBajo}` : null}
          badgeColor="text-red-500" isLoading={isLoading} delay={75} />
        <MetricCard title="VALOR INVENTARIO" value={isLoading ? "—" : formatCLP(Number(inventario?.totalValorInventario ?? 0))}
          sub="precio de venta" icon={<ShoppingCart className="h-5 w-5" />}
          iconBg="bg-amber-500/10" iconText="text-amber-500" badge={null} badgeColor=""
          isLoading={isLoading} delay={150} />
        <MetricCard title="TICKET PROMEDIO" value={isLoading ? "—" : formatCLP(promedioLocalMes)}
          sub="por venta este mes" icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-emerald-500/10" iconText="text-emerald-500"
          badge={promedioLocalMes > 0 ? "calculado" : null} badgeColor="text-pickled-bluewood-400"
          isLoading={isLoading} delay={225} />
      </div>

      {/* Gráfico + Últimas boletas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <SalesChart data={historialVentas} storeName={currentStore.name} isLoading={isLoading} />
        <RecentTransactions boletas={boletasMes} storeName={currentStore.name} isLoading={isLoading} />
      </div>

      {/* Alertas */}
      <StockAlerts alertas={alertas} isLoading={isLoading} />
    </div>
  );
}
