// Tipos propios del módulo Ventas / POS

export type PaymentMethod =
  | "Efectivo"
  | "Débito"
  | "Crédito"
  | "Transferencia"
  | "Giro BancoEstado";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Efectivo",
  "Débito",
  "Crédito",
  "Transferencia",
  "Giro BancoEstado",
];

export interface Boleta {
  id_boleta: number;
  total: number | string;
  fecha_emision: string;
  metodo_pago: string;
  estado_boleta: string;
  id_empleado_boleta?: number;
  id_local?: number;
}

export interface CartItem {
  producto: {
    id_producto: number;
    nombre: string;
    precio_unit: number;
    stock: number;
    imagen_url?: string;
  };
  cantidad: number;
}

export type ViewMode = "tabla" | "pos";
