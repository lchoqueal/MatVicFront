import { useState } from 'react';
import { MapPin, ChevronDown } from "lucide-react";

// Definimos la estructura de un Local para que TypeScript nos ayude
export interface Store {
  id: number;
  name: string;
  manager: string;
}

// Datos de los locales establecidos
const stores: Store[] = [
  { id: 22, name: "Local N° 22", manager: "Ana García" },
  { id: 106, name: "Local N° 106", manager: "Carlos López" }
];

// Definimos los tipos de las Props
interface StoreSelectorProps {
  selectedStore: Store;
  onStoreChange: (store: Store) => void;
}

export default function StoreSelector({ selectedStore, onStoreChange }: StoreSelectorProps) {
  const [showStoreMenu, setShowStoreMenu] = useState(false);

  const handleStoreChange = (store: Store) => {
    onStoreChange(store);
    setShowStoreMenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowStoreMenu(!showStoreMenu)}
        className="flex items-center gap-3 px-4 py-2 bg-[#2d3e50] border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-white"
      >
        <MapPin className="h-5 w-5 text-blue-400" />
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Local Activo</p>
          <p className="text-sm font-medium">{selectedStore.name}</p>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            showStoreMenu ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {showStoreMenu && (
        <>
          {/* Backdrop para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowStoreMenu(false)}
          />
          
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Seleccionar Ubicación</p>
            </div>
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleStoreChange(store)}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors ${
                  selectedStore.id === store.id 
                    ? 'bg-blue-50 border-l-4 border-blue-600' 
                    : 'hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <MapPin className={`h-5 w-5 ${
                  selectedStore.id === store.id ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-bold ${
                    selectedStore.id === store.id ? 'text-blue-700' : 'text-slate-700'
                  }`}>
                    {store.name}
                  </p>
                  <p className="text-[11px] text-slate-500">Encargado: {store.manager}</p>
                </div>
                {selectedStore.id === store.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}