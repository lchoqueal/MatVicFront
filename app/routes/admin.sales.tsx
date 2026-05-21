import { useState } from "react";
import {
  Plus,
  ShoppingCart,
  Calendar,
  Search,
  TrendingUp,
  X,
  MapPin,
  Package,
} from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import type { Sale, SaleItem, PaymentMethod } from "~/types/sales";
import type { Product } from "~/types/inventory";

// ── Datos mock iniciales ─────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  { id_producto: 1, nombre: "Funda Silicona iPhone 15", descripcion: "Color negro mate", categoria: "Fundas",    precio_unit: 45, stock: 12, min_stock: 5 },
  { id_producto: 2, nombre: "Cargador Carga Rápida 25W", descripcion: "Original Samsung", categoria: "Cargadores", precio_unit: 65, stock: 8,  min_stock: 5 },
  { id_producto: 3, nombre: "Mica Cerámica Privacidad",  descripcion: "iPhone y Samsung",  categoria: "Micas",    precio_unit: 25, stock: 30, min_stock: 10 },
  { id_producto: 4, nombre: "Audífonos In-Ear Bluetooth",descripcion: "Hasta 20h batería", categoria: "Audio",    precio_unit: 120,stock: 5,  min_stock: 3 },
];

const MOCK_SALES: Sale[] = [
  {
    id: "BOL-001",
    date: "2026-05-21",
    time: "14:30",
    customerName: "Juan Pérez",
    location: "Local N° 22",
    total: 110,
    paymentMethod: "Efectivo",
    items: [
      { productId: 1, productName: "Funda Silicona iPhone 15", quantity: 1, unitPrice: 45, total: 45 },
      { productId: 2, productName: "Cargador Carga Rápida 25W", quantity: 1, unitPrice: 65, total: 65 },
    ],
  },
];

const PAYMENT_METHODS: PaymentMethod[] = ["Efectivo", "Tarjeta", "Transferencia", "Yape", "Plin"];

// ── Página principal ─────────────────────────────────────────────────────────

export default function SalesManagement() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();

  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState<string>("all");

  // Métricas del día (sobre los datos en memoria)
  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.date === today);
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const ticketPromedio = todaySales.length > 0 ? Math.round(todayTotal / todaySales.length) : 0;

  // Filtro de tabla
  const filtered = sales.filter((s) => {
    const matchSearch =
      (s.customerName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchPay = filterPayment === "all" || s.paymentMethod === filterPayment;
    return matchSearch && matchPay;
  });

  const handleNewSale = (sale: Sale) => {
    setSales((prev) => [sale, ...prev]);
    setIsNewSaleOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Ventas de Hoy"   value={todaySales.length} suffix="transacciones"  icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard title="Ingresos de Hoy" value={`S/ ${todayTotal}`} suffix="total facturado" icon={<Calendar     className="h-4 w-4" />} />
        <StatCard title="Ticket Promedio" value={`S/ ${ticketPromedio}`} suffix="por venta"  icon={<TrendingUp   className="h-4 w-4" />} />
      </div>

      {/* 2. BARRA DE FILTROS + BOTÓN */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-3 w-full md:w-auto flex-1">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o producto..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filtro de pago */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm bg-white"
          >
            <option value="all">Todos los métodos</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsNewSaleOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-pickled-bluewood-600 hover:bg-pickled-bluewood-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus className="h-5 w-5" /> Nueva Venta
        </button>
      </div>

      {/* 3. TABLA DE HISTORIAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-pickled-bluewood-800 text-lg">
            Historial de Ventas — {currentStore.name}
          </h3>
          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-md">
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-pickled-bluewood-600 font-medium">No hay ventas registradas</p>
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm || filterPayment !== "all"
                ? "Prueba con otros filtros de búsqueda"
                : "Las ventas aparecerán aquí una vez registradas"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pickled-bluewood-50 text-pickled-bluewood-700 text-xs uppercase font-bold tracking-wide">
                <tr>
                  <th className="px-6 py-4">Fecha / Hora</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Local</th>
                  <th className="px-6 py-4">Productos</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pickled-bluewood-100">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-pickled-bluewood-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-pickled-bluewood-800">
                        {new Date(sale.date + "T00:00:00").toLocaleDateString("es-PE")}
                      </div>
                      <div className="text-xs text-slate-400">{sale.time}</div>
                    </td>
                    <td className="px-6 py-4 text-pickled-bluewood-700">
                      {sale.customerName || "Cliente general"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs font-medium text-pickled-bluewood-700 bg-pickled-bluewood-50 border border-pickled-bluewood-100 px-2 py-0.5 rounded w-fit">
                        <MapPin className="h-3 w-3" />
                        {sale.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      {sale.items.map((item, i) => (
                        <div key={i} className="text-sm text-pickled-bluewood-700">
                          {item.quantity}× {item.productName}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 font-bold text-pickled-bluewood-800">
                      S/ {sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-pickled-bluewood-50 border border-pickled-bluewood-100 rounded text-xs font-medium text-pickled-bluewood-700">
                        {sale.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE NUEVA VENTA */}
      {isNewSaleOpen && (
        <NewSaleModal
          onClose={() => setIsNewSaleOpen(false)}
          onSave={handleNewSale}
          products={MOCK_PRODUCTS}
          storeName={currentStore.name}
        />
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  suffix,
  icon,
}: {
  title: string;
  value: number | string;
  suffix: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start text-pickled-bluewood-400 mb-2">
        <span className="text-sm font-medium text-pickled-bluewood-700">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-pickled-bluewood-800">{value}</div>
      <p className="text-xs text-slate-400 mt-1">{suffix}</p>
    </div>
  );
}

// ── Modal de nueva venta ─────────────────────────────────────────────────────

interface NewSaleModalProps {
  onClose: () => void;
  onSave: (sale: Sale) => void;
  products: Product[];
  storeName: string;
}

function NewSaleModal({ onClose, onSave, products, storeName }: NewSaleModalProps) {
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [...new Set(products.map((p) => p.categoria))];
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.categoria === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalSale = cartItems.reduce((sum, i) => sum + i.total, 0);

  const addItem = (product: Product) => {
    const exists = cartItems.find((i) => i.productId === product.id_producto);
    if (exists) {
      setCartItems(
        cartItems.map((i) =>
          i.productId === product.id_producto
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id_producto,
          productName: product.nombre,
          quantity: 1,
          unitPrice: product.precio_unit,
          total: product.precio_unit,
        },
      ]);
    }
  };

  const removeItem = (productId: number) =>
    setCartItems(cartItems.filter((i) => i.productId !== productId));

  const updateQty = (productId: number, qty: number) => {
    if (qty < 1) return;
    setCartItems(
      cartItems.map((i) =>
        i.productId === productId ? { ...i, quantity: qty, total: qty * i.unitPrice } : i
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !paymentMethod) {
      alert("Agrega al menos un producto y selecciona el método de pago.");
      return;
    }
    const now = new Date();
    onSave({
      id: `BOL-${Date.now()}`,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
      items: cartItems,
      total: totalSale,
      paymentMethod,
      customerName: customerName.trim() || undefined,
      location: storeName,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-pickled-bluewood-800">Registrar Nueva Venta</h2>
            <p className="text-xs text-pickled-bluewood-500 mt-0.5">Local: {storeName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Panel izquierdo — Catálogo */}
          <div className="w-1/2 p-4 border-r border-slate-100 flex flex-col overflow-hidden">
            <div className="space-y-3 mb-3 shrink-0">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              />
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-pickled-bluewood-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-pickled-bluewood-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {filteredProducts.map((p) => (
                <div key={p.id_producto} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-pickled-bluewood-800 text-sm">{p.nombre}</p>
                    <p className="text-xs text-blue-600 font-bold">S/ {p.precio_unit.toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addItem(p)}
                    className="px-3 py-1.5 bg-pickled-bluewood-100 text-pickled-bluewood-800 text-xs font-bold rounded-lg hover:bg-pickled-bluewood-600 hover:text-white transition-all"
                  >
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho — Ticket */}
          <div className="w-1/2 p-4 flex flex-col bg-slate-50/30">
            <h3 className="font-bold text-pickled-bluewood-800 mb-3 flex items-center gap-2 shrink-0">
              <ShoppingCart className="h-4 w-4" /> Detalle del Ticket
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Package className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Sin productos en la venta</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-pickled-bluewood-800 text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-slate-400">S/ {item.unitPrice.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                        className="w-14 text-center border border-slate-200 rounded-lg text-sm py-1 outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                      />
                      <button type="button" onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer del ticket */}
            <form onSubmit={handleSubmit} className="space-y-3 shrink-0 border-t border-slate-200 pt-4">
              <input
                type="text"
                placeholder="Nombre del cliente (opcional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-pickled-bluewood-600 bg-white"
              >
                <option value="">Seleccionar método de pago *</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="flex justify-between items-center font-bold text-lg">
                <span className="text-pickled-bluewood-700">Total:</span>
                <span className="text-pickled-bluewood-800">S/ {totalSale.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                disabled={cartItems.length === 0 || !paymentMethod}
                className="w-full bg-pickled-bluewood-600 text-white py-3 rounded-xl font-bold hover:bg-pickled-bluewood-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                Registrar Venta
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}