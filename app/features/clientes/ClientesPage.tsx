import { useState, useEffect } from "react";
import { formatCLP } from "~/lib/utils";
import { Package, ShoppingCart, Clock, CheckCircle, XCircle, Truck, Search, Eye } from "lucide-react";
import { getSalesReport } from "~/core/api/reports.api";
import type { Boleta } from "~/features/dashboard/types";

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface Pedido {
  id: string;
  cliente: string;
  email: string;
  producto: string;
  monto: number;
  metodo: string;
  estado: "En camino" | "Entregado" | "Pendiente" | "Cancelado";
  fecha: string;
}

type EstadoFilter = "Todos" | "En camino" | "Entregado" | "Pendiente" | "Cancelado";

const ESTADO_CONFIG = {
  "En camino":  { color: '#3CB371', bg: 'rgba(60,177,113,0.12)', icon: Truck },
  "Entregado":  { color: '#3CB371', bg: 'rgba(60,177,113,0.12)', icon: CheckCircle },
  "Pendiente":  { color: '#F4B740', bg: 'rgba(244,183,64,0.12)', icon: Clock },
  "Cancelado":  { color: '#D9534F', bg: 'rgba(217,83,79,0.12)',  icon: XCircle },
};

function mapEstado(estado: string): "En camino" | "Entregado" | "Pendiente" | "Cancelado" {
  const e = estado?.toLowerCase() || "";
  if (e.includes("pagada") || e.includes("entregado") || e.includes("completada")) return "Entregado";
  if (e.includes("anulada") || e.includes("cancelado")) return "Cancelado";
  if (e.includes("camino")) return "En camino";
  return "Pendiente";
}

function boletaToPedido(b: Boleta): Pedido {
  return {
    id: `#ORD-${b.id_boleta}`,
    cliente: `Cliente Local ${b.id_local || "Web"}`,
    email: "-",
    producto: "Venta General",
    monto: Number(b.total),
    metodo: b.metodo_pago || "Otro",
    estado: mapEstado(b.estado_boleta),
    fecha: new Date(b.fecha_emision).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })
  };
}

const KPI = ({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) => (
  <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
    <div className="flex items-start justify-between mb-3">
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-black" style={{ color: 'var(--text)' }}>{value}</p>
  </div>
);

export function ClientesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EstadoFilter>("Todos");
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const hoy = new Date();
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1).toISOString().split("T")[0];
        const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split("T")[0];
        const res = await getSalesReport(inicio, fin);
        const mapped = (res.boletas || []).map(boletaToPedido).sort((a, b) => b.id.localeCompare(a.id));
        setPedidos(mapped);
      } catch (err) {
        console.error("Error al cargar ventas", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = pedidos.filter(p => {
    const matchSearch = p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.producto.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Todos" || p.estado === filter;
    return matchSearch && matchFilter;
  });

  const filters: EstadoFilter[] = ["Todos", "En camino", "Pendiente", "Entregado", "Cancelado"];

  const totales = {
    total:     pedidos.length,
    enCamino:  pedidos.filter(p => p.estado === "En camino").length,
    pendiente: pedidos.filter(p => p.estado === "Pendiente").length,
    entregado: pedidos.filter(p => p.estado === "Entregado").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Clientes & Pedidos</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Seguimiento de envíos y estados de compra</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Pedidos"  value={totales.total}     icon={Package}       color="#E8635A" />
        <KPI label="En Camino"      value={totales.enCamino}  icon={Truck}         color="#3CB371" />
        <KPI label="Pendientes"     value={totales.pendiente} icon={Clock}         color="#F4B740" />
        <KPI label="Entregados"     value={totales.entregado} icon={CheckCircle}   color="#3CB371" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar pedido o cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
              style={{ background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                style={filter === f
                  ? { background: 'var(--primary)', color: 'white', boxShadow: '0 3px 10px rgba(232,99,90,0.35)' }
                  : { background: 'var(--card)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de pedidos */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'CLIENTE', 'PRODUCTO', 'MONTO', 'MÉTODO', 'ESTADO', 'FECHA', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pedido, i) => {
                const cfg = ESTADO_CONFIG[pedido.estado];
                const StatusIcon = cfg.icon;
                return (
                  <tr
                    key={pedido.id}
                    className="transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{pedido.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{pedido.cliente}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pedido.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{pedido.producto}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatCLP(pedido.monto)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: 'var(--card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {pedido.metodo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon className="h-3 w-3" />
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{pedido.fecha}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelected(pedido)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--border)' }} />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No hay pedidos que coincidan.</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Mostrando <span className="font-bold" style={{ color: 'var(--text)' }}>{filtered.length}</span> de {pedidos.length} pedidos
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-sm font-bold" style={{ background: 'var(--primary)', color: 'white' }}>1</button>
            <button className="px-3 py-1.5 rounded-lg text-sm font-bold transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >2</button>
          </div>
        </div>
      </div>

      {/* Modal detalle pedido */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Detalle del Pedido</h3>
                <p className="text-sm" style={{ color: 'var(--primary)' }}>{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full" style={{ background: 'var(--card)', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Cliente',  value: selected.cliente },
                { label: 'Email',    value: selected.email },
                { label: 'Producto', value: selected.producto },
                { label: 'Monto',    value: formatCLP(selected.monto) },
                { label: 'Método',   value: selected.metodo },
                { label: 'Fecha',    value: selected.fecha },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Estado</span>
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
                  style={{ background: ESTADO_CONFIG[selected.estado].bg, color: ESTADO_CONFIG[selected.estado].color }}
                >
                  {selected.estado}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
