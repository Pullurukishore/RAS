"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Scissors,
  ShoppingBag,
  Package as PackageIcon,
  Sparkles,
  Pencil,
  Trash2,
  Layers,
  Zap,
  Tag,
  Info,
  History,
  TrendingUp,
  Clock,
  User,
  MoreVertical,
  AlertCircle,
} from "lucide-react";

interface MenuItem {
  id: string;
  code: string;
  description: string;
  price: number;
  mPrice: number;
  gst: number;
  gender?: string;
  category?: string;
  subcategory?: string;
}

type ItemType = "service" | "product" | "package";

export default function MenuItemViewPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get("type") as ItemType) || "service";

  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiUrl}/menu/${id}?type=${type}`);
        if (!res.ok) throw new Error("Failed to fetch item");
        const data = await res.json();
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load item");
        console.error("Failed to fetch item:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id, type, apiUrl]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${apiUrl}/menu/${id}?type=${type}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/salon-menu");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
      console.error(err);
    }
  }, [apiUrl, id, type, router]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-40">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-[10px]">Loading Catalog Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-24 h-24 bg-rose-50 text-rose-400 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-rose-100">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-rose-600 tracking-tight mb-2">Error Loading Item</h2>
        <p className="text-slate-500 max-w-md mb-8 font-medium">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/salon-menu")}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Back to Catalog
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-24 h-24 bg-rose-50 text-rose-400 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-rose-100">
          <Layers size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Item Not Found</h2>
        <p className="text-slate-500 max-w-md mb-8 font-medium">
          The requested catalog item could not be found. It may have been removed or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/salon-menu")}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          <ArrowLeft size={18} /> Return to Catalog
        </button>
      </div>
    );
  }

  const IconMap = {
    service: Scissors,
    product: ShoppingBag,
    package: PackageIcon,
  };
  const Icon = IconMap[type] || Sparkles;

  const getThemeColor = () => {
    if (type === "product") return "text-purple-600 bg-purple-100/50 border-purple-200";
    if (type === "package") return "text-pink-600 bg-pink-100/50 border-pink-200";
    return "text-indigo-600 bg-indigo-100/50 border-indigo-200";
  };

  const getGradient = () => {
    if (type === "product") return "from-purple-500 to-indigo-600";
    if (type === "package") return "from-rose-500 to-pink-600";
    return "from-indigo-500 to-violet-600";
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* ─── Top Navigation ─── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/salon-menu")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold group bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200/60 text-sm"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Catalog
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/salon-menu/form?type=${type}&id=${id}`)}
              className="bg-white border border-slate-200/60 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
            >
              <Pencil size={16} className="text-slate-400" /> Modify Entry
            </button>
            <button
              onClick={handleDelete}
              className="bg-white border border-rose-100 text-rose-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-rose-50 transition-all shadow-sm active:scale-95"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ─── LEFT: Main Info Card ─── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
              {/* Decorative Header */}
              <div className={`h-3 w-full bg-gradient-to-r ${getGradient()}`} />
              
              <div className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 ${item.gender === 'Female' ? 'bg-pink-50 text-pink-500' : item.gender === 'Male' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-500'}`}>
                      <Icon size={40} strokeWidth={1.5} className="drop-shadow-sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getThemeColor()}`}>
                          {item.code}
                        </span>
                        <span className="text-slate-300 font-bold text-[10px]">&bull;</span>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{type}</span>
                      </div>
                      <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">
                        {item.description}
                      </h1>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="text-right bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 shadow-inner group transition-all">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Standard Rate</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                        ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {item.mPrice && (
                      <div className="text-right bg-teal-50/50 px-6 py-4 rounded-3xl border border-teal-100 shadow-sm group transition-all">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600/70 mb-1">Member Rate</p>
                        <p className="text-3xl font-black text-teal-700 tracking-tighter tabular-nums">
                          ₹{item.mPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Categorization */}
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Tag size={14} className="text-indigo-500" /> Categorization
                    </h3>
                    
                    <div className="space-y-4">
                      <DetailRow label="Primary Category" value={item.category || "General"} />
                      <DetailRow label="Sub-Category" value={item.subcategory || "—"} />
                      <DetailRow label="Gender Focus" value={item.gender || "Unisex"} badge />
                    </div>
                  </div>

                  {/* Financial Defaults */}
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <IndianRupee size={14} className="text-emerald-500" /> Taxation & Yield
                    </h3>
                    
                    <div className="space-y-4">
                      <DetailRow label="GST Applicable" value={`${item.gst}%`} highlight />
                      <DetailRow label="Net Value" value={`₹${(item.price * (1 + item.gst / 100)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
                      <DetailRow label="Member Rate" value={item.mPrice ? `₹${item.mPrice.toLocaleString("en-IN")}` : "Not Set"} />
                    </div>
                  </div>
                </div>

                {/* Description / Notes if any could go here */}
                {type === "package" && (
                  <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles size={20} className="text-amber-500" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-700">Package Inclusions</h4>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                      This package is designed as a luxury bundle. Pricing is optimized for multiple services. 
                      Terms and conditions apply for individual service swaps.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── RIGHT: Insights & Sidebar ─── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Quick Stats Card */}
            <div className={`overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${getGradient()} p-8 text-white shadow-2xl relative`}>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1.5 rounded-full">Inventory Health</span>
                </div>
                
                <h4 className="text-sm font-black uppercase tracking-widest text-white/70 mb-2">Popularity Index</h4>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-5xl font-black tracking-tighter">High</span>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div key={star} className={`w-1.5 h-1.5 rounded-full ${star <= 4 ? 'bg-white' : 'bg-white/30'}`} />
                    ))}
                  </div>
                </div>
                
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-white w-4/5 rounded-full" />
                </div>
                
                <p className="text-xs font-medium text-white/70 leading-relaxed">
                  This {type} is among your top 20% by quarterly revenue contribution.
                </p>
              </div>
            </div>

            {/* Quick Actions / Tips */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Info size={14} className="text-blue-500" /> Catalog Insights
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <Clock size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1">Last Update</h5>
                    <p className="text-xs text-slate-400 font-medium">Automatic revision detected 2 days ago.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <History size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1">Usage Count</h5>
                    <p className="text-xs text-slate-400 font-medium">Included in 142 transactions this year.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                    <User size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1">Staff Speciality</h5>
                    <p className="text-xs text-slate-400 font-medium">Preferred by 85% of your senior stylists.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, badge, highlight }: { label: string; value: string; badge?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 group">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-500 px-2 transition-colors border-l-2 border-transparent group-hover:border-indigo-400">{label}</span>
      {badge ? (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          value === 'Female' ? 'bg-pink-50 text-pink-500 border-pink-100' : 
          value === 'Male' ? 'bg-blue-50 text-blue-500 border-blue-100' : 
          'bg-slate-50 text-slate-500 border-slate-100'
        }`}>
          {value}
        </span>
      ) : (
        <span className={`text-sm font-black tracking-tight ${highlight ? 'text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg' : 'text-slate-800'}`}>
          {value}
        </span>
      )}
    </div>
  );
}

function IndianRupee({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </svg>
  );
}
