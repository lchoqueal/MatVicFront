import { useState } from "react";
import { X, CreditCard, Smartphone, Building2, CheckCircle2 } from "lucide-react";
import { formatCLP } from "~/lib/utils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

type PaymentMethod = 'tarjeta' | 'mach' | 'transferencia';

export default function CheckoutModal({ isOpen, onClose, total }: CheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('tarjeta');

  if (!isOpen) return null;

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

          {/* Method Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => setMethod('tarjeta')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-bold transition-all ${method === 'tarjeta' ? 'bg-white text-[#2d3e50] shadow-sm' : 'text-slate-500 hover:text-[#2d3e50]'}`}
            >
              <CreditCard className="h-5 w-5" />
              Webpay
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

          {/* Forms */}
          {method === 'tarjeta' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Número de Tarjeta</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nombre del Titular</label>
                <input type="text" placeholder="JUAN PEREZ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Vencimiento</label>
                  <input type="text" placeholder="MM/AA" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">CVV</label>
                  <input type="password" placeholder="•••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm" />
                </div>
              </div>
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
              <div className="pt-2">
                <label className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1.5 block text-left">Tu número MACH para confirmar</label>
                <input type="text" placeholder="+56 9 XXXXXXXX" className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-sm" />
              </div>
            </div>
          )}

          {method === 'transferencia' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-emerald-900 mb-4 text-center">Datos de Transferencia</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                  <span className="text-emerald-700">Banco</span>
                  <span className="font-bold text-emerald-900">BancoEstado</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                  <span className="text-emerald-700">Tipo de Cuenta</span>
                  <span className="font-bold text-emerald-900">Cuenta Corriente</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                  <span className="text-emerald-700">N° de Cuenta</span>
                  <span className="font-bold text-emerald-900 font-mono">1234567890</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                  <span className="text-emerald-700">RUT</span>
                  <span className="font-bold text-emerald-900 font-mono">76.543.210-K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Correo</span>
                  <span className="font-bold text-emerald-900">pagos@matvic.cl</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-emerald-200/50">
                 <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 block">N° de Operación / Comprobante</label>
                 <input type="text" placeholder="Ej: 987654321" className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${
            method === 'mach' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 
            method === 'transferencia' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 
            'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
          }`}>
            <CheckCircle2 className="h-5 w-5" />
            Confirmar Pago - {formatCLP(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
