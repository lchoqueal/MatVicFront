/**
 * StatCard — Tarjeta de métrica reutilizable.
 * Usada en Dashboard y en la vista tabla de Ventas.
 */
interface StatCardProps {
  title: string;
  value: string;
  suffix: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  delay?: number;
}

export function StatCard({ title, value, suffix, icon, isLoading, delay = 0 }: StatCardProps) {
  return (
    <div
      className="p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 duration-500 group"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-main)",
        boxShadow: "var(--shadow-card)",
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)")}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          {title}
        </span>
        <div className="text-pickled-bluewood-400 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      </div>
      <div
        className={`text-2xl font-black leading-none mb-1 ${isLoading ? "animate-pulse rounded h-7 w-20" : ""}`}
        style={isLoading ? { background: "var(--bg-muted)" } : { color: "var(--text-primary)" }}
      >
        {!isLoading && value}
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{suffix}</p>
    </div>
  );
}
