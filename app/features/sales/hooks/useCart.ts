import { useState, useCallback } from "react";
import { createCart, addCartItem, createBoleta } from "~/core/api/sales.api";
import type { CartItem, PaymentMethod } from "~/features/sales/types";
import type { Product } from "~/features/inventory/types";

export interface CartState {
  cart: CartItem[];
  paymentMethod: PaymentMethod | "";
  isSubmitting: boolean;
  submitError: string | null;
  successMsg: string | null;
  setPaymentMethod: (m: PaymentMethod | "") => void;
  addItem: (producto: Product) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  checkout: (storeId: number, empleadoId: number | null) => Promise<void>;
  totalSale: number;
  totalItems: number;
}

export function useCart(onSuccess?: () => void): CartState {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const addItem = useCallback((producto: Product) => {
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
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.producto.id_producto !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((i) => i.producto.id_producto === id ? { ...i, cantidad: qty } : i)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPaymentMethod("");
    setSubmitError(null);
  }, []);

  const totalSale = cart.reduce(
    (sum, item) => sum + Number(item.producto.precio_unit) * item.cantidad,
    0
  );

  const totalItems = cart.reduce((s, i) => s + i.cantidad, 0);

  const checkout = useCallback(
    async (storeId: number, empleadoId: number | null) => {
      if (cart.length === 0 || !paymentMethod) {
        setSubmitError("Agrega al menos un producto y selecciona el método de pago.");
        return;
      }
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const idCarrito = await createCart({
          tipoCarrito: "venta_fisica",
          ...(empleadoId ? { idEmpleado: empleadoId } : {}),
        });

        for (const item of cart) {
          await addCartItem(idCarrito, {
            idProducto: item.producto.id_producto,
            cantidad: item.cantidad,
          });
        }

        await createBoleta({
          idCarrito,
          tipoVenta: "fisica",
          metodoPago: paymentMethod.toLowerCase() as PaymentMethod,
          ...(empleadoId ? { idEmpleado: empleadoId } : {}),
          idLocal: null, // Evitar FK constraint ya que no hay locales creados en la DB real aún
        });

        const formatted = new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          minimumFractionDigits: 0,
        }).format(totalSale);

        setSuccessMsg(`✓ Venta registrada — ${formatted} — ${paymentMethod}`);
        clearCart();
        onSuccess?.();
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Error al registrar la venta."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [cart, paymentMethod, totalSale, clearCart, onSuccess]
  );

  return {
    cart,
    paymentMethod,
    isSubmitting,
    submitError,
    successMsg,
    setPaymentMethod,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    checkout,
    totalSale,
    totalItems,
  };
}
