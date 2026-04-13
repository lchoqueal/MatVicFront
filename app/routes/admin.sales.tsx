import { useState } from "react";
import { Plus, ShoppingCart, Calendar, Search, TrendingUp, X, Star } from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";

// --- DATOS DE PRUEBA (MOCKS) ---
const MOCK_PRODUCTS: any[] = [
  { id_producto: 1, nombre: "Funda iPhone 15", precio_unit: 45, categoria: "Fundas" },
  { id_producto: 2, nombre: "Cargador 25W", precio_unit: 65, categoria: "Carga" },
];

const MOCK_SALES: any[] = [
  {
    id: "BOL-001",
    date: "2026-04-12",
    time: "14:30",
    customerName: "Juan Pérez",
    location: "Local N° 22",
    total: 110,
    paymentMethod: "Efectivo",
    items: [{ productName: "Funda iPhone 15", quantity: 1 }, { productName: "Cargador 25W", quantity: 1 }]
  }
];

export default function SalesManagement() {
  // Obtenemos el local seleccionado desde el Layout
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  
  const [sales] = useState(MOCK_SALES);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const todayTotal = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Ventas de Hoy" value={sales.length.toString()} icon={<ShoppingCart />} subtitle="transacciones" />
        <StatCard title="Ingresos de Hoy" value={`S/ ${todayTotal}`} icon={<Calendar />} subtitle="total facturado" />
        <StatCard title="Ticket Promedio" value={`S/ ${sales.length > 0 ? (todayTotal/sales.length).toFixed(0) : 0}`} icon={<TrendingUp />} subtitle="por cliente" />
      </div>

      {/* 2. FILTROS Y ACCIÓN */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o producto..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsNewSaleOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
        >
          <Plus className="h-5 w-5" /> Nueva Venta
        </button>
      </div>

      {/* 3. TABLA DE HISTORIAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">Historial de Ventas - {currentStore.name}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Fecha/Hora</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Productos</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{sale.date}</div>
                    <div className="text-xs text-slate-400">{sale.time}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{sale.customerName || "General"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {sale.items.map((it: any, i: number) => (
                      <div key={i}>{it.quantity}x {it.productName}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">S/ {sale.total}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase">
                      {sale.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE VENTA */}
      {isNewSaleOpen && (
        <NewSaleModal 
          onClose={() => setIsNewSaleOpen(false)} 
          storeName={currentStore.name}
          products={MOCK_PRODUCTS}
        />
      )}
    </div>
  );
}

// --- SUBCOMPONENTES AUXILIARES ---

function StatCard({ title, value, icon, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start text-slate-400 mb-2">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

function NewSaleModal({ onClose, storeName, products }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const total = cart.reduce((sum, item) => sum + (item.precio_unit * item.quantity), 0);

  const addToCart = (p: any) => {
    const exists = cart.find(i => i.id_producto === p.id_producto);
    if (exists) {
      setCart(cart.map(i => i.id_producto === p.id_producto ? {...i, quantity: i.quantity + 1} : i));
    } else {
      setCart([...cart, {...p, quantity: 1}]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Nueva Venta Física</h2>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{storeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Listado de Productos */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-100">
            <div className="grid grid-cols-1 gap-3">
              {products.map((p: any) => (
                <div key={p.id_producto} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-700">{p.nombre}</p>
                    <p className="text-sm text-blue-600 font-bold">S/ {p.precio_unit}</p>
                  </div>
                  <button onClick={() => addToCart(p)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Carrito / Resumen */}
          <div className="w-1/2 p-6 bg-slate-50 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Detalle del Ticket
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.map(item => (
                <div key={item.id_producto} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                  <div className="text-sm">
                    <p className="font-bold text-slate-700">{item.nombre}</p>
                    <p className="text-slate-400">{item.quantity} x S/ {item.precio_unit}</p>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">S/ {item.quantity * item.precio_unit}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-medium">Total a Pagar:</span>
                <span className="text-3xl font-black text-slate-800">S/ {total}</span>
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                Finalizar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}