import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";

export interface Store {
  id: number;
  name: string;
  manager: string;
}

const stores: Store[] = [
  { id: 22, name: "Local N° 22", manager: "Ana García" },
  { id: 106, name: "Local N° 106", manager: "Carlos López" },
];

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
        className="flex items-center gap-3 px-4 py-3 bg-white border border-pickled-bluewood-200 rounded-lg hover:bg-pickled-bluewood-50 transition-colors shadow-sm"
      >
        <MapPin className="h-5 w-5 text-pickled-bluewood-600" />
        <div className="text-left">
          <p className="text-sm font-medium text-pickled-bluewood-800">{selectedStore.name}</p>
          <p className="text-xs text-pickled-bluewood-500">Local activo</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-pickled-bluewood-600 transition-transform ${showStoreMenu ? "rotate-180" : ""}`}
        />
      </button>

      {showStoreMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowStoreMenu(false)} />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-pickled-bluewood-200 overflow-hidden z-20">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleStoreChange(store)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-pickled-bluewood-50 transition-colors ${
                  selectedStore.id === store.id ? "bg-pickled-bluewood-100" : ""
                }`}
              >
                <MapPin className="h-4 w-4 text-pickled-bluewood-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-pickled-bluewood-800">{store.name}</p>
                  <p className="text-xs text-pickled-bluewood-500">Encargado: {store.manager}</p>
                </div>
                {selectedStore.id === store.id && <span className="w-2 h-2 bg-pickled-bluewood-600 rounded-full" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}