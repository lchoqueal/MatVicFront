import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ShoppingCart,
  Calendar,
  Search,
  TrendingUp,
  X,
  Package,
  Loader2,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import type { PaymentMethod } from "~/types/sales";
import type { Product } from "~/types/inventory";
import { api } from "~/lib/api";
import { useAuth } from "~/context/auth";

const PAYMENT_METHODS: PaymentMethod[] = ["Efectivo", "Tarjeta", "Transferencia", "Yape", "Plin"];

// ── Tipos de API ──────────────────────────────────────────────────────────────

interface ProductosResponse {
  cantidad: number;
  productos: Product[];
}

interface Boleta {
  id_boleta: number;
  total: number | string;
  fecha_emision: string;
  metodo_pago: string;
  estado_boleta: string;
  id_empleado_boleta: number;
  id_local?: number;
}

interface ReporteVentas {
  cantidadVentas: number;
  totalVentas: number;
  promedioVenta: number;
  boletas: Boleta[];
}

interface CarritoResponse {
  id_carrito?: number;
  idCarrito?: number;
}

interface BoletaResponse {
  id_boleta?: number;
  idBoleta?: number;
  total?: number;
}

// ── Tipo interno para el carrito en memoria ───────────────────────────────────

interface CartItem {
  producto: Product;
  cantidad: number;
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function SalesManagement() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  const { user } = useAuth();

  const [productos, setProductos] = useState<Product[]>([]);
  const [boletasHoy, setBoletasHoy] = useState<Boleta[]>([]);
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);
  const [isLoadingBoletas, setIsLoadingBoletas] = useState(true);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState<string>("all");

  // Cargar productos del backend
  const cargarProductos = useCallback(async () => {
    setIsLoadingProductos(true);
    try {
      const data = await api.get<ProductosResponse>("/productos");
      setProductos(data.productos);
    } catch {
      // si falla, quedamos con lista vacía
    } finally {
      setIsLoadingProductos(false);
    }
  }, []);

  // Cargar boletas del día (usando reporte con fechas de hoy)
  const cargarBoletasHoy = useCallback(async () => {
    setIsLoadingBoletas(true);
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const data = await api.get<ReporteVentas>(
        `/reportes/ventas?fechaInicio=${hoy}&fechaFin=${hoy}`
      );
      setBoletasHoy(data.boletas ?? []);
    } catch {
      setBoletasHoy([]);
    } finally {
      setIsLoadingBoletas(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
    cargarBoletasHoy();
  }, [cargarProductos, cargarBoletasHoy]);

  // Métricas filtradas por local seleccionado
  const boletasLocal = boletasHoy.filter(
    (b) => b.id_local == null || b.id_local === currentStore.id
  );
  const todayTotal = boletasLocal.reduce((sum, b) => sum + Number(b.total), 0);
  const ticketPromedio =
    boletasLocal.length > 0 ? Math.round(todayTotal / boletasLocal.length) : 0;

  // Filtro de búsqueda sobre las boletas ya filtradas por local
  const filtered = boletasLocal.filter((b) => {
    const matchSearch = String(b.id_boleta).includes(searchTerm) || b.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPay = filterPayment === "all" || b.metodo_pago === filterPayment;
    return matchSearch && matchPay;
  });

  const handleVentaCompletada = () => {
    setIsNewSaleOpen(false);
    cargarBoletasHoy(); // refrescar lista
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Ventas de Hoy"
          value={isLoadingBoletas ? "—" : String(boletasLocal.length)}
          suffix={`transacciones — ${currentStore.name}`}
          icon={<ShoppingCart className="h-4 w-4" />}
          isLoading={isLoadingBoletas}
          delay={0}
        />
        <StatCard
          title="Ingresos de Hoy"
          value={isLoadingBoletas ? "—" : `S/ ${todayTotal.toFixed(2)}`}
          suffix={`total facturado — ${currentStore.name}`}
          icon={<Calendar className="h-4 w-4" />}
          isLoading={isLoadingBoletas}
          delay={75}
        />
        <StatCard
          title="Ticket Promedio"
          value={isLoadingBoletas ? "—" : `S/ ${ticketPromedio}`}
          suffix="por venta"
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoadingBoletas}
          delay={150}
        />
      </div>

      {/* 2. BARRA DE FILTROS + BOTÓN */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por N° boleta o método de pago..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={cargarBoletasHoy}
            disabled={isLoadingBoletas}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingBoletas ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsNewSaleOpen(true)}
            className="flex items-center justify-center gap-2 bg-pickled-bluewood-600 hover:bg-pickled-bluewood-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-sm"
          >
            <Plus className="h-5 w-5" /> Nueva Venta
          </button>
        </div>
      </div>

      {/* 3. TABLA DE HISTORIAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-pickled-bluewood-800 text-lg">
            Boletas de Hoy — {currentStore.name}
          </h3>
          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-md">
            {isLoadingBoletas ? "Cargando..." : `${filtered.length} boleta${filtered.length !== 1 ? "s" : ""} en este local`}
          </span>
        </div>

        {isLoadingBoletas ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-pickled-bluewood-600 font-medium">No hay boletas para hoy</p>
            <p className="text-sm text-slate-400 mt-1">
              Registra una nueva venta para comenzar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-pickled-bluewood-50 text-pickled-bluewood-700 text-xs uppercase font-bold tracking-wide">
                <tr>
                  <th className="px-6 py-4">N° Boleta</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Método de Pago</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pickled-bluewood-100">
                {filtered.map((boleta, i) => (
                  <tr
                    key={boleta.id_boleta}
                    className="hover:bg-pickled-bluewood-50/70 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                  >
                    <td className="px-6 py-4 font-bold text-pickled-bluewood-800">
                      #{boleta.id_boleta}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(boleta.fecha_emision).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-pickled-bluewood-50 border border-pickled-bluewood-100 rounded text-xs font-medium text-pickled-bluewood-700">
                        {boleta.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-pickled-bluewood-800">
                      S/ {Number(boleta.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        boleta.estado_boleta === "pagado"
                          ? "bg-green-100 text-green-700"
                          : boleta.estado_boleta === "cancelado"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
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

      {/* MODAL DE NUEVA VENTA */}
      {isNewSaleOpen && (
        <NewSaleModal
          onClose={() => setIsNewSaleOpen(false)}
          onCompleted={handleVentaCompletada}
          productos={productos}
          isLoadingProductos={isLoadingProductos}
          storeName={currentStore.name}
          storeId={currentStore.id}
          empleadoId={user?.id ?? null}
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
  isLoading,
  delay = 0,
}: {
  title: string;
  value: string;
  suffix: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  delay?: number;
}) {
  return (
    <div 
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex justify-between items-start text-pickled-bluewood-400 mb-2">
        <span className="text-sm font-medium text-pickled-bluewood-700">{title}</span>
        {icon}
      </div>
      <div className={`text-3xl font-bold text-pickled-bluewood-800 ${isLoading ? "animate-pulse" : ""}`}>
        {value}
      </div>
      <p className="text-xs text-slate-400 mt-1">{suffix}</p>
    </div>
  );
}

// ── Modal de nueva venta ─────────────────────────────────────────────────────

interface NewSaleModalProps {
  onClose: () => void;
  onCompleted: () => void;
  productos: Product[];
  isLoadingProductos: boolean;
  storeName: string;
  storeId: number;
  empleadoId: number | null;
}

function NewSaleModal({
  onClose,
  onCompleted,
  productos,
  isLoadingProductos,
  storeName,
  storeId,
  empleadoId,
}: NewSaleModalProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  const filteredProductos = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.categoria === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalSale = cart.reduce(
    (sum, item) => sum + Number(item.producto.precio_unit) * item.cantidad,
    0
  );

  const addItem = (producto: Product) => {
    setCart((prev) => {
      const existe = prev.find((i) => i.producto.id_producto === producto.id_producto);
      if (existe) {
        return prev.map((i) =>
          i.producto.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const removeItem = (idProducto: number) =>
    setCart((prev) => prev.filter((i) => i.producto.id_producto !== idProducto));

  const updateQty = (idProducto: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((i) =>
        i.producto.id_producto === idProducto ? { ...i, cantidad: qty } : i
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !paymentMethod) {
      setSubmitError("Agrega al menos un producto y selecciona el método de pago.");
      return;
    }
    if (!empleadoId) {
      setSubmitError("No se pudo identificar al empleado. Por favor vuelve a iniciar sesión.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Crear carrito de venta física
      const carritoData = await api.post<CarritoResponse>("/carrito", {
        tipoCarrito: "venta_fisica",
        idEmpleado: empleadoId,
      });
      const idCarrito = carritoData.id_carrito ?? carritoData.idCarrito;

      if (!idCarrito) throw new Error("No se pudo crear el carrito");

      // 2. Agregar cada item al carrito
      for (const item of cart) {
        await api.post(`/carrito/${idCarrito}/items`, {
          idProducto: item.producto.id_producto,
          cantidad: item.cantidad,
        });
      }

      // 3. Confirmar la boleta
      await api.post<BoletaResponse>("/boleta", {
        idCarrito,
        tipoVenta: "fisica",
        metodoPago: paymentMethod,
        idEmpleado: empleadoId,
        idLocal: storeId,
      });

      onCompleted();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Error al registrar la venta. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-pickled-bluewood-800">Registrar Nueva Venta</h2>
            <p className="text-xs text-pickled-bluewood-500 mt-0.5">Local: {storeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Panel catálogo */}
          <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col overflow-hidden" style={{ maxHeight: '45vh' }}>
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
              {isLoadingProductos ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
              ) : filteredProductos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Package className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Sin productos</p>
                </div>
              ) : (
                filteredProductos.map((p) => (
                  <div
                    key={p.id_producto}
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-pickled-bluewood-800 text-sm">{p.nombre}</p>
                      <p className="text-xs text-blue-600 font-bold">
                        S/ {Number(p.precio_unit).toFixed(2)}
                        <span className="text-slate-400 font-normal ml-2">Stock: {p.stock}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(p)}
                      disabled={p.stock === 0}
                      className="px-3 py-1.5 bg-pickled-bluewood-100 text-pickled-bluewood-800 text-xs font-bold rounded-lg hover:bg-pickled-bluewood-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      + Agregar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel ticket */}
          <div className="w-full md:w-1/2 p-4 flex flex-col bg-slate-50/30" style={{ minHeight: 0 }}>
            <h3 className="font-bold text-pickled-bluewood-800 mb-3 flex items-center gap-2 shrink-0">
              <ShoppingCart className="h-4 w-4" /> Detalle del Ticket
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Package className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Sin productos en la venta</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.producto.id_producto}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-pickled-bluewood-800 text-sm truncate">
                        {item.producto.nombre}
                      </p>
                      <p className="text-xs text-slate-400">
                        S/ {Number(item.producto.precio_unit).toFixed(2)} c/u •{" "}
                        <span className="font-bold text-pickled-bluewood-700">
                          S/ {(Number(item.producto.precio_unit) * item.cantidad).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        value={item.cantidad}
                        min={1}
                        max={item.producto.stock}
                        onChange={(e) =>
                          updateQty(item.producto.id_producto, Number(e.target.value))
                        }
                        className="w-14 text-center border border-slate-200 rounded-lg text-sm py-1 outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.producto.id_producto)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer del ticket */}
            <form onSubmit={handleSubmit} className="space-y-3 shrink-0 border-t border-slate-200 pt-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {submitError}
                </div>
              )}

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
                disabled={cart.length === 0 || !paymentMethod || isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-pickled-bluewood-600 text-white py-3 rounded-xl font-bold hover:bg-pickled-bluewood-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Receipt className="h-5 w-5" />
                    Registrar Venta
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}