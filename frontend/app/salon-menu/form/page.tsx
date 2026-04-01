"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft,
  Check,
  AlertCircle,
  Save,
  RotateCcw,
  Tag,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

type ItemType = 'service' | 'product' | 'package';

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

const tabs = [
  { id: 'service' as ItemType, label: 'Service', color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'product' as ItemType, label: 'Product', color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'package' as ItemType, label: 'Package', color: 'bg-pink-500', text: 'text-pink-600', bg: 'bg-pink-50' },
];

const gstOptions = [0, 5, 12, 18, 28];

// Generate unique code based on type and timestamp
const generateCode = (type: ItemType) => {
  const prefix = type === 'service' ? 'SVC' : type === 'product' ? 'PRD' : 'PKG';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${timestamp}`;
};

function SalonMenuFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const typeParam = searchParams.get('type') as ItemType || 'service';
  const idParam = searchParams.get('id');
  const isEditing = !!idParam;

  const [activeTab, setActiveTab] = useState<ItemType>(typeParam);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    gender: "Male" as "Male" | "Female" | "Unisex",
    category: "",
    gst: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const showToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    if (isEditing && idParam) {
      fetch(`${apiUrl}/menu/${idParam}?type=${typeParam}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setFormData(data);
          else showToast("Failed to load item", "error");
        })
        .catch(() => showToast("Server error", "error"))
        .finally(() => setIsLoading(false));
    } else {
      // Auto-generate code for new items
      setFormData(prev => ({ ...prev, code: generateCode(activeTab) }));
    }
  }, [idParam, typeParam, apiUrl, isEditing, showToast, activeTab]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.description?.trim()) errs.description = "Required";
    if (!formData.price || formData.price <= 0) errs.price = "Required";
    if (!formData.mPrice || formData.mPrice <= 0) errs.mPrice = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSaving(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiUrl}/menu/${idParam}` : `${apiUrl}/menu`;

    try {
      const { gst, ...dataToSend } = formData;
      
      // Filter data based on type
      const payload: any = { 
        type: activeTab,
        description: dataToSend.description,
        price: dataToSend.price,
        mPrice: dataToSend.mPrice,
      };

      // Only send code if editing; for new items, the backend generates a sequential one
      if (isEditing) {
        payload.code = dataToSend.code;
      }

      if (activeTab === 'service') {
        payload.gender = dataToSend.gender;
        payload.category = dataToSend.category;
        payload.subcategory = dataToSend.subcategory;
      } else if (activeTab === 'product') {
        payload.category = dataToSend.category;
      }
      
      payload.gst = Number(formData.gst) || 0;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast(isEditing ? "Updated successfully" : "Created successfully", "success");
        setTimeout(() => router.push('/salon-menu'), 600);
      } else {
        const err = await res.json();
        showToast(err.error || "Save failed", "error");
        setIsSaving(false);
      }
    } catch {
      showToast("Network error", "error");
      setIsSaving(false);
    }
  };

  const reset = () => {
    setFormData({
      code: generateCode(activeTab),
      description: "",
      price: undefined,
      mPrice: undefined,
      gender: "Male",
      category: "",
      gst: 0,
    });
    setErrors({});
  };

  const updateField = (field: keyof MenuItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
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
              className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[200px] ${
                toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
              }`}
            >
              {toast.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-6 py-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Edit Item' : `New ${activeTabData.label}`}
            </h1>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update item details' : 'Add to your catalog'}
            </p>
          </div>
        </div>

        {/* Type Selector (create only) */}
        {!isEditing && (
          <div className="flex gap-3 mb-8 max-w-md">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setFormData(prev => ({ ...prev, code: generateCode(tab.id) }));
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id 
                    ? `${tab.bg} ${tab.text} ring-2 ring-offset-2 ring-slate-900 shadow-sm` 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={`e.g. ${activeTab === 'service' ? 'Haircut & Styling' : activeTab === 'product' ? 'Keratin Shampoo' : 'Bridal Package'}`}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${
                    errors.description ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.description && <p className="mt-1.5 text-sm text-rose-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      placeholder="e.g. Hair"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {activeTab === 'service' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                    <div className="flex gap-2">
                      {['Male', 'Female'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateField('gender', g)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            formData.gender === g
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-generated code display */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-500">Item Code:</span>
                <span className="font-mono text-sm font-semibold text-slate-700">{formData.code}</span>
                <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded">Auto-generated</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.price ?? ''}
                    onChange={(e) => updateField('price', Number(e.target.value) || undefined)}
                    placeholder="0"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold ${
                      errors.price ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-rose-500">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Member Price (M-Price ₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.mPrice ?? ''}
                    onChange={(e) => updateField('mPrice', Number(e.target.value) || undefined)}
                    placeholder="0"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold ${
                      errors.mPrice ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.mPrice && <p className="mt-1 text-sm text-rose-500">{errors.mPrice}</p>}
                <p className="mt-1.5 text-[10px] text-slate-400 font-medium italic">Mandatory special rate for members</p>
              </div>
            </div>
          </div>

          {/* GST */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Tax (GST)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">GST Percentage (%)</label>
                <div className="flex gap-1.5">
                  {[0, 5, 12, 18, 28].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateField('gst', val)}
                      className={`flex-1 py-2.5 rounded-lg text-[11px] font-black transition-all ${
                        formData.gst === val
                          ? 'bg-emerald-600 text-white shadow-md scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/50'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <div className="flex-1 relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.gst ?? 0}
                    onChange={(e) => updateField('gst', Number(e.target.value))}
                    placeholder="Custom %"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 font-medium italic">GST will be applied to the base price during billing.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {!isEditing && (
              <button
                type="button"
                onClick={reset}
                className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3.5 px-6 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Update Item' : 'Save Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SalonMenuFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    }>
      <SalonMenuFormContent />
    </Suspense>
  );
}
