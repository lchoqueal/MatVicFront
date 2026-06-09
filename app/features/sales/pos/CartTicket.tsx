import { ShoppingCart, X, Receipt, Loader2 } from "lucide-react";
import type { CartItem, PaymentMethod } from "~/features/sales/types";
import { PAYMENT_METHODS } from "~/features/sales/types";
import { formatCLP } from "~/lib/utils";

interface CartTicketProps {
  cart: CartItem[];
  paymentMethod: PaymentMethod | "";
  isSubmitting: boolean;
  submitError: string | null;
  successMsg: string | null;
  totalSale: number;
  totalItems: number;
  storeName: string;
  empleadoNombre: string;
  onSetPayment: (m: PaymentMethod | "") => void;
  onUpdateQty: (id: number, qty: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckout: (e: React.FormEvent) => void;
}

export function CartTicket({
  cart, paymentMethod, isSubmitting, submitError, successMsg,
  totalSale, totalItems, storeName, empleadoNombre,
  onSetPayment, onUpdateQty, onRemoveItem, onClearCart, onCheckout,
}: CartTicketProps) {
  return (
    <div className="flex flex-col w-full lg:w-80 xl:w-96 rounded-2xl overflow-hidden shrink-0"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Ticket</h3>
          {cart.length > 0 && (
            <button type="button" onClick={onClearCart}
              className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-red-500/10 text-red-400 font-medium">
              Vaciar
            </button>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          📍 {storeName} · 👤 {empleadoNombre.split(" ")[0]}
        </p>
      </div>

      {/* Éxito */}
      {successMsg && (
        <div className="mx-4 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl font-medium animate-in fade-in duration-300">
          {successMsg}
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <ShoppingCart className="h-10 w-10 mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Toca un producto para agregarlo</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.producto.id_producto}
              className="flex items-center gap-2 p-2.5 rounded-xl animate-in fade-in slide-in-from-right-2 duration-200"
              style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{item.producto.nombre}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {formatCLP(Number(item.producto.precio_unit))} c/u ·{" "}
                  <span className="font-bold" style={{ color: "var(--text-secondary)" }}>
                    {formatCLP(Number(item.producto.precio_unit) * item.cantidad)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => onUpdateQty(item.producto.id_producto, item.cantidad - 1)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors hover:bg-pickled-bluewood-500/10"
                  style={{ border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>−</button>
                <span className="w-7 text-center text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item.cantidad}</span>
                <button type="button" onClick={() => onUpdateQty(item.producto.id_producto, item.cantidad + 1)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors hover:bg-pickled-bluewood-500/10"
                  style={{ border: "1px solid var(--border-main)", color: "var(--text-secondary)" }}>+</button>
                <button type="button" onClick={() => onRemoveItem(item.producto.id_producto)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 text-red-400 ml-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <form onSubmit={onCheckout} className="p-4 border-t space-y-3 shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        {submitError && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{submitError}</div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            Total ({totalItems} items)
          </span>
          <span className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{formatCLP(totalSale)}</span>
        </div>
        <select value={paymentMethod} onChange={(e) => onSetPayment(e.target.value as PaymentMethod)} required
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pickled-bluewood-600 transition-colors font-medium"
          style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: paymentMethod ? "var(--text-primary)" : "var(--text-muted)" }}>
          <option value="">Seleccionar método de pago *</option>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button type="submit" disabled={cart.length === 0 || !paymentMethod || isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-base tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: cart.length > 0 && paymentMethod ? "hsl(210, 28%, 37%)" : "var(--bg-muted)",
            color: cart.length > 0 && paymentMethod ? "white" : "var(--text-muted)",
            boxShadow: cart.length > 0 && paymentMethod ? "0 4px 14px rgba(45,62,80,0.3)" : "none",
          }}>
          {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Registrando...</> : <><Receipt className="h-5 w-5" /> COBRAR</>}
        </button>
      </form>
    </div>
  );
}
