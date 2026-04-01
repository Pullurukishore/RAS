"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package as PackageIcon,
  Sparkles,
  ShoppingBag,
  Filter,
  ChevronRight,
  Home,
  BarChart3,
  Layers,
  Zap,
  Scissors,
  Pencil,
  Eye,
  AlertCircle,
  ChevronDown,
  Download,
  Grid3X3,
  List,
  ArrowUpDown,
  X,
  Check,
  MoreHorizontal,
  RefreshCw,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface MenuItem {
  id: string;
  code: string;
  description: string;
  price: number;
  mPrice?: number;
  gst: number;
  gender?: string;
  category?: string;
  subcategory?: string;
  createdAt?: string;
  updatedAt?: string;
}

type ItemType = "service" | "product" | "package";
type ViewMode = "table" | "grid";
type SortField = "description" | "price" | "gst" | "code" | "category";
type SortOrder = "asc" | "desc";

interface Filters {
  gender: string;
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
}

const tabs = [
  { id: "service" as ItemType, label: "Services", icon: Scissors, color: "text-blue-600", bg: "bg-blue-100", gradient: "from-blue-500 to-cyan-600" },
  { id: "product" as ItemType, label: "Products", icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100", gradient: "from-purple-500 to-violet-600" },
  { id: "package" as ItemType, label: "Packages", icon: PackageIcon, color: "text-pink-600", bg: "bg-pink-100", gradient: "from-pink-500 to-rose-600" }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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

const toastVariants: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  show: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.9 },
};

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function SalonMenuPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ItemType>("service");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("description");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filters, setFilters] = useState<Filters>({
    gender: "",
    category: "",
    subcategory: "",
    minPrice: "",
    maxPrice: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const fetchItems = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      setError(null);
      const res = await fetch(`${apiUrl}/menu?type=${activeTab}`);
      if (!res.ok) throw new Error("Failed fetching menu");
      const data = await res.json();
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, apiUrl]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setSearch("");
    setFilters({ gender: "", category: "", subcategory: "", minPrice: "", maxPrice: "" });
  }, [activeTab]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${apiUrl}/menu/${id}?type=${activeTab}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Delete failed");

      setItems(prev => prev.filter(i => i.id !== id));
      showToast("Item deleted successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete item", "error");
      console.error(err);
    }
  }, [activeTab, apiUrl, showToast]);


  const uniqueCategories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [items]);

  const uniqueSubcategories = useMemo(() => {
    const subs = new Set(items.map(i => i.subcategory).filter(Boolean));
    return Array.from(subs).sort();
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        item =>
          item.description.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.category?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filters.gender && activeTab === "service") {
      result = result.filter(item => item.gender === filters.gender);
    }

    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }

    if (filters.subcategory && activeTab === "service") {
      result = result.filter(item => item.subcategory === filters.subcategory);
    }

    if (filters.minPrice) {
      result = result.filter(item => item.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      result = result.filter(item => item.price <= parseFloat(filters.maxPrice));
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortField] ?? "";
      let bVal: string | number = b[sortField] ?? "";

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, search, filters, sortField, sortOrder, activeTab]);

  const exportToCSV = useCallback(() => {
    const headers = ["Code", "Description", "Price", "M-Price", "GST", "Gender", "Category", "Subcategory"];
    const rows = filteredAndSortedItems.map(item => [
      item.code,
      item.description,
      item.price,
      item.mPrice || "",
      item.gst,
      item.gender || "",
      item.category || "",
      item.subcategory || "",
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-catalog-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("Export completed", "success");
  }, [filteredAndSortedItems, activeTab, showToast]);

  const stats = useMemo(() => {
    const total = items.length;
    const filtered = filteredAndSortedItems.length;
    const categories = new Set(items.map(i => i.category)).size;
    const avgPrice = total > 0 ? Math.round(items.reduce((a, b) => a + b.price, 0) / total) : 0;
    const gstValues = items.map(i => i.gst);
    const minGst = gstValues.length ? Math.min(...gstValues) : 0;
    const maxGst = gstValues.length ? Math.max(...gstValues) : 0;
    const totalValue = items.reduce((a, b) => a + b.price, 0);

    return { total, filtered, categories, avgPrice, minGst, maxGst, totalValue };
  }, [items, filteredAndSortedItems]);

  const activeTabData = tabs.find(t => t.id === activeTab);
  const ActiveIcon = activeTabData?.icon || Sparkles;


  const clearFilters = () => {
    setFilters({ gender: "", category: "", subcategory: "", minPrice: "", maxPrice: "" });
    setSearch("");
  };

  const hasActiveFilters = filters.gender || filters.category || filters.subcategory || filters.minPrice || filters.maxPrice || search;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFilters(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => {
        if (sortField === field) {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
          setSortField(field);
          setSortOrder("asc");
        }
      }}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
        sortField === field
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {label}
      <ArrowUpDown size={12} className={sortField === field && sortOrder === "desc" ? "rotate-180" : ""} />
    </button>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full min-h-screen bg-slate-50/30 flex flex-col gap-6 py-2"
    >
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              variants={toastVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] ${
                toast.type === "success" ? "bg-emerald-500 text-white" :
                toast.type === "error" ? "bg-rose-500 text-white" :
                "bg-slate-800 text-white"
              }`}
            >
              {toast.type === "success" && <Check size={18} />}
              {toast.type === "error" && <AlertCircle size={18} />}
              <span className="text-sm font-semibold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${activeTabData?.bg} ${activeTabData?.color}`}>
            <ActiveIcon size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
              {activeTabData?.label} Catalog
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Manage your business offerings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={() => fetchItems(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <button
            onClick={exportToCSV}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all hidden sm:flex"
            title="Export CSV"
          >
            <Download size={18} />
          </button>

          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/50">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              title="Table view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <button
            onClick={() => router.push(`/salon-menu/form?type=${activeTab}`)}
            className="group relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus size={17} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Items" value={loading ? "-" : stats.total} icon={Layers} gradient="bg-gradient-to-br from-teal-500 to-emerald-600" />
        <StatCard label="Showing" value={loading ? "-" : stats.filtered} icon={Filter} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard label="Categories" value={loading ? "-" : stats.categories} icon={BarChart3} gradient="bg-gradient-to-br from-indigo-500 to-violet-600" />
        <StatCard label="Avg. Price" value={loading ? "-" : `₹${stats.avgPrice}`} icon={Zap} gradient="bg-gradient-to-br from-rose-500 to-pink-600" />
        <StatCard label="Total Value" value={loading ? "-" : `₹${stats.totalValue.toLocaleString("en-IN")}`} icon={ShoppingBag} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
      </motion.div>

      {/* Filters & Controls */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {/* Tabs & Search */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4">
          <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner border border-slate-200/50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 z-10 ${
                    isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200 w-full h-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon size={14} className={isActive ? tab.color : ""} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-1">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={15} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${activeTabData?.label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 py-2.5 border-slate-200/70 bg-slate-50/80 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400 outline-none w-full transition-all focus:bg-white text-slate-800 placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                showFilters || hasActiveFilters
                  ? "bg-teal-50 border-teal-200 text-teal-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline text-sm font-semibold">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-slate-100 overflow-hidden"
            >
              <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {activeTab === "service" && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Gender</label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400 outline-none"
                    >
                      <option value="">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400 outline-none"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {activeTab === "service" && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Subcategory</label>
                    <select
                      value={filters.subcategory}
                      onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400 outline-none"
                    >
                      <option value="">All Subcategories</option>
                      {uniqueSubcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Min Price (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Max Price (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="∞"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400 outline-none"
                    />
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort Bar */}
        <div className="px-4 md:px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort by:</span>
          <SortButton field="description" label="Name" />
          <SortButton field="price" label="Price" />
          <SortButton field="code" label="Code" />
          <SortButton field="category" label="Category" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === "table" ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Item Details</th>
                  {activeTab === "service" && (
                    <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 hidden md:table-cell">Gender</th>
                  )}
                  <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 hidden sm:table-cell">Category</th>
                  <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 text-right">Unit Price</th>
                  <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 text-center">GST %</th>
                  <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 text-center hidden sm:table-cell">M-Price</th>
                  <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400 text-center sticky right-0 bg-slate-50/95 backdrop-blur-sm z-10 border-l border-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white">
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.tr key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                            <AlertCircle className="text-rose-500" size={28} />
                          </div>
                          <h4 className="text-lg font-bold text-rose-600 mb-1">Failed to load</h4>
                          <p className="text-sm text-slate-500 max-w-sm mb-4">{error}</p>
                          <button
                            onClick={() => fetchItems()}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                          >
                            <RefreshCw size={14} />
                            Retry
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ) : loading ? (
                    <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin" />
                        </div>
                      </td>
                    </motion.tr>
                  ) : filteredAndSortedItems.length === 0 ? (
                    <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={8} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
                            <Layers className="text-slate-300 w-9 h-9" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-1">No items found</h4>
                          <p className="text-sm text-slate-500 max-w-sm">
                            {hasActiveFilters ? "Try adjusting your filters or search query." : "Get started by adding your first item."}
                          </p>
                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredAndSortedItems.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                        onClick={() => router.push(`/salon-menu/${item.id}?type=${activeTab}`)}
                        className="hover:bg-teal-50/30 transition-colors group cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 flex items-center justify-center border border-slate-100 transition-all duration-300 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white shadow-sm`}>
                              <ActiveIcon size={15} />
                            </div>
                            <div>
                              <span className="font-mono text-xs font-bold text-slate-700 group-hover:text-teal-700 transition-colors">
                                #{item.code}
                              </span>
                              <p className="font-bold text-slate-800 text-sm">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        {activeTab === "service" && (
                          <td className="px-5 py-4 hidden md:table-cell">
                            {item.gender && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                item.gender === "Male" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                item.gender === "Female" ? "bg-pink-50 text-pink-600 border border-pink-100" :
                                "bg-purple-50 text-purple-600 border border-purple-100"
                              }`}>
                                {item.gender}
                              </span>
                            )}
                          </td>
                        )}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200/60 shadow-sm">
                            {item.category || "General"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-black text-slate-900 text-sm tabular-nums">
                            ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg text-[10px] border border-teal-100 uppercase tracking-widest">
                            {item.gst}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center hidden sm:table-cell">
                          {item.mPrice ? (
                            <span className="font-bold text-teal-600 text-sm tabular-nums">
                              ₹{item.mPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 sticky right-0 bg-white/95 backdrop-blur-sm z-10 border-l border-slate-100 group-hover:bg-teal-50/95 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => router.push(`/salon-menu/${item.id}?type=${activeTab}`)}
                              className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-teal-100/50"
                              title="View"
                            >
                              <Eye size={14} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => router.push(`/salon-menu/form?type=${activeTab}&id=${item.id}`)}
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-indigo-100/50"
                              title="Edit"
                            >
                              <Pencil size={14} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-rose-100/50"
                              title="Delete"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="wait">
                  {error ? (
                    <div className="col-span-full py-20 text-center">
                      <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
                      <h4 className="text-lg font-bold text-rose-600">Failed to load</h4>
                    </div>
                  ) : loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                      <div className="w-8 h-8 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                  ) : filteredAndSortedItems.length === 0 ? (
                    <div className="col-span-full py-24 text-center">
                      <Layers className="text-slate-300 w-16 h-16 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-slate-800">No items found</h4>
                    </div>
                  ) : (
                    filteredAndSortedItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                        onClick={() => router.push(`/salon-menu/${item.id}?type=${activeTab}`)}
                        className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg hover:border-teal-200 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl ${activeTabData?.bg} ${activeTabData?.color} flex items-center justify-center`}>
                            <ActiveIcon size={18} />
                          </div>
                        </div>

                        <p className="font-mono text-xs font-bold text-slate-400 mb-1">#{item.code}</p>
                        <h3 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2">{item.description}</h3>

                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {item.category && (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
                              {item.category}
                            </span>
                          )}
                          {item.gender && activeTab === "service" && (
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              item.gender === "Male" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                              item.gender === "Female" ? "bg-pink-50 text-pink-600 border border-pink-100" :
                              "bg-purple-50 text-purple-600 border border-purple-100"
                            }`}>
                              {item.gender}
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-600 border border-teal-100 shadow-sm">
                            GST {item.gst}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Price</p>
                            <p className="font-black text-slate-900">₹{item.price.toLocaleString("en-IN")}</p>
                          </div>
                          {item.mPrice && (
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">M-Price</p>
                              <p className="font-bold text-teal-600">₹{item.mPrice.toLocaleString("en-IN")}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/salon-menu/form?type=${activeTab}&id=${item.id}`);
                            }}
                            className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && filteredAndSortedItems.length > 0 && (
          <div className="px-4 md:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-700">{filteredAndSortedItems.length}</span> of{" "}
              <span className="font-bold text-slate-700">{items.length}</span> items
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>;
  gradient: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      className={`relative ${gradient} rounded-2xl p-4 overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-default shadow-sm border border-white/10`}
    >
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-[900] text-white/70 uppercase tracking-[0.12em] mb-1 leading-none">
            {label}
          </p>
          <h3 className="text-xl font-black text-white tracking-tight leading-none">
            {value}
          </h3>
        </div>
        <div className="w-9 h-9 bg-white/20 text-white rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 backdrop-blur-md border border-white/10">
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.07] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    </motion.div>
  );
}
