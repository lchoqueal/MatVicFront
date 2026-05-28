import { useState, useEffect, useCallback } from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import { api } from "~/lib/api";

// ── Tipos de respuesta ────────────────────────────────────────────────────────

interface Boleta {
  id_boleta: number;
  total: number | string;
  fecha_emision: string;
  metodo_pago: string;
  estado_boleta: string;
  id_local?: number; // puede venir como null si la venta no tiene local asignado
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
  sales: number;       // total del local seleccionado
  salesGlobal: number; // total global (todos los locales)
  boletas: Boleta[];   // boletas del mes para filtrar client-side
}

// Construir fechas para el reporte del mes actual y los últimos 6 meses
function getFechasMesActual() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return {
    inicio: inicio.toISOString().split("T")[0],
    fin: fin.toISOString().split("T")[0],
  };
}

function getFechasUltimosSeisMeses(): { inicio: string; fin: string; label: string }[] {
  const meses = [];
  const MESES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const inicio = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    meses.push({ inicio, fin, label: MESES_ES[d.getMonth()] });
  }
  return meses;
}

export default function Dashboard() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();

  const [ventasMes, setVentasMes] = useState<ReporteVentas | null>(null);
  const [historialRaw, setHistorialRaw] = useState<MesVenta[]>([]);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [inventario, setInventario] = useState<ReporteInventario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ── Filtrado client-side por local ──────────────────────────────────────
  const boletasMesFiltradas = (ventasMes?.boletas ?? []).filter(
    (b) => b.id_local == null || b.id_local === currentStore.id
  );

  // Métricas derivadas del local actual
  const totalLocalMes = boletasMesFiltradas.reduce((s, b) => s + Number(b.total), 0);
  const cantidadLocalMes = boletasMesFiltradas.length;
  const promedioLocalMes = cantidadLocalMes > 0 ? totalLocalMes / cantidadLocalMes : 0;

  // Historial filtrado para el gráfico
  const historialVentas = historialRaw.map((m) => ({
    month: m.month,
    sales: m.boletas
      .filter((b) => b.id_local == null || b.id_local === currentStore.id)
      .reduce((s, b) => s + Number(b.total), 0),
  }));

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const { inicio, fin } = getFechasMesActual();

      // Cargar en paralelo
      const [ventasData, alertasData, inventarioData] = await Promise.allSettled([
        api.get<ReporteVentas>(`/reportes/ventas?fechaInicio=${inicio}&fechaFin=${fin}`),
        api.get<AlertasResponse>("/productos/alertas/stock-bajo"),
        api.get<ReporteInventario>("/reportes/inventario"),
      ]);

      if (ventasData.status === "fulfilled") setVentasMes(ventasData.value);
      if (alertasData.status === "fulfilled") setAlertas(alertasData.value.alertas);
      if (inventarioData.status === "fulfilled") setInventario(inventarioData.value);

      // Cargar historial de 6 meses en paralelo — guardamos las boletas raw para filtrar
      const meses = getFechasUltimosSeisMeses();
      const historialPromises = meses.map(({ inicio, fin, label }) =>
        api.get<ReporteVentas>(`/reportes/ventas?fechaInicio=${inicio}&fechaFin=${fin}`)
          .then((d) => ({
            month: label,
            sales: Number(d.totalVentas) || 0,
            salesGlobal: Number(d.totalVentas) || 0,
            boletas: d.boletas ?? [],
          }))
          .catch(() => ({ month: label, sales: 0, salesGlobal: 0, boletas: [] }))
      );
      const historial = await Promise.all(historialPromises);
      setHistorialRaw(historial);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header con botón de refresco */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-700">Resumen del mes</h2>
          {lastUpdated && (
            <p className="text-xs text-slate-400">
              Actualizado: {lastUpdated.toLocaleTimeString("es-PE")}
            </p>
          )}
        </div>
        <button
          onClick={cargarDatos}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* 1. MÉTRICAS PRINCIPALES — filtradas por local */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ventas del Mes"
          value={isLoading ? "—" : `S/ ${totalLocalMes.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4" />}
          subtitle={`${cantidadLocalMes} transacciones en ${currentStore.name}`}
          isLoading={isLoading}
        />
        <MetricCard
          title="Productos en Stock"
          value={isLoading ? "—" : String(inventario?.totalProductos ?? 0)}
          icon={<Package className="h-4 w-4" />}
          subtitle={`${inventario?.productosBajo ?? 0} con stock bajo`}
          trend={inventario && inventario.productosBajo > 0 ? "negative" : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          title="Valor Inventario"
          value={isLoading ? "—" : `S/ ${Number(inventario?.totalValorInventario ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
          icon={<ShoppingCart className="h-4 w-4" />}
          subtitle={currentStore.name}
          isLoading={isLoading}
        />
        <MetricCard
          title="Promedio por Venta"
          value={isLoading ? "—" : `S/ ${promedioLocalMes.toFixed(2)}`}
          icon={<TrendingUp className="h-4 w-4" />}
          subtitle={`Este mes — ${currentStore.name}`}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. GRÁFICO DE BARRAS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Evolución de Ventas</h3>
            <p className="text-sm text-slate-500">Últimos 6 meses en {currentStore.name}</p>
          </div>
          <div className="h-[250px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex gap-1 items-end">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 bg-slate-200 rounded-t animate-pulse"
                      style={{ height: `${40 + (i * 20)}px` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="99%" height={250}>
                <BarChart data={historialVentas}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, "Ventas"]}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. ALERTAS DE STOCK */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Alertas de Stock</h3>
              <p className="text-sm text-slate-500">Productos por agotarse</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-8 w-8 text-green-400 mb-2" />
              <p className="text-sm text-slate-500 font-medium">¡Todo el stock está bien!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {alertas.map((alerta) => (
                <div key={alerta.idProducto} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-700 line-clamp-1">{alerta.nombre}</p>
                    <p className="text-[11px] text-slate-400">
                      Mínimo: {alerta.stockMinimo} • Falta: {alerta.diferencia}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                    alerta.urgencia === "alta" || alerta.stockActual <= 2
                      ? "bg-red-100 text-red-600"
                      : "bg-orange-100 text-orange-600"
                  }`}>
                    {alerta.stockActual} uds
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. ÚLTIMAS BOLETAS — filtradas por local */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Últimas Transacciones — {currentStore.name}</h3>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !boletasMesFiltradas.length ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No hay transacciones en {currentStore.name} este mes
            </div>
          ) : (
            boletasMesFiltradas.slice(0, 5).map((boleta) => (
              <div key={boleta.id_boleta} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Boleta #{boleta.id_boleta}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(boleta.fecha_emision).toLocaleDateString("es-PE")} • {boleta.metodo_pago}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">S/ {Number(boleta.total).toFixed(2)}</p>
                  <p className={`text-[10px] font-bold uppercase ${
                    boleta.estado_boleta === "pagado" ? "text-green-600" :
                    boleta.estado_boleta === "cancelado" ? "text-red-500" : "text-yellow-600"
                  }`}>
                    {boleta.estado_boleta}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Subcomponente MetricCard ──────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  trend?: "positive" | "negative";
  isLoading?: boolean;
}

function MetricCard({ title, value, icon, subtitle, trend, isLoading }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === "positive" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {trend === "positive" ? "↑" : "↓"}
          </span>
        )}
      </div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
      <div className={`text-2xl font-black text-slate-800 my-1 ${isLoading ? "animate-pulse bg-slate-200 rounded h-8 w-24" : ""}`}>
        {!isLoading && value}
      </div>
      <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}