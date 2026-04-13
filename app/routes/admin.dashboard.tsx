import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";

// --- DATOS DE PRUEBA (MOCKS) ---
const MOCK_HISTORY = [
  { month: "Nov", sales: 4500 },
  { month: "Dic", sales: 8200 },
  { month: "Ene", sales: 5100 },
  { month: "Feb", sales: 6300 },
  { month: "Mar", sales: 7400 },
  { month: "Abr", sales: 4200 },
];

const MOCK_ALERTS = [
  { id: 1, product: "Mica Cerámica iPhone 13", stock: 2, location: "Local N° 22" },
  { id: 2, product: "Funda Transparente A54", stock: 5, location: "Local N° 106" },
];

const MOCK_RECENT_SALES = [
  { id: 1, product: "Cargador 25W", amount: 65, time: "10:30 AM", location: "Local N° 22" },
  { id: 2, product: "Audífonos Bluetooth", amount: 120, time: "11:15 AM", location: "Local N° 106" },
];

export default function Dashboard() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 1. MÉTRICAS PRINCIPALES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Ventas de Hoy" 
          value="S/ 850" 
          icon={<DollarSign className="h-4 w-4" />} 
          subtitle="12 transacciones hoy"
        />
        <MetricCard 
          title="Stock Total" 
          value="1,240" 
          icon={<Package className="h-4 w-4" />} 
          subtitle={`${MOCK_ALERTS.length} alertas críticas`}
          trend="negative"
        />
        <MetricCard 
          title="Ventas del Mes" 
          value="S/ 12,400" 
          icon={<ShoppingCart className="h-4 w-4" />} 
          subtitle={currentStore.name}
        />
        <MetricCard 
          title="Rendimiento" 
          value="+14%" 
          icon={<TrendingUp className="h-4 w-4" />} 
          subtitle="vs. mes anterior"
          trend="positive"
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
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
          <div className="space-y-4">
            {MOCK_ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">{alert.product}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {alert.location}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${alert.stock <= 2 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  {alert.stock} unids.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. VENTAS RECIENTES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Últimas Transacciones</h3>
        </div>
        <div className="p-0">
          {MOCK_RECENT_SALES.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{sale.product}</p>
                  <p className="text-xs text-slate-400">{sale.time} • {sale.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">S/ {sale.amount}</p>
                <p className="text-[10px] text-green-600 font-bold uppercase">Completado</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  trend?: 'positive' | 'negative';
}

function MetricCard({ title, value, icon, subtitle, trend }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'positive' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
      <div className="text-2xl font-black text-slate-800 my-1">{value}</div>
      <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}