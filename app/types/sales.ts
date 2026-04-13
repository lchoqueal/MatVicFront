export interface Product {
    id_producto: number;
    nombre: string;
    precio_unit: number;
    categoria: string;
    descripcion?: string;
    stock?: number;
  }
  
  export interface SaleItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }
  
  export interface Sale {
    id: string | number;
    date: string;
    time: string;
    items: SaleItem[];
    total: number;
    paymentMethod: string;
    customerName?: string;
    location: string;
  }