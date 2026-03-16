"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft,
  Check,
  AlertCircle,
  Save,
  RotateCcw,
  User,
  Phone,
  Star,
  Briefcase,
  Award,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  rating: number;
  status: string;
  experience: string | null;
  specialization: string | null;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

const roles = [
  "Senior Stylist",
  "Stylist", 
  "Colorist",
  "Makeup Artist",
  "Nail Technician",
  "Manager",
  "Assistant"
];

const statuses = ["Active", "On Leave", "Inactive"];

function StaffFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const idParam = searchParams.get('id');
  const isEditing = !!idParam;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [formData, setFormData] = useState<Partial<Staff>>({
    name: "",
    role: "Stylist",
    phone: "",
    rating: 5.0,
    status: "Active",
    experience: "",
    specialization: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const showToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    if (isEditing && idParam) {
      fetch(`${apiUrl}/staff/${idParam}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setFormData(data);
          else showToast("Failed to load staff", "error");
        })
        .catch(() => showToast("Server error", "error"))
        .finally(() => setIsLoading(false));
    }
  }, [idParam, apiUrl, isEditing, showToast]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name?.trim()) errs.name = "Name is required";
    if (!formData.role?.trim()) errs.role = "Role is required";
    if (formData.rating === undefined || formData.rating < 1 || formData.rating > 5) {
      errs.rating = "Rating must be 1-5";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSaving(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiUrl}/staff/${idParam}` : `${apiUrl}/staff`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showToast(isEditing ? "Updated successfully" : "Staff added successfully", "success");
        setTimeout(() => router.push('/staff'), 600);
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
      name: "",
      role: "Stylist",
      phone: "",
      rating: 5.0,
      status: "Active",
      experience: "",
      specialization: ""
    });
    setErrors({});
  };

  const updateField = (field: keyof Staff, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

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
              {isEditing ? 'Edit Staff' : 'Add Staff Member'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update staff information' : 'Add a new team member'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all ${
                      errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all appearance-none"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 ..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rating <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Star size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => updateField('rating', Number(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all ${
                      errors.rating ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.rating && <p className="mt-1 text-sm text-rose-500">{errors.rating}</p>}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Professional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Experience</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.experience || ''}
                    onChange={(e) => updateField('experience', e.target.value)}
                    placeholder="e.g. 5 Years"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="flex gap-2">
                  {statuses.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateField('status', s)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        formData.status === s
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Specializations</label>
                <div className="relative">
                  <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.specialization || ''}
                    onChange={(e) => updateField('specialization', e.target.value)}
                    placeholder="e.g. Balayage, Bridal Makeup, Skin Therapy..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
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
              onClick={() => router.push('/staff')}
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
                  {isEditing ? 'Update Staff' : 'Save Staff'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    }>
      <StaffFormContent />
    </Suspense>
  );
}
