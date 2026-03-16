"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Clock, Save, Loader2, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface NotificationSettings {
  threshold: number;
}

export default function NotificationSettingsPage() {
  const [formData, setFormData] = useState<NotificationSettings>({
    threshold: 35,
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${apiUrl}/settings/customer_retention`);
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setFormData({
            threshold: data.threshold ?? 35,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${apiUrl}/settings/customer_retention`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("Settings updated successfully", "success");
      } else {
        showToast("Failed to update settings", "error");
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
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
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
            <h1 className="text-2xl font-bold text-slate-900">Notifications & Alerts</h1>
            <p className="text-sm text-slate-500">Configure customer inactivity alerts and thresholds</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Customer Retention Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock size={14} className="inline mr-1 text-rose-500" /> Inactivity Alert Threshold (Days)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formData.threshold}
                    onChange={(e) => setFormData({...formData, threshold: Number(e.target.value)})}
                    className="w-32 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                  <p className="text-sm text-slate-500">
                    Customers who haven't visited in more than {formData.threshold} days will trigger an alert on the dashboard.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 items-start">
                <Bell className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-rose-900">Proactive Engagement</p>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Setting an appropriate threshold helps your team follow up with customers before they churn. 35 days is the industry standard for salons.
                  </p>
                </div>
              </div>
            </div>
          </div>

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
              {saving ? "Saving..." : "Save Notification Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
