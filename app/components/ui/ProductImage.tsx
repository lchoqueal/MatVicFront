import { useState } from "react";
import { Package } from "lucide-react";
import type { Product } from "~/types/inventory";

interface ProductImageProps {
  producto: Product;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm:   "w-16 h-16",
  md:   "w-32 h-32",
  lg:   "w-48 h-48",
  xl:   "w-64 h-64",
  full: "w-full h-48",
};

export default function ProductImage({
  producto,
  size = "md",
  className = "",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cls = `${sizeClasses[size]} ${className}`;

  if (!producto?.imagen_url || hasError) {
    return (
      <div
        className={`${cls} bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg`}
      >
        <div className="text-center text-gray-500">
          <Package className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-1 text-[10px] font-medium">Sin imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cls} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600" />
        </div>
      )}
      <img
        src={producto.imagen_url}
        alt={producto.nombre}
        className={`${cls} object-cover rounded-lg border border-gray-200 ${
          isLoading ? "invisible" : "visible"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => { setHasError(true); setIsLoading(false); }}
      />
    </div>
  );
}
