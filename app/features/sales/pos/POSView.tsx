import { useState } from "react";
import { getProducts } from "~/core/api/products.api";
import { useEffect } from "react";
import type { Product } from "~/features/inventory/types";
import type { PaymentMethod } from "~/features/sales/types";
import { useCart } from "~/features/sales/hooks/useCart";
import { ProductGrid } from "~/features/sales/pos/ProductGrid";
import { CartTicket } from "~/features/sales/pos/CartTicket";

interface POSViewProps {
  storeName: string;
  storeId: number;
  empleadoId: number | null;
  empleadoNombre: string;
  onVentaCompletada: () => void;
}

export function POSView({ storeName, storeId, empleadoId, empleadoNombre, onVentaCompletada }: POSViewProps) {
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const cart = useCart(onVentaCompletada);

  useEffect(() => {
    setIsLoadingProductos(true);
    getProducts().then(setProductos).catch(() => setProductos([])).finally(() => setIsLoadingProductos(false));
  }, []);

  const categories = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  const filteredProductos = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.categoria === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoId) {
      return;
    }
    await cart.checkout(storeId, empleadoId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-220px)] min-h-[500px]">
      <ProductGrid
        products={filteredProductos}
        isLoading={isLoadingProductos}
        cart={cart.cart}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onAddItem={cart.addItem}
      />
      <CartTicket
        cart={cart.cart}
        paymentMethod={cart.paymentMethod}
        isSubmitting={cart.isSubmitting}
        submitError={cart.submitError}
        successMsg={cart.successMsg}
        totalSale={cart.totalSale}
        totalItems={cart.totalItems}
        storeName={storeName}
        empleadoNombre={empleadoNombre}
        onSetPayment={(m) => cart.setPaymentMethod(m as PaymentMethod | "")}
        onUpdateQty={cart.updateQty}
        onRemoveItem={cart.removeItem}
        onClearCart={cart.clearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
