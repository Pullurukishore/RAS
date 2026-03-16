"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Lock, Eye, EyeOff, Save, Loader2, ArrowLeft, Check, AlertCircle, Key, Users } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  sessionTimeout: number;
}

export default function SecuritySettingsPage() {
  const [formData, setFormData] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    sessionTimeout: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      const res = await fetch(`${apiUrl}/settings/security`);
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setFormData(prev => ({
            ...prev,
            sessionTimeout: data.sessionTimeout ?? 30,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load security settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${apiUrl}/settings/security`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionTimeout: formData.sessionTimeout,
          ...(formData.newPassword && { password: formData.newPassword }),
        }),
      });

      if (res.ok) {
        showToast("Security settings saved", "success");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        showToast("Failed to save security settings", "error");
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
            <h1 className="text-2xl font-bold text-slate-900">Security Settings</h1>
            <p className="text-sm text-slate-500">Manage passwords, sessions, and roles</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 w-full">
          {/* Password Change Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                <Key size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Change Password</h2>
                <p className="text-sm text-slate-500">Update your admin password</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-sm text-rose-500 mt-2">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {/* Session Security Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Session Security</h2>
                <p className="text-sm text-slate-500">Configure session settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                <select
                  value={formData.sessionTimeout}
                  onChange={(e) => setFormData({...formData, sessionTimeout: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={1440}>1 day</option>
                  <option value={10080}>7 days</option>
                  <option value={43200}>30 days</option>
                  <option value={525600}>1 year (365 days)</option>
                </select>
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
              {saving ? "Saving..." : "Save Security Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
