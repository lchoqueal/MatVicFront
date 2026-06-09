// Los tipos activos de ventas viven en features/sales/types.ts
// SaleItem y Sale (modelo antiguo) nunca se implementaron — se eliminan.
// Solo se re-exporta PaymentMethod por si algún archivo lo importa de aquí.
export type { PaymentMethod } from "~/features/sales/types";