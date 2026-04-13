export interface MonthlyHistory {
    month: string;
    sales: number;
  }
  
  export interface StockAlert {
    id: number;
    product: string;
    stock: number;
    location: string;
  }
  
  export interface RecentSale {
    id: number;
    product: string;
    amount: number;
    time: string;
    location: string;
  }