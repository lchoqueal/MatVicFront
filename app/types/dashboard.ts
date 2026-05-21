export interface DayStats {
  total_ventas: number;
  total_ingresos: number;
}

export interface MonthStats {
  total_ventas: number;
  total_ingresos: number;
}

export interface MonthlyHistoryItem {
  month: string;
  sales: number;
}

export interface StoreComparison {
  id_local: number;
  nombre_local: string;
  ventas_hoy: number;
  total_productos: number;
  stock_bajo: number;
  encargado: string;
}

export interface RecentSale {
  id: number;
  product: string;
  amount: number;
  time: string;
  location: string;
}

export interface LowStockAlert {
  id: number;
  product: string;
  stock: number;
  location: string;
}