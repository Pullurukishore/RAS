"use client";

import { useState, useEffect, useCallback } from "react";
import { Receipt, Percent, FileText, IndianRupee, Save, Loader2, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface BillingSettings {
  invoicePrefix: string;
  defaultTaxRate: number;
  currency: string;
  enableDiscount: boolean;
}

export default function BillingSettingsPage() {
  const [formData, setFormData] = useState<BillingSettings>({
    invoicePrefix: "INV-",
    defaultTaxRate: 18,
    currency: "INR",
    enableDiscount: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const showToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    fetchBillingSettings();
  }, []);

  const fetchBillingSettings = async () => {
    try {
      const res = await fetch(`${apiUrl}/settings/billing`);
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setFormData({
            invoicePrefix: data.invoicePrefix ?? "INV-",
            defaultTaxRate: data.defaultTaxRate ?? 18,
            currency: data.currency ?? "INR",
            enableDiscount: data.enableDiscount ?? true,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load billing settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${apiUrl}/settings/billing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("Billing settings updated successfully", "success");
      } else {
        showToast("Failed to update billing settings", "error");
      }
    } catch (error) {
      showToast("An error occurred while saving", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
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
          <Link href="/settings" className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Billing & Taxes</h1>
            <p className="text-sm text-slate-500">Configure invoice formats, default taxes, and discounts</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
          {/* Invoice Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Invoice Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText size={14} className="inline mr-1 text-orange-500" /> Invoice Prefix
                </label>
                <input
                  type="text"
                  required
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({...formData, invoicePrefix: e.target.value.toUpperCase()})}
                  placeholder="INV-"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Percent size={14} className="inline mr-1 text-orange-500" /> Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.defaultTaxRate}
                  onChange={(e) => setFormData({...formData, defaultTaxRate: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Currency & Discounts Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Currency & Discounts</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <IndianRupee size={14} className="inline mr-1 text-orange-500" /> Default Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Enable Discount Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-700">Enable Global Discounts</p>
                  <p className="text-sm text-slate-500">Allow discounts on all invoices</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableDiscount}
                    onChange={(e) => setFormData({...formData, enableDiscount: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/settings"
              className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 px-6 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Billing Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
