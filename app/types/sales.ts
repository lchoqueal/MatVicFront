export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  time: string;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  customerName?: string;
  location: string;
}

export type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia" | "Yape" | "Plin";