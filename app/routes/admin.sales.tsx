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
  LayoutList,
  CreditCard,
} from "lucide-react";
import { useOutletContext } from "react-router";
import type { Store } from "~/components/ui/StoreSelector";
import type { PaymentMethod } from "~/types/sales";
import type { Product } from "~/types/inventory";
import { api } from "~/lib/api";
import { useAuth } from "~/context/auth";
import { formatCLP } from "~/lib/utils";

const PAYMENT_METHODS: PaymentMethod[] = ["Efectivo", "Débito", "Crédito", "Transferencia", "Giro BancoEstado"];

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

interface CartItem {
  producto: Product;
  cantidad: number;
}

type ViewMode = "tabla" | "pos";

// ── Página principal ──────────────────────────────────────────────────────────

export default function SalesManagement() {
  const { currentStore } = useOutletContext<{ currentStore: Store }>();
  const { user, isAdmin } = useAuth();

  // El admin entra en "tabla", el empleado entra directo en "pos"
  const [viewMode, setViewMode] = useState<ViewMode>(isAdmin ? "tabla" : "pos");

  const [productos, setProductos] = useState<Product[]>([]);
  const [boletasHoy, setBoletasHoy] = useState<Boleta[]>([]);
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);
  const [isLoadingBoletas, setIsLoadingBoletas] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState<string>("all");

  const cargarProductos = useCallback(async () => {
    setIsLoadingProductos(true);
    try {
      const data = await api.get<ProductosResponse>("/productos");
      setProductos(data.productos);
    } catch {
      // lista vacía si falla
    } finally {
      setIsLoadingProductos(false);
    }
  }, []);

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

  const boletasLocal = boletasHoy.filter(
    (b) => b.id_local == null || b.id_local === currentStore.id
  );
  const todayTotal    = boletasLocal.reduce((sum, b) => sum + Number(b.total), 0);
  const ticketPromedio = boletasLocal.length > 0 ? Math.round(todayTotal / boletasLocal.length) : 0;

  const filtered = boletasLocal.filter((b) => {
    const matchSearch = String(b.id_boleta).includes(searchTerm) || b.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPay = filterPayment === "all" || b.metodo_pago === filterPayment;
    return matchSearch && matchPay;
  });

  const handleVentaCompletada = () => {
    cargarBoletasHoy();
    // Volver a la tabla si el admin estaba en POS
    if (isAdmin) setViewMode("tabla");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── TOGGLE DE VISTA ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {viewMode === "tabla" ? "Ventas del Día" : "Modo Caja"}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {currentStore.name}
          </p>
        </div>

        {/* Toggle: Vista Ventas / Modo Caja */}
        <div
          className="flex items-center p-1 rounded-xl gap-1"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}
        >
          <button
            type="button"
            onClick={() => setViewMode("tabla")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              viewMode === "tabla"
                ? "bg-pickled-bluewood-600 text-white shadow-sm"
                : "hover:bg-pickled-bluewood-500/10"
            }`}
            style={viewMode !== "tabla" ? { color: "var(--text-secondary)" } : {}}
          >
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">Vista Ventas</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("pos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              viewMode === "pos"
                ? "bg-pickled-bluewood-600 text-white shadow-sm"
                : "hover:bg-pickled-bluewood-500/10"
            }`}
            style={viewMode !== "pos" ? { color: "var(--text-secondary)" } : {}}
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Modo Caja</span>
          </button>
        </div>
      </div>

      {/* ── VISTA TABLA ─────────────────────────────────────────────────────── */}
      {viewMode === "tabla" && (
        <TablaVentas
          boletasLocal={boletasLocal}
          filtered={filtered}
          todayTotal={todayTotal}
          ticketPromedio={ticketPromedio}
          isLoadingBoletas={isLoadingBoletas}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPayment={filterPayment}
          setFilterPayment={setFilterPayment}
          cargarBoletasHoy={cargarBoletasHoy}
          currentStoreName={currentStore.name}
          onNuevaVenta={() => setViewMode("pos")}
        />
      )}

      {/* ── MODO CAJA / POS ─────────────────────────────────────────────────── */}
      {viewMode === "pos" && (
        <POSView
          productos={productos}
          isLoadingProductos={isLoadingProductos}
          storeName={currentStore.name}
          storeId={currentStore.id}
          empleadoId={user?.id ?? null}
          empleadoNombre={user ? `${user.nombre} ${user.apellidos}` : "—"}
          onVentaCompletada={handleVentaCompletada}
        />
      )}
    </div>
  );
}

// ── Vista Tabla ───────────────────────────────────────────────────────────────

interface TablaVentasProps {
  boletasLocal: Boleta[];
  filtered: Boleta[];
  todayTotal: number;
  ticketPromedio: number;
  isLoadingBoletas: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterPayment: string;
  setFilterPayment: (v: string) => void;
  cargarBoletasHoy: () => void;
  currentStoreName: string;
  onNuevaVenta: () => void;
}

function TablaVentas({
  boletasLocal, filtered, todayTotal, ticketPromedio,
  isLoadingBoletas, searchTerm, setSearchTerm,
  filterPayment, setFilterPayment, cargarBoletasHoy,
  currentStoreName, onNuevaVenta,
}: TablaVentasProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Ventas de Hoy" value={isLoadingBoletas ? "—" : String(boletasLocal.length)}
          suffix={`transacciones — ${currentStoreName}`} icon={<ShoppingCart className="h-4 w-4" />}
          isLoading={isLoadingBoletas} delay={0} />
        <StatCard title="Ingresos de Hoy" value={isLoadingBoletas ? "—" : formatCLP(todayTotal)}
          suffix={`total facturado — ${currentStoreName}`} icon={<Calendar className="h-4 w-4" />}
          isLoading={isLoadingBoletas} delay={75} />
        <StatCard title="Ticket Promedio" value={isLoadingBoletas ? "—" : formatCLP(ticketPromedio)}
          suffix="por venta" icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoadingBoletas} delay={150} />
      </div>

      {/* Filtros + botón */}
      <div
        className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar por N° boleta o método de pago..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm transition-colors"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
          >
            <option value="all">Todos los métodos</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={cargarBoletasHoy} disabled={isLoadingBoletas}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingBoletas ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={onNuevaVenta}
            className="flex items-center justify-center gap-2 bg-pickled-bluewood-600 hover:bg-pickled-bluewood-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-sm hover:scale-[1.02]">
            <Plus className="h-5 w-5" /> Nueva Venta
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
        <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            Boletas de Hoy — {currentStoreName}
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: "var(--bg-muted)", color: "var(--text-muted)" }}>
            {isLoadingBoletas ? "Cargando..." : `${filtered.length} boleta${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {isLoadingBoletas ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
            ))}
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
                  <tr
                    key={boleta.id_boleta}
                    className="transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--text-primary)" }}>#{boleta.id_boleta}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {new Date(boleta.fecha_emision).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                        {boleta.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatCLP(Number(boleta.total))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        boleta.estado_boleta === "pagado" ? "bg-emerald-500/10 text-emerald-500" :
                        boleta.estado_boleta === "cancelado" ? "bg-red-500/10 text-red-400" :
                        "bg-amber-500/10 text-amber-500"
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
    </div>
  );
}

// ── Vista POS ─────────────────────────────────────────────────────────────────

interface POSViewProps {
  productos: Product[];
  isLoadingProductos: boolean;
  storeName: string;
  storeId: number;
  empleadoId: number | null;
  empleadoNombre: string;
  onVentaCompletada: () => void;
}

function POSView({
  productos, isLoadingProductos, storeName, storeId,
  empleadoId, empleadoNombre, onVentaCompletada,
}: POSViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const categories = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  const filteredProductos = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.categoria === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalSale = cart.reduce((sum, item) => sum + Number(item.producto.precio_unit) * item.cantidad, 0);

  const addItem = (producto: Product) => {
    setCart((prev) => {
      const existe = prev.find((i) => i.producto.id_producto === producto.id_producto);
      if (existe) return prev.map((i) => i.producto.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const removeItem = (id: number) => setCart((prev) => prev.filter((i) => i.producto.id_producto !== id));

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => i.producto.id_producto === id ? { ...i, cantidad: qty } : i));
  };

  const clearCart = () => {
    setCart([]);
    setPaymentMethod("");
    setSubmitError(null);
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
      const carritoData = await api.post<CarritoResponse>("/carrito", {
        tipoCarrito: "venta_fisica",
        idEmpleado: empleadoId,
      });
      const idCarrito = carritoData.id_carrito ?? carritoData.idCarrito;
      if (!idCarrito) throw new Error("No se pudo crear el carrito");

      for (const item of cart) {
        await api.post(`/carrito/${idCarrito}/items`, {
          idProducto: item.producto.id_producto,
          cantidad: item.cantidad,
        });
      }

      await api.post<BoletaResponse>("/boleta", {
        idCarrito,
        tipoVenta: "fisica",
        metodoPago: paymentMethod,
        idEmpleado: empleadoId,
        idLocal: storeId,
      });

      setSuccessMsg(`✓ Venta registrada — ${formatCLP(totalSale)} — ${paymentMethod}`);
      clearCart();
      onVentaCompletada();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al registrar la venta. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-220px)] min-h-[500px]">

      {/* ── Panel Catálogo (izquierda) ────────────────────────────────────── */}
      <div
        className="flex flex-col flex-1 rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}
      >
        {/* Buscador y filtro categorías */}
        <div className="p-4 border-b space-y-3 shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar producto rápido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pickled-bluewood-600 transition-colors"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <CategoryBtn label="Todos" active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")} />
            {categories.map((cat) => (
              <CategoryBtn key={cat} label={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoadingProductos ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
              ))}
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <Package className="h-10 w-10 mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProductos.map((p) => {
                const inCart = cart.find((i) => i.producto.id_producto === p.id_producto);
                const sinStock = p.stock === 0;
                return (
                  <button
                    key={p.id_producto}
                    type="button"
                    onClick={() => !sinStock && addItem(p)}
                    disabled={sinStock}
                    className={`relative flex flex-col items-start text-left p-3 rounded-xl border transition-all duration-200 group ${
                      sinStock ? "opacity-40 cursor-not-allowed" : "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                    }`}
                    style={{
                      background: inCart ? "var(--bg-surface-2)" : "var(--bg-surface-2)",
                      borderColor: inCart ? "hsl(210, 28%, 37%)" : "var(--border-subtle)",
                    }}
                  >
                    {/* Badge cantidad en carrito */}
                    {inCart && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pickled-bluewood-600 text-white text-[10px] font-black flex items-center justify-center">
                        {inCart.cantidad}
                      </span>
                    )}
                    {/* Imagen o icono */}
                    <div className="w-full aspect-square rounded-lg mb-2 overflow-hidden flex items-center justify-center"
                      style={{ background: "var(--bg-muted)" }}>
                      {p.imagen_url ? (
                        <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                    <p className="text-xs font-semibold line-clamp-2 leading-tight mb-1" style={{ color: "var(--text-primary)" }}>
                      {p.nombre}
                    </p>
                    <p className="text-sm font-black" style={{ color: "hsl(210, 28%, 37%)" }}>
                      {formatCLP(Number(p.precio_unit))}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: sinStock ? "var(--text-muted)" : "var(--text-muted)" }}>
                      {sinStock ? "Sin stock" : `Stock: ${p.stock}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Panel Ticket (derecha) ────────────────────────────────────────── */}
      <div
        className="flex flex-col w-full lg:w-80 xl:w-96 rounded-2xl overflow-hidden shrink-0"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}
      >
        {/* Header ticket */}
        <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Ticket</h3>
            {cart.length > 0 && (
              <button type="button" onClick={clearCart}
                className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-red-500/10 text-red-400 font-medium">
                Vaciar
              </button>
            )}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            📍 {storeName} · 👤 {empleadoNombre.split(" ")[0]}
          </p>
        </div>

        {/* Mensaje de éxito */}
        {successMsg && (
          <div className="mx-4 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl font-medium animate-in fade-in duration-300">
            {successMsg}
          </div>
        )}

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <ShoppingCart className="h-10 w-10 mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Toca un producto para agregarlo</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.producto.id_producto}
                className="flex items-center gap-2 p-2.5 rounded-xl animate-in fade-in slide-in-from-right-2 duration-200"
                style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {item.producto.nombre}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {formatCLP(Number(item.producto.precio_unit))} c/u ·{" "}
                    <span className="font-bold" style={{ color: "var(--text-secondary)" }}>
                      {formatCLP(Number(item.producto.precio_unit) * item.cantidad)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => updateQty(item.producto.id_producto, item.cantidad - 1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors hover:bg-pickled-bluewood-500/10"
                    style={{ border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>−</button>
                  <span className="w-7 text-center text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item.cantidad}</span>
                  <button type="button" onClick={() => updateQty(item.producto.id_producto, item.cantidad + 1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors hover:bg-pickled-bluewood-500/10"
                    style={{ border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>+</button>
                  <button type="button" onClick={() => removeItem(item.producto.id_producto)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 text-red-400 ml-1">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: total + pago + cobrar */}
        <form onSubmit={handleSubmit} className="p-4 border-t space-y-3 shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
          {submitError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {submitError}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Total ({cart.reduce((s, i) => s + i.cantidad, 0)} items)
            </span>
            <span className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
              {formatCLP(totalSale)}
            </span>
          </div>

          {/* Método de pago */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            required
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pickled-bluewood-600 transition-colors font-medium"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: paymentMethod ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            <option value="">Seleccionar método de pago *</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Botón cobrar */}
          <button
            type="submit"
            disabled={cart.length === 0 || !paymentMethod || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-base tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: cart.length > 0 && paymentMethod ? "hsl(210, 28%, 37%)" : "var(--bg-muted)",
              color: cart.length > 0 && paymentMethod ? "white" : "var(--text-muted)",
              boxShadow: cart.length > 0 && paymentMethod ? "0 4px 14px rgba(45,62,80,0.3)" : "none",
            }}
          >
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Registrando...</>
            ) : (
              <><Receipt className="h-5 w-5" /> COBRAR</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sub-componentes compartidos ───────────────────────────────────────────────

function StatCard({ title, value, suffix, icon, isLoading, delay = 0 }: {
  title: string; value: string; suffix: string;
  icon: React.ReactNode; isLoading?: boolean; delay?: number;
}) {
  return (
    <div
      className="p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 duration-500 group"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)", animationDelay: `${delay}ms`, animationFillMode: "both" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)")}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{title}</span>
        <div className="text-pickled-bluewood-400 group-hover:scale-110 transition-transform duration-200">{icon}</div>
      </div>
      <div className={`text-2xl font-black leading-none mb-1 ${isLoading ? "animate-pulse rounded h-7 w-20" : ""}`}
        style={isLoading ? { background: "var(--bg-muted)" } : { color: "var(--text-primary)" }}>
        {!isLoading && value}
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{suffix}</p>
    </div>
  );
}

function CategoryBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full font-semibold transition-all duration-200 ${
        active ? "bg-pickled-bluewood-600 text-white shadow-sm" : "hover:bg-pickled-bluewood-500/10"
      }`}
      style={!active ? { background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" } : {}}
    >
      {label}
    </button>
  );
}