import { ShoppingCart, Calendar, TrendingUp } from "lucide-react";
import { StatCard } from "~/components/ui/StatCard";
import { formatCLP } from "~/lib/utils";

interface SalesStatsProps {
  count: number;
  totalHoy: number;
  ticketPromedio: number;
  storeName: string;
  isLoading: boolean;
}

export function SalesStats({ count, totalHoy, ticketPromedio, storeName, isLoading }: SalesStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard title="Ventas de Hoy" value={isLoading ? "—" : String(count)}
        suffix={`transacciones — ${storeName}`} icon={<ShoppingCart className="h-4 w-4" />}
        isLoading={isLoading} delay={0} />
      <StatCard title="Ingresos de Hoy" value={isLoading ? "—" : formatCLP(totalHoy)}
        suffix={`total facturado — ${storeName}`} icon={<Calendar className="h-4 w-4" />}
        isLoading={isLoading} delay={75} />
      <StatCard title="Ticket Promedio" value={isLoading ? "—" : formatCLP(ticketPromedio)}
        suffix="por venta" icon={<TrendingUp className="h-4 w-4" />}
        isLoading={isLoading} delay={150} />
    </div>
  );
}
