"use client";

import Link from "next/link";
import {
  Plus,
  ReceiptText,
  FileText,
  Search,
  Users,
  ArrowRight,
  Wallet,
  Calendar,
  Pencil,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  CreditCard,
  Eye,
  IndianRupee,
  Printer,
  Trash2,
  Crown,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

/* ─── Animation Variants ─── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 22 },
  },
};

/* ─── Skeleton Loader ─── */
function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <div className="h-3 w-24 bg-slate-200/80 rounded-full" />
                <div className="h-7 w-32 bg-slate-200/80 rounded-lg" />
              </div>
              <div className="w-11 h-11 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between">
          <div className="h-5 w-36 bg-slate-200/80 rounded-full animate-pulse" />
          <div className="h-9 w-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 animate-pulse">
            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-24 bg-slate-200/60 rounded-md" />
            </div>
            <div className="h-3.5 w-28 bg-slate-100 rounded-md" />
            <div className="h-3.5 w-16 bg-slate-100 rounded-md" />
            <div className="h-4 w-20 bg-slate-100 rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat Card Component ─── */
function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconBg,
}: {
  label: string;
  value: string | number;
  icon: any;
  gradient: string;
  iconBg: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      className={`relative overflow-hidden rounded-2xl ${gradient} p-4 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-default`}
    >
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.15em] mb-2">
            {label}
          </p>
          <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-none">
            {value}
          </h3>
        </div>
        <div
          className={`w-10 h-10 ${iconBg} backdrop-blur-sm text-white rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 border border-white/20 shadow-lg`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      {/* Glass overlay */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/[0.06] rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
    </motion.div>
  );
}

/* ─── Helpers ─── */
const getPaymentStyle = (method: string) => {
  const m = method.toLowerCase();
  if (m.includes("cash")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (m.includes("card")) return "bg-indigo-50 text-indigo-700 border-indigo-100";
  if (m.includes("gpay")) return "bg-blue-50 text-blue-700 border-blue-100";
  if (m.includes("paytm")) return "bg-sky-50 text-sky-700 border-sky-100";
  if (m.includes("phonepe")) return "bg-purple-50 text-purple-700 border-purple-100";
  return "bg-slate-50 text-slate-600 border-slate-200/60";
};

/* ═══════════════════════════════
   BILLING DASHBOARD
   ═══════════════════════════════ */
export default function BillingDashboard() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [showStats, setShowStats] = useState(true);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/billing`)
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch invoices:", err);
        setLoading(false);
      });
  }, [apiUrl]);

  // Reset to first page when filtering or sorting
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  /* ─── Computed Stats ─── */
  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const uniqueCustomers = new Set(invoices.map((i) => i.customerId)).size;
    const avgBill = invoices.length > 0 ? Math.round(totalRevenue / invoices.length) : 0;
    const todayCount = invoices.filter(
      (inv) => new Date(inv.createdAt).toDateString() === new Date().toDateString()
    ).length;

    return { totalRevenue, uniqueCustomers, avgBill, todayCount };
  }, [invoices]);

  /* ─── Filtering + Sorting ─── */
  const filteredInvoices = useMemo(() => {
    let result = invoices.filter(
      (inv) =>
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customer?.name || "Guest").toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOrder) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        result.sort((a, b) => (b.total || 0) - (a.total || 0));
        break;
      case "lowest":
        result.sort((a, b) => (a.total || 0) - (b.total || 0));
        break;
    }

    return result;
  }, [invoices, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  /* ─── Delete ─── */
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone."))
      return;

    const previousInvoices = [...invoices];
    setInvoices(invoices.filter((inv) => inv.id !== id));

    try {
      const res = await fetch(`${apiUrl}/billing/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete invoice");
    } catch (err) {
      console.error("Error deleting invoice", err);
      setInvoices(previousInvoices);
      alert("Failed to delete invoice. Please try again.");
    }
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="flex flex-col gap-6 h-full pb-8">
        <div className="flex justify-between items-center">
          <div className="h-4 w-64 bg-slate-200/60 rounded-full animate-pulse" />
          <div className="h-11 w-40 bg-slate-200/60 rounded-2xl animate-pulse" />
        </div>
        <BillingSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 pb-12"
    >
      {/* ── Action Bar ── */}
      <motion.div variants={itemVariants} className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium text-sm hidden sm:inline">
            {invoices.length} invoices &middot; ₹{stats.totalRevenue.toLocaleString("en-IN")} total
            revenue
          </span>
          {stats.todayCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {stats.todayCount} today
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-teal-300 hover:text-teal-600 transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
          >
            {showStats ? <ChevronDown size={14} className="rotate-180 transition-transform" /> : <ChevronDown size={14} className="transition-transform" />}
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
          <Link href="/billing/new">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/25"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-500/15 to-indigo-500/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <Plus
                size={17}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              <span className="relative z-10">Create New Bill</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden"
          >
            <StatCard
              label="Total Invoices"
              value={invoices.length}
              icon={ReceiptText}
              gradient="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500"
              iconBg="bg-white/20"
            />
            <StatCard
              label="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              gradient="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500"
              iconBg="bg-white/20"
            />
            <StatCard
              label="Customers Billed"
              value={stats.uniqueCustomers}
              icon={Users}
              gradient="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500"
              iconBg="bg-white/20"
            />
            <StatCard
              label="Avg. Bill Value"
              value={`₹${stats.avgBill.toLocaleString("en-IN")}`}
              icon={CreditCard}
              gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500"
              iconBg="bg-white/20"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Invoices Table ── */}
      <motion.div
        variants={itemVariants}
        className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col"
      >
        {/* Table Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-white to-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl text-teal-600 shadow-sm border border-teal-100">
              <FileText size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Invoices</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {filteredInvoices.length} of {invoices.length} shown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative group flex-1 sm:flex-none">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border-slate-200/70 bg-slate-50/80 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none w-full sm:w-64 transition-all focus:bg-white text-slate-800 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="appearance-none pl-9 pr-10 py-3 bg-white border border-slate-200/70 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-teal-300 hover:shadow-md transition-all outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest ₹</option>
                <option value="lowest">Lowest ₹</option>
              </select>
              <ArrowUpDown
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none"
              />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="w-full overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center mb-6 shadow-inner">
                <ReceiptText className="text-slate-400 w-12 h-12" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">No invoices found</h4>
              <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
                {searchTerm
                  ? "Try adjusting your search query to find what you're looking for."
                  : "Get started by creating your first invoice. Click the button below to begin."}
              </p>
              {!searchTerm && (
                <Link href="/billing/new">
                  <button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-sm px-8 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-teal-500/25 transition-all active:scale-95 flex items-center gap-2">
                    <Plus size={18} />
                    Create First Bill
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
              <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Invoice
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Customer
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Staff
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 hidden xl:table-cell">
                    Date & Time
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 hidden lg:table-cell">
                    Items
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 hidden md:table-cell">
                    Actual Amount
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 text-right">
                    GST (Tax)
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 text-right">
                    Paid Amount
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 hidden md:table-cell">
                    Discount
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 hidden md:table-cell">
                    Payment
                  </th>
                  <th className="px-5 py-3 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white">
                <AnimatePresence mode="wait">
                  {paginatedInvoices.map((inv, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                      key={inv.id}
                      onClick={() => router.push(`/billing/${inv.id}`)}
                      className="hover:bg-teal-50/30 transition-colors group cursor-pointer"
                    >
                      {/* Invoice ID */}
                      <td className="px-5 py-1.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-600 flex items-center justify-center border border-teal-100/60 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white transition-all duration-300 shadow-sm text-xs">
                            <ReceiptText size={14} />
                          </div>
                          <div>
                            <span className="font-mono text-[11px] font-bold text-slate-700 group-hover:text-teal-700 transition-colors">
                              #{inv.id.substring(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-200/60 border border-slate-200/60 flex items-center justify-center font-bold text-slate-600 text-[10px] uppercase shadow-sm">
                            {(inv.customer?.name || "G").charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <div className="font-bold text-slate-800 text-xs">
                                {inv.customer?.name || "Walk-in"}
                              </div>
                              {inv.customer?.isMember && (
                                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-600 border border-amber-200 shadow-sm shrink-0">
                                  <Crown size={10} fill="currentColor" />
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {inv.customer?.phone || "Guest"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Staff */}
                      <td className="px-5 py-1.5">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {Array.from(new Set(inv.items?.map((i: any) => i.staff?.name).filter(Boolean))).map((staffName: any, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 border border-teal-100 text-[10px] font-bold uppercase tracking-wider"
                            >
                              {staffName}
                            </span>
                          ))}
                          {(!inv.items || inv.items.length === 0 || !inv.items.some((i: any) => i.staff)) && (
                             <span className="text-slate-300 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-1.5 hidden xl:table-cell">
                        <div className="flex flex-col gap-0">
                          <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-[9px] font-medium">
                            <Clock size={10} />
                            {new Date(inv.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-1.5 hidden lg:table-cell">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/50">
                          <span className="font-bold text-slate-700 text-[11px]">
                            {inv.items?.length || 0}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-black">
                            {inv.items?.length === 1 ? "Item" : "Items"}
                          </span>
                        </div>
                      </td>

                      {/* Actual Amount */}
                      <td className="px-5 py-1.5 hidden md:table-cell">
                        <span className="text-slate-500 font-bold text-xs tabular-nums">
                          ₹{(inv.totalGross || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* GST */}
                      <td className="px-5 py-1.5 text-right">
                        <span className="text-teal-600 font-bold text-xs tabular-nums">
                          ₹{(inv.totalTax || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Paid Amount */}
                      <td className="px-5 py-1.5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-slate-900 text-xs tabular-nums">
                            ₹{(inv.total || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">
                            Paid Full
                          </span>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-5 py-1.5 hidden md:table-cell">
                        {inv.totalDiscount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[11px] font-bold tabular-nums">
                            -₹{inv.totalDiscount.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="px-5 py-1.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {inv.payments?.slice(0, 2).map((p: any, i: number) => (
                            <span
                              key={i}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getPaymentStyle(p.method)}`}
                            >
                              {p.method}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-1.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/billing/${inv.id}`);
                            }}
                            className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-teal-100/50"
                            title="View / Print"
                          >
                            <Eye size={12} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/billing/${inv.id}/edit`);
                            }}
                            className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-indigo-100/50"
                            title="Edit"
                          >
                            <Pencil size={12} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, inv.id)}
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-rose-100/50"
                            title="Delete"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer / Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-slate-100/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-700">{Math.min(filteredInvoices.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredInvoices.length, currentPage * itemsPerPage)}</span> of{" "}
                <span className="font-bold text-slate-700">{filteredInvoices.length}</span> invoices
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/25"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 shadow-sm hover:shadow-md"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
