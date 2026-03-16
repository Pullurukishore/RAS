"use client";

import { CreditCard, Wallet, IndianRupee } from "lucide-react";

interface PaymentMethodsProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const GPayLogo = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const PhonePeLogo = () => (
  <div className="w-6 h-6 bg-[#5f259f] rounded-lg flex items-center justify-center">
    <span className="text-white text-[12px] font-black italic">Pe</span>
  </div>
);

const PaytmLogo = () => (
  <div className="flex flex-col items-center">
    <span className="text-[#00baf2] text-[10px] font-black leading-none">pay</span>
    <span className="text-[#002970] text-[10px] font-black leading-none italic">tm</span>
  </div>
);

export default function PaymentMethods({ paymentMethod, setPaymentMethod }: PaymentMethodsProps) {
  const methods = [
    { id: 'Cash', icon: <IndianRupee size={22} />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'Card', icon: <CreditCard size={22} />, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { id: 'GPay', icon: <GPayLogo />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'Paytm', icon: <PaytmLogo />, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
    { id: 'PhonePe', icon: <PhonePeLogo />, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'Wallet', icon: <Wallet size={22} />, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden transition-all duration-300">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-4 bg-teal-500 rounded-full"></div>
        <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">Payment Methods</h3>
      </div>
      
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-3 relative z-10">
        {methods.map(({ id, icon, color, bg, border }) => {
          const isSelected = paymentMethod === id;
          return (
            <button 
              key={id}
              onClick={() => setPaymentMethod(id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 group relative overflow-hidden ${
                isSelected 
                  ? `border-teal-500 bg-teal-50 shadow-md transform -translate-y-0.5` 
                  : `border-slate-100/80 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm`
              }`}
            >
              <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
              </div>
              <span className={`relative z-10 text-[10px] font-black uppercase tracking-tight transition-colors ${
                isSelected ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'
              }`}>
                {id}
              </span>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
