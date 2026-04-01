"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ReceiptText,
  User,
  CreditCard,
  Calendar,
  Sparkles,
  Phone,
  Pencil,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function InvoiceViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${apiUrl}/billing/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        }
      } catch (err) {
        console.error("Failed to fetch invoice:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id, apiUrl]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-slate-200/50 rounded-full" />
          <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-teal-500">
            <ReceiptText size={28} />
          </div>
        </div>
        <p className="text-slate-400 font-medium tracking-wide mt-6 animate-pulse">Loading experience...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="w-28 h-28 bg-white text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-rose-500/10 border border-rose-50"
        >
          <ReceiptText size={48} strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Experience Not Found</h2>
        <p className="text-slate-500 max-w-md mb-8 text-lg font-light leading-relaxed">
          The requested record could not be found. It may have been deleted, or the ID is incorrect.
        </p>
        <button
          onClick={() => router.push("/billing")}
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:shadow-2xl hover:shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95"
        >
          <ArrowLeft size={18} /> Return to Records
        </button>
      </div>
    );
  }

  const invoiceDate = new Date(invoice.createdAt);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-teal-100 selection:text-teal-900 relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-slate-900 via-slate-800 to-[#F8FAFC] z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[500px] bg-teal-500/20 blur-[120px] rounded-full point-events-none z-0 mix-blend-overlay" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[400px] bg-emerald-500/20 blur-[100px] rounded-full point-events-none z-0 mix-blend-overlay" />

      {/* ── Top Navigation ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <button
            onClick={() => router.push("/billing")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium group px-2 py-1"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1.5 transition-transform" />
            <span className="text-sm tracking-wide">Back to Records</span>
          </button>

          <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => router.push(`/billing/${id}/edit`)}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all shadow-lg active:scale-95 flex-1 sm:flex-none justify-center"
            >
              <Pencil size={16} /> Edit Record
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Header Card */}
            <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-teal-400 to-emerald-400" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-6">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-bold tracking-widest uppercase">Completed</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
                    Experience Summary
                  </h1>
                  <p className="text-slate-500 flex items-center gap-2 font-medium">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      #{typeof id === 'string' ? id.substring(0, 8).toUpperCase() : id}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 text-right">
                  <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-500">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Date</p>
                      <p className="font-semibold text-slate-800 text-sm">
                        {invoiceDate.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-500">
                      <Clock size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Time</p>
                      <p className="font-semibold text-slate-800 text-sm">
                        {invoiceDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-teal-500" /> Purchased Services & Items
              </h2>
              
              <div className="flex flex-col gap-4">
                {invoice.items.map((item: any, idx: number) => {
                  const name = item.service?.description || item.product?.description || item.package?.description || "Item";
                  const isService = !!item.service;
                  const isProduct = !!item.product;
                  
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 hover:border-teal-100 transition-all duration-300 gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                          ${isService ? 'bg-indigo-50 text-indigo-500' : isProduct ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}
                        `}>
                          {item.quantity}x
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-teal-700 transition-colors">
                            {name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {isService ? "Service" : isProduct ? "Product" : "Package"}
                            </span>
                            {item.staff?.name && (
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <User size={12} /> {item.staff.name} {item.staff.role && <span className="text-[10px] font-normal opacity-70 ml-1">({item.staff.role})</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-4 sm:pt-0">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                          ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} each
                        </div>
                        <div className="font-mono text-xl font-bold text-slate-900 tracking-tight">
                          ₹{item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Customer & Totals */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Customer Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <User size={14} /> Client Details
              </h3>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4 shadow-inner">
                  <span className="text-3xl font-black text-slate-400">
                    {(invoice.customer?.name || "W")[0].toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {invoice.customer?.name || "Walk-in Guest"}
                </h2>
                
                {invoice.customer?.phone ? (
                  <div className="inline-flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-full text-sm font-medium border border-slate-100">
                    <Phone size={14} className="text-teal-500" />
                    {invoice.customer.phone}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic">No contact info</span>
                )}
              </div>
            </div>

            {/* Payment & Totals Card */}
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-900/40 border border-slate-800 overflow-hidden relative">
              {/* Card Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="p-8 relative z-10 space-y-6">
                
                {/* Payment Methods */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Payment Method</h3>
                  <div className="flex flex-wrap gap-2">
                    {invoice.payments.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/50">
                        <CreditCard size={14} className="text-teal-400" />
                        <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">{p.method}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-slate-800 my-2" />

                {/* Subtotals */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-sm font-medium">Base Subtotal</span>
                    <span className="font-mono text-slate-300">₹{invoice.totalGross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-sm font-medium">GST (Tax)</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{(invoice.totalTax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {invoice.totalDiscount > 0 && (
                    <div className="flex justify-between items-center text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg -mx-3">
                      <span className="text-sm font-semibold flex items-center gap-1">
                        Discount Applied
                      </span>
                      <span className="font-mono font-bold">-₹{invoice.totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs py-2">
                  <ShieldCheck size={14} /> Encrypted & Secure Record
                </div>

                {/* Grand Total */}
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 rounded-2xl text-white shadow-lg shadow-teal-500/20 flex flex-col items-center text-center transform transition-transform hover:scale-[1.02]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100 mb-1">Total Paid</span>
                  <span className="text-4xl font-black font-mono tracking-tighter">
                    ₹{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
