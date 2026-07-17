/** Formatea un número como pesos chilenos (CLP) */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Devuelve label y clases Tailwind según el nivel de stock */
export function getStockStatus(
  stock: number,
  minStock: number
): { label: string; color: string } {
  if (stock <= minStock)
    return { label: "Stock Bajo", color: "bg-red-100 text-red-700" };
  if (stock <= minStock * 2)
    return { label: "Stock Medio", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Stock OK", color: "bg-green-100 text-green-700" };
}

/** Formatea una fecha en formato local (es-CL) */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(d);
}
