"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft,
  Edit2,
  Trash2,
  Phone,
  Briefcase,
  Award,
  Star,
  CalendarDays,
  User,
  Loader2,
  AlertCircle,
  Check,
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
  createdAt?: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

// Generate avatar initials from name
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Generate consistent avatar color from name
const getAvatarColor = (name: string) => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-indigo-500 to-violet-600'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Active': return 'bg-emerald-500';
    case 'On Leave': return 'bg-amber-500';
    case 'Inactive': return 'bg-slate-400';
    default: return 'bg-slate-500';
  }
};

function StaffViewContent() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const showToast = (message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    if (staffId) {
      fetch(`${apiUrl}/staff/${staffId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setStaff(data);
          else showToast("Staff not found", "error");
        })
        .catch(() => showToast("Server error", "error"))
        .finally(() => setIsLoading(false));
    }
  }, [staffId, apiUrl]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${apiUrl}/staff/${staffId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Staff deleted successfully", "success");
        setTimeout(() => router.push('/staff'), 600);
      } else {
        showToast("Failed to delete staff", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Staff Not Found</h1>
          <p className="text-slate-500 mb-6">The staff member you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/staff')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Staff List
          </button>
        </div>
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

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="text-rose-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete Staff?</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to remove <strong>{staff.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/staff')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Staff Profile</h1>
            <p className="text-sm text-slate-500">View and manage staff details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/staff/form?id=${staff.id}`)}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <div className="w-full">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            {/* Header with gradient */}
            <div className="relative h-40 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
              
              <div className="absolute -bottom-16 left-8">
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${getAvatarColor(staff.name)} flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-white`}>
                  {getInitials(staff.name)}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{staff.name}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-xl text-sm font-semibold border border-violet-100">
                      {staff.role}
                    </span>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      staff.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                      staff.status === 'On Leave' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                      'bg-slate-50 border-slate-100 text-slate-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(staff.status)}`} />
                      {staff.status}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                  <Star size={24} className="text-amber-500 fill-amber-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{staff.rating.toFixed(1)}<span className="text-sm font-medium text-slate-400">/5</span></p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience</p>
                    <p className="text-sm font-semibold text-slate-900">{staff.experience || 'Entry Level'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialization</p>
                    <p className="text-sm font-semibold text-slate-900">{staff.specialization || 'Generalist'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-semibold text-slate-900">{staff.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push(`/staff/form?id=${staff.id}`)}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
              <button
                onClick={() => router.push('/billing/new')}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Create Invoice
              </button>
              <button
                onClick={() => router.push('/appointments/new')}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    }>
      <StaffViewContent />
    </Suspense>
  );
}
