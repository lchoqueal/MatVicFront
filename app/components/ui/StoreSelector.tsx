import { useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";

export interface Store {
  id: number;
  name: string;
  manager: string;
}

const stores: Store[] = [
  { id: 22,  name: "Local N° 22",  manager: "Ana García"   },
  { id: 106, name: "Local N° 106", manager: "Carlos López" },
];

interface StoreSelectorProps {
  selectedStore: Store;
  onStoreChange: (store: Store) => void;
}

export default function StoreSelector({ selectedStore, onStoreChange }: StoreSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-main)",
          color: "var(--text-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--bg-muted)" }}
        >
          <MapPin className="h-3.5 w-3.5 text-pickled-bluewood-400" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold leading-none" style={{ color: "var(--text-primary)" }}>
            {selectedStore.name}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            Local activo
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-secondary)" }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full right-0 mt-2 w-60 rounded-xl overflow-hidden z-20"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-main)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Cambiar Local
              </p>
            </div>
            {stores.map((store) => {
              const isSelected = selectedStore.id === store.id;
              return (
                <button
                  key={store.id}
                  onClick={() => { onStoreChange(store); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
                  style={{
                    background: isSelected ? "var(--bg-surface-2)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isSelected ? "hsl(210,28%,37%)" : "var(--bg-muted)" }}
                  >
                    <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-pickled-bluewood-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{store.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      Encargado: {store.manager}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-pickled-bluewood-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}