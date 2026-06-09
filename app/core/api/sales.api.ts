import { api } from "~/core/api/client";
import type { PaymentMethod } from "~/features/sales/types";

interface CarritoResponse {
  id_carrito?: number;
  idCarrito?: number;
}

interface BoletaResponse {
  id_boleta?: number;
  idBoleta?: number;
  total?: number;
}

interface CreateCartPayload {
  tipoCarrito: string;
  idEmpleado: number;
}

interface AddItemPayload {
  idProducto: number;
  cantidad: number;
}

interface CreateBoletaPayload {
  idCarrito: number;
  tipoVenta: "fisica" | "online";
  metodoPago: PaymentMethod;
  idEmpleado: number;
  idLocal: number;
}

/** Crea un nuevo carrito de venta */
export async function createCart(payload: CreateCartPayload): Promise<number> {
  const data = await api.post<CarritoResponse>("/carrito", payload);
  const id = data.id_carrito ?? data.idCarrito;
  if (!id) throw new Error("No se pudo crear el carrito");
  return id;
}

/** Agrega un ítem a un carrito existente */
export async function addCartItem(
  idCarrito: number,
  payload: AddItemPayload
): Promise<void> {
  await api.post(`/carrito/${idCarrito}/items`, payload);
}

/** Emite una boleta a partir de un carrito */
export async function createBoleta(
  payload: CreateBoletaPayload
): Promise<BoletaResponse> {
  return api.post<BoletaResponse>("/boleta", payload);
}
