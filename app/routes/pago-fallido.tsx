import { useSearchParams, Link } from "react-router";
import { XCircle, RefreshCw, ShoppingCart } from "lucide-react";

export default function PagoFallido() {
  const [searchParams] = useSearchParams();
  const boletaId = searchParams.get("boleta");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="inline-flex p-4 rounded-full bg-red-50 text-red-600">
          <XCircle className="h-16 w-16" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#2d3e50] tracking-tight">El Pago Falló</h1>
          <p className="text-slate-500 font-medium">
            La transacción no pudo ser procesada. Esto puede deberse a fondos insuficientes o datos de tarjeta incorrectos.
          </p>
        </div>

        {boletaId && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Orden Asociada</span>
            <span className="text-lg font-black text-[#2d3e50] font-mono">#{boletaId}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Link 
            to="/" 
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <ShoppingCart className="h-5 w-5" />
            Volver a la tienda a reintentar
          </Link>
          
          <p className="text-xs text-slate-400 font-medium">
            Si crees que se trata de un error de nuestro sistema, por favor ponte en contacto con soporte@matvic.cl.
          </p>
        </div>
      </div>
    </div>
  );
}
