// MetricCard — tarjeta de métrica estilo AetherDash para el Dashboard

interface MetricCardProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  badge: string | null;
  badgeColor: string;
  isLoading?: boolean;
  delay?: number;
}

export function MetricCard({
  title, value, sub, icon, iconBg, iconText,
  badge, badgeColor, isLoading, delay = 0,
}: MetricCardProps) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 group"
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
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBg} ${iconText}`}>
          {icon}
        </div>
        {badge && <span className={`text-[11px] font-bold ${badgeColor}`}>{badge}</span>}
      </div>
      <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <div
        className={`text-2xl font-black leading-none mb-1 ${isLoading ? "animate-pulse rounded h-7 w-20" : ""}`}
        style={isLoading ? { background: "var(--bg-muted)" } : { color: "var(--text-primary)" }}
      >
        {!isLoading && value}
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}
