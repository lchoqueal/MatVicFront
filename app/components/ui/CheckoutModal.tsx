import { useState } from "react";
import { X, CreditCard, Smartphone, Building2, Loader2, AlertCircle } from "lucide-react";
import { formatCLP } from "~/lib/utils";
import { useCart } from "~/context/CartContext";
import { useAuth } from "~/core/auth";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

type PaymentMethod = 'tarjeta' | 'mach' | 'transferencia';

export default function CheckoutModal({ isOpen, onClose, total }: CheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('tarjeta');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleConfirmarPago = async () => {
    if (isProcessing) return;
    setError(null);
    setIsProcessing(true);

    try {
      const BASE_URL = import.meta.env.VITE_API_URL as string;
      const tokenAuth = localStorage.getItem("token");

      if (cartItems.length === 0) {
        setError("Tu carrito está vacío.");
        setIsProcessing(false);
        return;
      }

      if (!tokenAuth) {
        setError("Debes iniciar sesión para realizar una compra.");
        setIsProcessing(false);
        return;
      }

      if (user?.rol === 'administrador' || user?.rol === 'empleado') {
        setError("Estás usando una cuenta de administrador/empleado. Para probar la tienda virtual, regístrate con una cuenta de cliente normal.");
        setIsProcessing(false);
        return;
      }

      // Paso 1: Crear un registro de carrito en la base de datos
      const resCrearCarrito = await fetch(`${BASE_URL}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAuth}`,
        },
        body: JSON.stringify({
          tipoCarrito: "cliente",
          idCliente: user?.id,
        }),
      });

      const isJsonCarrito = resCrearCarrito.headers.get("content-type")?.includes("application/json");
      const dataCarrito = isJsonCarrito ? await resCrearCarrito.json() : null;
      if (!resCrearCarrito.ok || !dataCarrito?.success) {
        throw new Error(dataCarrito?.mensaje || "Error al inicializar el carrito en el servidor (Posible caída del backend).");
      }

      const idCarritoReal = dataCarrito.data.idCarrito;

      // Paso 2: Registrar cada producto del carrito en la base de datos
      for (const item of cartItems) {
        const resAgregarItem = await fetch(`${BASE_URL}/carrito/${idCarritoReal}/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenAuth}`,
          },
          body: JSON.stringify({
            idProducto: item.id,
            cantidad: item.quantity,
          }),
        });

        const isJsonItem = resAgregarItem.headers.get("content-type")?.includes("application/json");
        const dataItem = isJsonItem ? await resAgregarItem.json() : null;
        if (!resAgregarItem.ok || !dataItem?.success) {
          throw new Error(dataItem?.mensaje || `Error al guardar el producto "${item.name}" en el carrito (Posible caída del backend).`);
        }
      }

      // Paso 3: Crear la boleta en el backend usando el idCarritoReal
      const boletaResponse = await fetch(`${BASE_URL}/boleta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAuth}`,
        },
        body: JSON.stringify({
          idCarrito: idCarritoReal,
          tipoVenta: "online",
          metodoPago: method,
          idCliente: user?.id ?? null,
        }),
      });

      const isJsonBoleta = boletaResponse.headers.get("content-type")?.includes("application/json");
      const boletaData = isJsonBoleta ? await boletaResponse.json() : null;

      if (!boletaResponse.ok || !boletaData?.success) {
        throw new Error(boletaData?.mensaje ?? "Error al crear la boleta (Posible caída del backend).");
      }

      const idBoleta = boletaData.data?.idBoleta;

      // Paso 4: Llamar al endpoint de iniciación de pago con pasarela
      const pagoResponse = await fetch(`${BASE_URL}/boleta/${idBoleta}/iniciar-pago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAuth}`,
        },
      });

      const isJsonPago = pagoResponse.headers.get("content-type")?.includes("application/json");
      const pagoData = isJsonPago ? await pagoResponse.json() : null;

      if (!pagoResponse.ok || !pagoData?.success) {
        throw new Error(pagoData?.mensaje ?? "Error al conectar con la pasarela de pago (El servicio podría estar caído).");
      }

      const { redirectUrl } = pagoData.data;

      if (!redirectUrl) {
        throw new Error("La pasarela no devolvió una URL de pago.");
      }

      // Paso 5: Limpiar carrito local y abrir pasarela en pestaña nueva
      clearCart();
      onClose();
      window.open(redirectUrl, "_blank");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-extrabold text-xl text-[#2d3e50]">Realizar Pago</h2>
            <p className="text-sm text-slate-500">Elige tu método de pago</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-[#2d3e50] rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Total Display */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center mb-6">
            <span className="font-medium text-blue-800">Total a pagar</span>
            <span className="text-2xl font-black text-blue-600">{formatCLP(total)}</span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 mb-4 text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Method Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => setMethod('tarjeta')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-bold transition-all ${method === 'tarjeta' ? 'bg-white text-[#2d3e50] shadow-sm' : 'text-slate-500 hover:text-[#2d3e50]'}`}
            >
              <CreditCard className="h-5 w-5" />
              Tarjeta
            </button>
            <button
              onClick={() => setMethod('mach')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-bold transition-all ${method === 'mach' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-[#2d3e50]'}`}
            >
              <Smartphone className="h-5 w-5" />
              MACH
            </button>
            <button
              onClick={() => setMethod('transferencia')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-bold transition-all ${method === 'transferencia' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-[#2d3e50]'}`}
            >
              <Building2 className="h-5 w-5" />
              Transf.
            </button>
          </div>

          {/* Método tarjeta: info redirección a pasarela */}
          {method === 'tarjeta' && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 space-y-1 animate-in fade-in slide-in-from-bottom-2">
              <p className="font-bold">🔒 Pago seguro con MatiPay Gateway</p>
              <p className="text-blue-700/80">Serás redirigido a nuestra pasarela de pago segura donde ingresarás los datos de tu tarjeta.</p>
            </div>
          )}

          {method === 'mach' && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-2 space-y-4">
              <div className="bg-white p-3 rounded-2xl w-16 h-16 mx-auto shadow-sm flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 mb-1">Paga rápido con MACH</h3>
                <p className="text-sm text-purple-700/80 mb-4">Envía <strong className="text-purple-900">{formatCLP(total)}</strong> al siguiente número:</p>
                <div className="text-2xl font-black text-purple-600 tracking-wider bg-white py-3 rounded-xl shadow-sm border border-purple-100 mb-2">
                  +56 9 8765 4321
                </div>
                <p className="text-xs text-purple-600 font-medium">Titular: MatVic Store SPA</p>
              </div>
            </div>
          )}

          {method === 'transferencia' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-emerald-900 mb-4 text-center">Datos de Transferencia</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Banco', 'BancoEstado'],
                  ['Tipo de Cuenta', 'Cuenta Corriente'],
                  ['N° de Cuenta', '1234567890'],
                  ['RUT', '76.543.210-K'],
                  ['Correo', 'pagos@matvic.cl'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-emerald-200/50 pb-2 last:border-0">
                    <span className="text-emerald-700">{label}</span>
                    <span className="font-bold text-emerald-900 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            onClick={handleConfirmarPago}
            disabled={isProcessing}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
              isProcessing ? 'opacity-70 cursor-not-allowed' :
              method === 'mach' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 hover:scale-[1.02]' :
              method === 'transferencia' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-[1.02]' :
              'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:scale-[1.02]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Iniciando pago...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Confirmar Pago — {formatCLP(total)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
