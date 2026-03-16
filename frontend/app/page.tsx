"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users, ShoppingBag, HandCoins, TrendingUp, Receipt, IndianRupee, CreditCard,
  Calendar, Sparkles, ArrowUpRight, Wallet, BarChart3, Activity, Zap,
  CalendarCheck, Star, ArrowRight, Package, Clock, Plus, FileText,
  Settings, ChevronDown, ArrowUp, ArrowDown, Scissors, UserPlus, Printer, AlertTriangle, X
} from "lucide-react";

// Types
interface DashboardStats {
  dailySales: number;
  totalGross: number;
  totalDiscount: number;
  totalTickets: number;
  totalItemsSold: number;
  newCustomers: number;
  uniqueCustomers: number;
  repeatCustomers: number;
  appointmentsToday: number;
  paymentMethods: { cash: number; card: number; gpay: number; paytm: number; phonepe: number };
  topServices: { name: string; revenue: number; count: number }[];
  staffPerformance: { id: string; name: string; revenue: number; bills: number }[];
  recentInvoices: { id: string; invoiceId: string; customerName: string; total: number; date: string; paymentMethod: string; itemCount: number }[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface InactiveCustomer {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  daysInactive: number;
}

// Payment Logos
const GPayLogo = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const PhonePeLogo = () => (
  <div className="w-5 h-5 bg-[#5f259f] rounded-md flex items-center justify-center">
    <span className="text-white text-[10px] font-black italic">Pe</span>
  </div>
);

const PaytmLogo = () => (
  <div className="flex flex-col items-center leading-none">
    <span className="text-[#00baf2] text-[9px] font-black">pay</span>
    <span className="text-[#002970] text-[9px] font-black italic">tm</span>
  </div>
);

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

// Components
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplayed(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayed(value); clearInterval(timer); }
      else setDisplayed(Math.round(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{displayed.toLocaleString("en-IN")}{suffix}</>;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

// Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 animate-pulse">
      <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl" />
        <div className="h-80 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}

// Toast Component
function Toast({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[280px] ${
              toast.type === "success" ? "bg-emerald-500 text-white" : 
              toast.type === "error" ? "bg-rose-500 text-white" : 
              "bg-blue-500 text-white"
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const router = useRouter();
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    dailySales: 0, totalGross: 0, totalDiscount: 0,
    totalTickets: 0, totalItemsSold: 0, newCustomers: 0,
    uniqueCustomers: 0, repeatCustomers: 0, appointmentsToday: 0,
    paymentMethods: { cash: 0, card: 0, gpay: 0, paytm: 0, phonepe: 0 },
    topServices: [], staffPerformance: [], recentInvoices: []
  });
  const [inactiveAlerts, setInactiveAlerts] = useState<InactiveCustomer[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const showToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = filterDate ? `?date=${filterDate}` : "";
    fetch(`${apiUrl}/dashboard${query}`)
      .then((r) => { if (!r.ok) throw new Error("fail"); return r.json(); })
      .then((d) => setStats(d))
      .catch((e) => { console.error("Dashboard fetch error:", e); showToast("Failed to load dashboard data", "error"); })
      .finally(() => { setLoading(false); setInitialLoad(false); });
  }, [apiUrl, filterDate, showToast]);

  useEffect(() => {
    // Check for inactive customers alert
    fetch(`${apiUrl}/customers/inactive`)
      .then(r => r.json())
      .then(d => {
        if (d && d.length > 0) {
          setInactiveAlerts(d);
        }
      })
      .catch(e => console.error("Failed to fetch inactive customers", e));
  }, [apiUrl]);

  const totalPayments = useMemo(() => {
    const pm = stats.paymentMethods;
    return pm.cash + pm.card + pm.gpay + pm.paytm + pm.phonepe;
  }, [stats.paymentMethods]);
  
  const retentionRate = useMemo(() => {
    if (!stats.uniqueCustomers) return 0;
    return Math.round((stats.repeatCustomers / stats.uniqueCustomers) * 100);
  }, [stats.repeatCustomers, stats.uniqueCustomers]);

  const avgBill = stats.totalTickets > 0 ? Math.round(stats.dailySales / stats.totalTickets) : 0;

  // Payment methods config
  const paymentMethods = [
    { label: "Cash", icon: <IndianRupee size={18} />, value: stats.paymentMethods.cash, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Card", icon: <CreditCard size={18} />, value: stats.paymentMethods.card, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600" },
    { label: "GPay", icon: <GPayLogo />, value: stats.paymentMethods.gpay, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Paytm", icon: <PaytmLogo />, value: stats.paymentMethods.paytm, color: "from-sky-500 to-sky-600", bg: "bg-sky-50", text: "text-sky-600" },
    { label: "PhonePe", icon: <PhonePeLogo />, value: stats.paymentMethods.phonepe, color: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-600" },
  ];

  if (initialLoad && loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Toast toasts={toasts} />

      <AnimatePresence>
        {inactiveAlerts.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0, scale: 0.98 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.98 }}
            className="sticky top-0 z-50 overflow-hidden pt-4 lg:pt-6 px-4 lg:px-8 -mx-4 lg:-mx-8 mb-8 bg-slate-50/60 backdrop-blur-xl border-b border-rose-100/40 shadow-[0_10px_40px_rgba(225,29,72,0.02)]"
          >
            <div className="pb-6 lg:pb-8 max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-white via-white/95 to-rose-50/30 backdrop-blur-3xl border border-rose-100/60 shadow-[0_20px_50px_rgba(225,29,72,0.08)] p-5 lg:p-6 transition-all hover:shadow-[0_25px_60px_rgba(225,29,72,0.12)] group">
                {/* Decorative backgrounds */}
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-rose-100/20 via-rose-50/10 to-transparent pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-400/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-rose-400/10 transition-colors duration-1000" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-rose-400/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-rose-400/15 transition-colors duration-1000" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                  {/* Alert Icon and Title */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="relative w-14 h-14 bg-white text-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-200/40 border border-rose-100/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <div className="absolute inset-0 bg-rose-400/10 rounded-2xl animate-pulse" />
                      <div className="absolute -inset-1 bg-gradient-to-tr from-rose-500/20 to-transparent blur-md opacity-50" />
                      <AlertTriangle size={28} className="relative z-10 drop-shadow-[0_2px_4px_rgba(225,29,72,0.3)] animate-bounce-slow" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 leading-none tracking-tight">Retention Alert</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                        <p className="text-[11px] text-rose-600 font-black uppercase tracking-[0.2em]">{inactiveAlerts.length} AT-RISK CUSTOMERS</p>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Customer Cards */}
                  <div className="flex-1 w-full overflow-x-auto pb-2 -mb-2 scrollbar-none">
                    <div className="flex gap-3 px-1">
                      {inactiveAlerts.slice(0, 5).map(customer => (
                        <div 
                          key={customer.id} 
                          onClick={() => router.push(`/customers/${customer.id}`)}
                          className="flex-shrink-0 min-w-[180px] p-3 rounded-2xl bg-white border border-slate-100/80 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer group/card"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-[12px] font-black text-slate-400 group-hover/card:from-rose-500 group-hover/card:to-rose-600 group-hover/card:text-white transition-all duration-500 shadow-sm`}>
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[13px] font-bold text-slate-800 line-clamp-1 group-hover/card:text-rose-600 transition-colors">{customer.name.toLowerCase()}</p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tight">{customer.phone}</p>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
                              <Clock size={10} className="text-slate-300 group-hover/card:text-rose-400 transition-colors" />
                              <span>{customer.daysInactive} days ago</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {inactiveAlerts.length > 5 && (
                        <div 
                          onClick={() => router.push('/reports?tab=Client Report')}
                          className="flex-shrink-0 px-4 rounded-xl bg-slate-900 text-white flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 hover:-translate-y-0.5 group/more"
                        >
                          <span className="text-[11px] font-bold">+{inactiveAlerts.length - 5} More</span>
                          <ArrowRight size={14} className="opacity-70 group-hover/more:opacity-100 group-hover/more:translate-x-0.5 transition-all" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => router.push('/reports?tab=Client Report')}
                      className="group/btn relative px-7 py-3 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-950/20 active:scale-95 flex items-center gap-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      <span className="relative z-10">View Report</span>
                      <ArrowRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setInactiveAlerts([])}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-slate-100 hover:border-rose-100 shadow-sm"
                      title="Dismiss Alert"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8 border border-white/10 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-violet-500/15 to-purple-500/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-teal-500/20 rounded-full border border-teal-500/30 text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={10} className="animate-pulse" /> Live Dashboard
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white">
                {getGreeting()},{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400">Admin</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {filterDate ? `Results for ${new Date(filterDate).toLocaleDateString("en-IN", { dateStyle: "long" })}` : "Complete business overview & analytics"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Action Buttons - Compact */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => router.push("/billing/new")}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                  title="New Bill"
                >
                  <Plus size={14} /> Bill
                </button>
                <button
                  onClick={() => router.push("/customers/new")}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                  title="New Customer"
                >
                  <UserPlus size={14} /> Customer
                </button>
                <button
                  onClick={() => router.push("/appointments")}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                  title="Book Appointment"
                >
                  <CalendarCheck size={14} /> Appt
                </button>
                <button
                  onClick={() => router.push("/closing")}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                  title="Close Day"
                >
                  <FileText size={14} /> Close
                </button>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setFilterDate("")}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    !filterDate 
                      ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 shadow-lg shadow-teal-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Lifetime
                </button>
                <div className="relative group min-w-[140px]">
                  <input 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)} 
                    onFocus={(e) => (e.target as any).showPicker?.()}
                    className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                  <div className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between gap-2 transition-all border ${
                    filterDate 
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/20" 
                      : "text-slate-400 bg-white/5 border-white/5 group-hover:border-white/20 group-hover:text-white"
                  }`}>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className={filterDate ? "text-white" : "text-teal-400"} />
                      <span>{filterDate ? new Date(filterDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Pick Date"}</span>
                    </div>
                    <ChevronDown size={12} className={filterDate ? "text-white/60" : "text-slate-500"} />
                  </div>
                </div>
              </div>

              {/* Settings Button */}
              <button 
                onClick={() => router.push("/settings")}
                className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Loading Bar */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ scaleX: 0 }} 
                animate={{ scaleX: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 origin-left"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Actual Amount", value: stats.totalGross, icon: TrendingUp, gradient: "from-blue-500 via-indigo-500 to-violet-500", trend: "up" },
            { label: "Paid Amount", value: stats.dailySales, icon: HandCoins, gradient: "from-emerald-500 via-teal-500 to-cyan-500", trend: "up" },
            { label: "Average Bill", value: avgBill, icon: IndianRupee, gradient: "from-amber-500 via-orange-500 to-rose-500", trend: "up" },
            { label: "Discounts", value: stats.totalDiscount, icon: Sparkles, gradient: "from-rose-500 via-pink-500 to-fuchsia-500", trend: "down" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">{stat.label}</span>
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <stat.icon size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black">
                  <AnimatedNumber value={stat.value} prefix="₹" />
                </h3>
                {stat.trend !== "neutral" && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${stat.trend === "up" ? "text-emerald-200" : "text-rose-200"}`}>
                    {stat.trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span>vs last period</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bills", value: stats.totalTickets, icon: Receipt, color: "teal" as const },
            { label: "Business Volume", value: stats.totalItemsSold, icon: Package, color: "violet" as const },
            { label: "Retention", value: retentionRate, icon: Star, color: "amber" as const, suffix: "%" },
            { label: "Appointments", value: stats.appointmentsToday, icon: CalendarCheck, color: "sky" as const },
          ].map((s: { label: string; value: number; icon: any; color: string; prefix?: string; suffix?: string }) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-11 h-11 bg-${s.color}-100 text-${s.color}-600 rounded-xl flex items-center justify-center`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-black text-slate-800">
                  <AnimatedNumber value={s.value} prefix={s.prefix || ""} suffix={s.suffix || ""} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Insights */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Customer Insights</h3>
                <p className="text-xs text-slate-500">Customer breakdown</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Customers", value: stats.uniqueCustomers, icon: Users, color: "indigo" },
                { label: "New Customers", value: stats.newCustomers, icon: Sparkles, color: "emerald" },
                { label: "Repeat Clients", value: stats.repeatCustomers, icon: Star, color: "amber" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-${item.color}-100 text-${item.color}-600 rounded-lg flex items-center justify-center`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">
                    <AnimatedNumber value={item.value} />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Revenue Streams */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Revenue Streams</h3>
                  <p className="text-xs text-slate-500">Real-time analytics</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Business Volume", value: stats.totalItemsSold, icon: ShoppingBag },
                { label: "Bill Count", value: stats.totalTickets, icon: Receipt },
                { label: "Paid Amount", value: stats.dailySales, icon: TrendingUp, highlight: true },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-xl border ${item.highlight ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <item.icon size={14} className={item.highlight ? "text-teal-500" : "text-slate-400"} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                  </div>
                  <p className={`text-xl font-black ${item.highlight ? "text-teal-600" : "text-slate-800"}`}>
                    {item.highlight ? <AnimatedNumber value={item.value} prefix="₹" /> : <AnimatedNumber value={item.value} />}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">New Clients</span>
                </div>
                <p className="text-2xl font-black text-slate-800"><AnimatedNumber value={stats.newCustomers} /></p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star size={14} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Repeat</span>
                </div>
                <p className="text-2xl font-black text-slate-800"><AnimatedNumber value={stats.repeatCustomers} /></p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Services */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                  <Scissors size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Top Services</h3>
                  <p className="text-xs text-slate-500">By revenue</p>
                </div>
              </div>
              <button onClick={() => router.push("/salon-menu")} className="text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors">
                View All <ArrowUpRight size={12} />
              </button>
            </div>
            {stats.topServices.length === 0 ? (
              <div className="text-center py-8">
                <Scissors size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No service data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topServices.map((svc, i) => {
                  const maxRev = stats.topServices[0]?.revenue || 1;
                  const pct = Math.round((svc.revenue / maxRev) * 100);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{svc.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">₹{svc.revenue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Staff Performance */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Star size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Staff Performance</h3>
                  <p className="text-xs text-slate-500">Revenue contribution</p>
                </div>
              </div>
              <button onClick={() => router.push("/staff")} className="text-xs font-bold text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors">
                View All <ArrowUpRight size={12} />
              </button>
            </div>
            {stats.staffPerformance.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No staff data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.staffPerformance.map((s, i) => {
                  const maxRev = stats.staffPerformance[0]?.revenue || 1;
                  const pct = Math.round((s.revenue / maxRev) * 100);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xs font-bold">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{s.name}</p>
                            <p className="text-[10px] text-slate-400">{s.bills} services</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-800">₹{s.revenue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Recent Invoices */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Recent Bills</h3>
                  <p className="text-xs text-slate-500">Last {stats.recentInvoices.length} transactions</p>
                </div>
              </div>
              <button onClick={() => router.push("/billing")} className="text-xs font-bold text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            {stats.recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <Receipt size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No invoices yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {stats.recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => router.push(`/billing/${inv.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                        <Receipt size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{inv.customerName}</p>
                        <p className="text-[10px] text-slate-400">{inv.paymentMethod} · {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-800">₹{inv.total.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Payment Methods */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Payment Breakdown</h3>
              <p className="text-xs text-slate-500">Collection by method</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {paymentMethods.map((m) => {
              const pct = totalPayments > 0 ? Math.round((m.value / totalPayments) * 100) : 0;
              return (
                <motion.div
                  key={m.label}
                  variants={itemVariants}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition-all"
                >
                  <div className="bg-slate-50 p-2.5 rounded-xl">{m.icon}</div>
                  <span className={`text-xs font-bold ${m.text}`}>{m.label}</span>
                  <div className="w-full">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} className={`h-full bg-gradient-to-r ${m.color} rounded-full`} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 text-center mt-1">{pct}%</p>
                  </div>
                  <span className="text-lg font-black text-slate-800">₹<AnimatedNumber value={m.value} /></span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
