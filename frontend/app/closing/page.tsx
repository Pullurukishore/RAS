"use client";

import { 
  History, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Wallet, 
  CreditCard, 
  Landmark, 
  Banknote, 
  ShieldAlert, 
  Check, 
  Calendar,
  ArrowLeft,
  Lock,
  TrendingUp,
  DollarSign,
  Loader2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning";
}

interface ClosingData {
  expectedCash: number;
  totalUPI: number;
  totalCard: number;
  isClosed: boolean;
  closingData?: {
    actualCash: number;
    difference: number;
  };
}

export default function ClosingPage() {
  const [closingData, setClosingData] = useState<ClosingData | null>(null);
  const [actualCash, setActualCash] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const showToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiUrl}/closing/status?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setClosingData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch closing data:", err);
        showToast("Failed to load closing data", "error");
        setIsLoading(false);
      });
  }, [apiUrl, selectedDate, showToast]);

  const handlePerformDayEnd = async () => {
    if (!actualCash && actualCash !== "0") {
      showToast("Please enter the actual physical cash amount", "warning");
      return;
    }

    const cashValue = parseFloat(actualCash);
    const expected = closingData?.expectedCash || 0;
    const difference = cashValue - expected;

    if (Math.abs(difference) > 500) {
      const confirmMsg = `WARNING: Large discrepancy of ₹${Math.abs(difference).toFixed(2)}. Proceed anyway?`;
      if (!window.confirm(confirmMsg)) return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/closing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          expectedCash: expected,
          actualCash: cashValue,
          difference: difference,
          totalUPI: closingData?.totalUPI || 0,
          totalCard: closingData?.totalCard || 0,
          notes: difference !== 0 ? `Discrepancy: ₹${difference.toFixed(2)}` : "Balanced"
        })
      });

      if (res.ok) {
        setClosingData({ ...closingData!, isClosed: true });
        showToast("Day closed successfully", "success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showToast("Failed to close day", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error during close", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const expectedCash = closingData?.expectedCash || 0;
  const totalUPI = closingData?.totalUPI || 0;
  const totalCard = closingData?.totalCard || 0;
  const enteredCash = parseFloat(actualCash) || 0;
  const difference = actualCash ? enteredCash - expectedCash : 0;
  const hasVariance = actualCash && difference !== 0;
  const totalCollections = expectedCash + totalUPI + totalCard;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading closing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[280px] ${
                toast.type === "success" ? "bg-emerald-500 text-white" : 
                toast.type === "warning" ? "bg-amber-500 text-white" : 
                "bg-rose-500 text-white"
              }`}
            >
              {toast.type === "success" ? <Check size={18} /> : 
               toast.type === "warning" ? <AlertCircle size={18} /> : 
               <AlertCircle size={18} />}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-6 py-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Day Closing</h1>
            <p className="text-sm text-slate-500">Verify collections and close the register</p>
          </div>
          
          {/* Date Picker */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
              <Calendar size={18} />
            </div>
            <input 
              type="date" 
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-sm text-slate-700 cursor-pointer px-2"
            />
          </div>
        </div>

        {closingData?.isClosed ? (
          /* Closed State */
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Day Closed</h2>
              <p className="text-slate-500 mb-8">
                {new Date(selectedDate).toLocaleDateString()} has been successfully closed and logged.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cash</p>
                  <p className="text-xl font-bold text-slate-800">₹{(closingData.closingData?.actualCash || expectedCash).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">UPI</p>
                  <p className="text-xl font-bold text-slate-800">₹{totalUPI.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Card</p>
                  <p className="text-xl font-bold text-slate-800">₹{totalCard.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <button 
                onClick={() => router.push('/')} 
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Open State - Verification */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Summary Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Total Collections Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-indigo-100 font-medium">Total Collections</span>
                </div>
                <p className="text-4xl font-bold">₹{totalCollections.toLocaleString('en-IN')}</p>
                <p className="text-indigo-200 text-sm mt-1">For {new Date(selectedDate).toLocaleDateString()}</p>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Banknote size={20} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Cash</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">₹{expectedCash.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-400 mt-1">Expected from system</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Landmark size={20} className="text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">UPI</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">₹{totalUPI.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-400 mt-1">Auto-synced</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard size={20} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Card</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">₹{totalCard.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-400 mt-1">Auto-synced</p>
                </div>
              </div>

              {/* Verification Notice */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Ready to Close</h3>
                    <p className="text-slate-500 mt-1 text-sm leading-relaxed">
                      UPI and Card payments are automatically synced. Please verify the physical cash in your drawer matches the expected amount.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Verification Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Wallet size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Cash Verification</h3>
                  {isToday && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Mode
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Expected Cash */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-sm font-medium text-slate-500 block">System Expected</span>
                    <span className="text-xs text-slate-400">From invoices</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">₹{expectedCash.toLocaleString('en-IN')}</span>
                </div>

                {/* Actual Cash Input */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Actual Cash in Drawer</label>
                  <div className={`flex items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    actualCash 
                      ? difference === 0 
                        ? 'border-emerald-500 bg-emerald-50/30' 
                        : 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white'
                  }`}>
                    <span className="text-xl font-bold text-slate-400">₹</span>
                    <input 
                      type="number" 
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className="flex-1 bg-transparent text-right font-bold text-2xl text-slate-800 placeholder-slate-300 outline-none" 
                    />
                  </div>
                </div>

                {/* Variance Alert */}
                <AnimatePresence>
                  {actualCash && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl border ${
                        difference === 0 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : difference < 0 
                            ? 'bg-rose-50 border-rose-200' 
                            : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {difference === 0 ? (
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                        ) : (
                          <ShieldAlert size={20} className={`shrink-0 ${difference < 0 ? 'text-rose-600' : 'text-amber-600'}`} />
                        )}
                        <div>
                          {difference === 0 ? (
                            <p className="text-sm font-semibold text-emerald-800">Perfect match!</p>
                          ) : (
                            <p className="text-sm font-semibold text-slate-800">
                              {difference < 0 ? 'Short' : 'Over'} by ₹{Math.abs(difference).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button 
                  onClick={handlePerformDayEnd}
                  disabled={isSubmitting || !actualCash}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    !actualCash 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      {hasVariance ? 'Log Variance & Close' : 'Close Day'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
