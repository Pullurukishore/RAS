"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, Moon, Sun, Type, Save, Loader2, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface AppearanceSettings {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  sidebarCollapsed: boolean;
}

export default function AppearanceSettingsPage() {
  const [formData, setFormData] = useState<AppearanceSettings>({
    theme: "light",
    fontSize: "medium",
    sidebarCollapsed: false,
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
      const res = await fetch(`${apiUrl}/settings/appearance`);
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setFormData({
            theme: data.theme ?? "light",
            fontSize: data.fontSize ?? "medium",
            sidebarCollapsed: data.sidebarCollapsed ?? false,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load appearance settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${apiUrl}/settings/appearance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("Appearance settings saved", "success");
      } else {
        showToast("Failed to save appearance settings", "error");
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
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun, color: "text-amber-500", bg: "bg-amber-100" },
    { value: "dark", label: "Dark", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-100" },
    { value: "auto", label: "Auto", icon: Palette, color: "text-cyan-500", bg: "bg-cyan-100" },
  ];

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
            <h1 className="text-2xl font-bold text-slate-900">Appearance</h1>
            <p className="text-sm text-slate-500">Theme, branding, and visual settings</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
          {/* Theme Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Theme</h2>
            
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: theme.value as AppearanceSettings["theme"] })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.theme === theme.value
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${theme.bg} ${theme.color} flex items-center justify-center mx-auto mb-2`}>
                    <theme.icon size={20} />
                  </div>
                  <span className="font-medium text-slate-700">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Display Options</h2>
            
            <div className="space-y-5">
              {/* Font Size */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                  <Type size={14} className="text-cyan-500" /> Font Size
                </label>
                <div className="flex gap-2">
                  {["small", "medium", "large"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, fontSize: size as AppearanceSettings["fontSize"] })}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-medium capitalize transition-all ${
                        formData.fontSize === size
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Collapsed Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-medium text-slate-700">Collapsed Sidebar</p>
                  <p className="text-sm text-slate-500">Keep sidebar minimized by default</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sidebarCollapsed}
                    onChange={(e) => setFormData({ ...formData, sidebarCollapsed: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
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
              {saving ? "Saving..." : "Save Appearance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
