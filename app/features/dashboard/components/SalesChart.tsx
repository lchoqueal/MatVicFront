import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface SalesChartProps {
  data: { month: string; sales: number }[];
  storeName: string;
  isLoading?: boolean;
}

export function SalesChart({ data, storeName, isLoading }: SalesChartProps) {
  const formatCLP = (v: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(v);

  return (
    <div
      className="lg:col-span-2 rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-main)",
        boxShadow: "var(--shadow-card)",
        animationDelay: "200ms",
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Evolución de Ventas
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Últimos 6 meses · {storeName}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="w-2 h-2 rounded-full bg-pickled-bluewood-500 inline-block" />
          Ventas ($)
        </div>
      </div>

      <div className="h-[210px]">
        {isLoading ? (
          <div className="h-full flex items-end gap-2">
            {[40, 65, 50, 80, 60, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg animate-pulse" style={{ height: `${h}%`, background: "var(--bg-muted)" }} />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="99%" height={210}>
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`} width={34} />
              <Tooltip
                cursor={{ fill: "var(--bg-muted)", radius: 8 }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border-main)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  boxShadow: "var(--shadow-lg)",
                  fontSize: "13px",
                }}
                formatter={(value) => [formatCLP(Number(value)), "Ventas"]}
              />
              <Bar dataKey="sales" fill="hsl(210, 28%, 37%)" radius={[8, 8, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
