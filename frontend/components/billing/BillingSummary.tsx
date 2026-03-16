import { User, Sparkles, AlertCircle } from "lucide-react";

interface BillingSummaryProps {
  customers: any[];
  selectedCustomer: any;
  setSelectedCustomer: (customer: any) => void;
  subTotal: number;
  totalTax: number;
  total: number;
  handleCompletePayment: () => void;
}

export default function BillingSummary({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  subTotal,
  totalTax,
  total,
  handleCompletePayment
}: BillingSummaryProps) {
  return (
    <div className="w-80 flex flex-col gap-6 shrink-0 relative">
      {/* Decorative side accent */}
      <div className="absolute -inset-4 bg-gradient-to-b from-teal-500/5 to-transparent rounded-[2.5rem] -z-10 blur-xl"></div>

      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 relative overflow-hidden flex-1 flex flex-col">
        {/* Customer Selection */}
        <div className="flex items-start gap-4 mb-8 group relative z-10">
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0 transform group-hover:scale-105 transition-transform duration-300">
              <User className="text-white drop-shadow-sm" size={24} />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Info</p>
              <div className="relative">
                <select 
                  className="w-full bg-transparent text-sm font-black text-slate-800 uppercase tracking-tight border-none focus:ring-0 p-0 hover:text-teal-600 transition-colors cursor-pointer appearance-none truncate pr-6"
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    setSelectedCustomer(customer || null);
                  }}
                  value={selectedCustomer?.id || ""}
                >
                  <option value="">Guest Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-teal-500 transition-colors">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {selectedCustomer?.phone || "No phone linked"}
              </p>
           </div>
        </div>
        
        {/* Bill Breakdown */}
        <div className="space-y-4 py-6 border-y border-slate-100/80 relative z-10 flex-1">
           <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 font-semibold">Net Sales</span>
              <span className="font-bold text-slate-700 font-mono">₹{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
           </div>
           <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-50">
                 GST applied <Sparkles size={12} className="text-rose-400" />
              </span>
              <span className="font-bold text-rose-500 font-mono">+₹{totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
           </div>
           
           <div className="h-6"></div>

           <div className="flex justify-between items-end relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-slate-200 before:to-transparent pt-6">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Payable Amount</span>
                <span className="text-4xl font-black text-slate-800 tracking-tighter truncate font-mono text-left">
                  <span className="text-xl text-slate-400 mr-1 font-normal">₹</span>{total.toLocaleString()}
                </span>
              </div>
           </div>
        </div>

        {/* Checkout Button */}
        <div className="pt-6 relative z-10">
          <button 
            onClick={handleCompletePayment}
            className="w-full relative group overflow-hidden bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl hover:shadow-teal-900/20 active:scale-[0.98]"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative z-10 flex items-center justify-center gap-2">
               Complete Order <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
             </div>
          </button>
        </div>
      </div>

      {/* Internal Note */}
      <div className="bg-amber-50/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-200/50 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <AlertCircle size={48} className="text-amber-600" />
         </div>
         <div className="flex items-center gap-2 mb-2 relative z-10">
           <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
           <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Internal Note</h4>
         </div>
         <p className="text-[10px] sm:text-xs text-amber-800/80 leading-relaxed font-medium relative z-10">
           Ensure staff attribution is correct for incentive calculation. GST will be auto-applied based on service type.
         </p>
      </div>
    </div>
  );
}
