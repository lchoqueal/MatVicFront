import { useState, useCallback, useEffect } from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import { api } from "~/lib/api";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Boleta {
  id_boleta: number;
  total: number | string;
  fecha_emision: string;
  metodo_pago: string;
  estado_boleta: string;
  id_local?: number;
}

interface ReporteVentas {
  fechaInicio: string;
  fechaFin: string;
  cantidadVentas: number;
  totalVentas: number;
  promedioVenta: number;
  boletas: Boleta[];
}

interface AlertaStock {
  idProducto: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  diferencia: number;
  precio: number;
  urgencia: string;
}

interface AlertasResponse {
  cantidad: number;
  alertas: AlertaStock[];
}

interface ReporteInventario {
  totalProductos: number;
  totalValorInventario: number;
  productosBajo: number;
}

interface MesVenta {
  month: string;
  sales: number;
  salesGlobal: number;
  boletas: Boleta[];
}

// ── Helpers de fechas ─────────────────────────────────────────────────────────

function getFechasMesActual() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return {
    inicio: inicio.toISOString().split("T")[0],
    fin:    fin.toISOString().split("T")[0],
  };
}

function getFechasUltimosSeisMeses(): { inicio: string; fin: string; label: string }[] {
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      inicio: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0],
      fin:    new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0],
      label:  MESES[d.getMonth()],
    };
  });
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();

  const [ventasMes,    setVentasMes]    = useState<ReporteVentas | null>(null);
  const [historialRaw, setHistorialRaw] = useState<MesVenta[]>([]);
  const [alertas,      setAlertas]      = useState<AlertaStock[]>([]);
  const [inventario,   setInventario]   = useState<ReporteInventario | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);

  // ── Filtrado client-side por local ────────────────────────────────────────
  const boletasMes = (ventasMes?.boletas ?? []).filter(
    (b) => b.id_local == null || b.id_local === currentStore.id
  );
  const totalLocalMes    = boletasMes.reduce((s, b) => s + Number(b.total), 0);
  const cantidadLocalMes = boletasMes.length;
  const promedioLocalMes = cantidadLocalMes > 0 ? totalLocalMes / cantidadLocalMes : 0;

  const historialVentas = historialRaw.map((m) => ({
    month: m.month,
    sales: m.boletas
      .filter((b) => b.id_local == null || b.id_local === currentStore.id)
      .reduce((s, b) => s + Number(b.total), 0),
  }));

  // ── Carga de datos ────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const { inicio, fin } = getFechasMesActual();
      const [ventasR, alertasR, inventarioR] = await Promise.allSettled([
        api.get<ReporteVentas>(`/reportes/ventas?fechaInicio=${inicio}&fechaFin=${fin}`),
        api.get<AlertasResponse>("/productos/alertas/stock-bajo"),
        api.get<ReporteInventario>("/reportes/inventario"),
      ]);
      if (ventasR.status     === "fulfilled") setVentasMes(ventasR.value);
      if (alertasR.status    === "fulfilled") setAlertas(alertasR.value.alertas);
      if (inventarioR.status === "fulfilled") setInventario(inventarioR.value);

      const meses = getFechasUltimosSeisMeses();
      const historial = await Promise.all(
        meses.map(({ inicio, fin, label }) =>
          api.get<ReporteVentas>(`/reportes/ventas?fechaInicio=${inicio}&fechaFin=${fin}`)
            .then((d) => ({ month: label, sales: Number(d.totalVentas) || 0, salesGlobal: Number(d.totalVentas) || 0, boletas: d.boletas ?? [] }))
            .catch(() => ({ month: label, sales: 0, salesGlobal: 0, boletas: [] }))
        )
      );
      setHistorialRaw(historial);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Resumen del Mes
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {currentStore.name}
            {lastUpdated && (
              <span style={{ color: "var(--text-muted)" }}>
                {" "}· {lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-main)",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando…" : "Actualizar"}
        </button>
      </div>

      {/* ── 1. MÉTRICAS ESTILO AETHERDASH ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="VENTAS DEL MES"
          value={isLoading ? "—" : new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(totalLocalMes)}
          sub={`${cantidadLocalMes} transacciones`}
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-blue-500/10" iconText="text-blue-500"
          badge={cantidadLocalMes > 0 ? "+activo" : null}
          badgeColor="text-emerald-500"
          isLoading={isLoading}
          delay={0}
        />
        <MetricCard
          title="PRODUCTOS EN STOCK"
          value={isLoading ? "—" : String(inventario?.totalProductos ?? 0)}
          sub={`${inventario?.productosBajo ?? 0} bajo mínimo`}
          icon={<Package className="h-5 w-5" />}
          iconBg="bg-violet-500/10" iconText="text-violet-500"
          badge={inventario && inventario.productosBajo > 0 ? `−${inventario.productosBajo}` : null}
          badgeColor="text-red-500"
          isLoading={isLoading}
          delay={75}
        />
        <MetricCard
          title="VALOR INVENTARIO"
          value={isLoading ? "—" : new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Number(inventario?.totalValorInventario ?? 0))}
          sub="precio de venta"
          icon={<ShoppingCart className="h-5 w-5" />}
          iconBg="bg-amber-500/10" iconText="text-amber-500"
          badge={null} badgeColor=""
          isLoading={isLoading}
          delay={150}
        />
        <MetricCard
          title="TICKET PROMEDIO"
          value={isLoading ? "—" : new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(promedioLocalMes)}
          sub="por venta este mes"
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-emerald-500/10" iconText="text-emerald-500"
          badge={promedioLocalMes > 0 ? "calculado" : null}
          badgeColor="text-pickled-bluewood-400"
          isLoading={isLoading}
          delay={225}
        />
      </div>

      {/* ── 2. GRÁFICO (2/3) + ÚLTIMAS BOLETAS (1/3) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Gráfico de barras */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-main)",
            boxShadow: "var(--shadow-card)",
            animationDelay: "200ms", animationFillMode: "both",
          }}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Evolución de Ventas</h3>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Últimos 6 meses · {currentStore.name}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="w-2 h-2 rounded-full bg-pickled-bluewood-500 inline-block" />
              Ventas ($)
            </div>
          </div>

          <div className="h-[210px]">
            {isLoading ? (
              <div className="h-full flex items-end gap-2">
                {[40, 65, 50, 80, 60, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg animate-pulse" style={{ height: `${h}%`, background: "var(--bg-muted)" }} />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="99%" height={210}>
                <BarChart data={historialVentas} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`} width={34} />
                  <Tooltip
                    cursor={{ fill: "var(--bg-muted)", radius: 8 }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--border-main)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      boxShadow: "var(--shadow-lg)",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Number(value)), "Ventas"]}
                  />
                  <Bar dataKey="sales" fill="hsl(210, 28%, 37%)" radius={[8, 8, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Hub — últimas boletas */}
        <div
          className="rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-main)",
            boxShadow: "var(--shadow-card)",
            animationDelay: "270ms", animationFillMode: "both",
          }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Últimas Transacciones</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{currentStore.name}</p>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full animate-pulse shrink-0" style={{ background: "var(--bg-muted)" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded animate-pulse w-2/3" style={{ background: "var(--bg-muted)" }} />
                      <div className="h-2.5 rounded animate-pulse w-1/3" style={{ background: "var(--bg-muted)" }} />
                    </div>
                    <div className="h-3 rounded animate-pulse w-10" style={{ background: "var(--bg-muted)" }} />
                  </div>
                ))}
              </div>
            ) : !boletasMes.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <ShoppingCart className="h-8 w-8 mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin transacciones</p>
              </div>
            ) : (
              boletasMes.slice(0, 5).map((boleta, i) => (
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
                      {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Number(boleta.total))}
                    </p>
                    <span className={`text-[10px] font-bold uppercase ${
                      boleta.estado_boleta === "pagado"   ? "text-emerald-500" :
                      boleta.estado_boleta === "cancelado" ? "text-red-400"    : "text-amber-500"
                    }`}>{boleta.estado_boleta}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 3. ALERTAS DE STOCK ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-main)",
          boxShadow: "var(--shadow-card)",
          animationDelay: "350ms", animationFillMode: "both",
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
                  animationDelay: `${i * 60}ms`, animationFillMode: "both",
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

    </div>
  );
}

// ── MetricCard estilo AetherDash ──────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  badge: string | null;
  badgeColor: string;
  isLoading?: boolean;
  delay?: number;
}

function MetricCard({ title, value, sub, icon, iconBg, iconText, badge, badgeColor, isLoading, delay = 0 }: MetricCardProps) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 group"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-main)",
        boxShadow: "var(--shadow-card)",
        animationDelay: `${delay}ms`, animationFillMode: "both",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)")}
    >
      {/* Fila superior: ícono + badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBg} ${iconText}`}>
          {icon}
        </div>
        {badge && <span className={`text-[11px] font-bold ${badgeColor}`}>{badge}</span>}
      </div>

      {/* Etiqueta */}
      <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>

      {/* Valor */}
      <div
        className={`text-2xl font-black leading-none mb-1 ${isLoading ? "animate-pulse rounded h-7 w-20" : ""}`}
        style={isLoading ? { background: "var(--bg-muted)" } : { color: "var(--text-primary)" }}
      >
        {!isLoading && value}
      </div>

      {/* Sub */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}