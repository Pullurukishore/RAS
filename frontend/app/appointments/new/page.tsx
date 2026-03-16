"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Scissors,
    Phone,
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Home,
    RefreshCw,
    CalendarCheck
} from "lucide-react";

interface Staff {
    id: string;
    name: string;
}

interface Service {
    id: string;
    description: string;
    price: number;
}

export default function NewAppointmentPage() {
    const router = useRouter();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [servicesList, setServicesList] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        staffId: "",
        serviceId: "",
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
        status: "Scheduled",
        notes: ""
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [staffRes, servicesRes] = await Promise.all([
                fetch(`${apiUrl}/staff`),
                fetch(`${apiUrl}/menu?type=service`)
            ]);
            
            if (staffRes.ok) {
                const staff = await staffRes.json();
                setStaffList(staff);
            }
            if (servicesRes.ok) {
                const services = await servicesRes.json();
                setServicesList(services);
                if (services.length > 0) {
                    setFormData(prev => ({ ...prev, serviceId: services[0].id }));
                }
            }
        } catch (err) {
            console.error("Failed to fetch dependencies", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch(`${apiUrl}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/appointments');
            } else {
                alert("Failed to save appointment");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center animate-pulse">
                            <RefreshCw className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 rounded-3xl bg-cyan-500/30 blur-xl animate-pulse" />
                    </div>
                    <p className="mt-6 text-slate-400 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => router.push('/appointments')}
                                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                    <span className="font-medium">Back</span>
                                </button>
                                <div className="h-6 w-px bg-slate-200" />
                                <nav className="flex items-center gap-2 text-sm">
                                    <button 
                                        onClick={() => router.push('/')}
                                        className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <Home size={14} />
                                        Home
                                    </button>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <button 
                                        onClick={() => router.push('/appointments')}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Appointments
                                    </button>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="text-slate-900 font-medium">New</span>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.2em]">New Booking</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                            Schedule <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600">Appointment</span>
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Book a new appointment for your customer. Fill in the details below.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-white/60 overflow-hidden">
                        {/* Form Header */}
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 px-8 py-8 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
                            
                            <div className="relative flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                                    <CalendarCheck size={28} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">New Appointment</h2>
                                    <p className="text-slate-400 text-sm mt-0.5">Schedule a new booking</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-8 lg:p-12">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Top Row - Customer Info & Date/Time */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Customer Info Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <User size={16} className="text-cyan-500" />
                                            Customer Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Name *</label>
                                                <input 
                                                    required
                                                    value={formData.customerName}
                                                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-400"
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input 
                                                        type="tel"
                                                        value={formData.customerPhone}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                            setFormData({...formData, customerPhone: val});
                                                        }}
                                                        maxLength={10}
                                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-400"
                                                        placeholder="10 digit number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date & Time Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <Clock size={16} className="text-cyan-500" />
                                            Date & Time
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date *</label>
                                                <input 
                                                    type="date"
                                                    required
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time *</label>
                                                <input 
                                                    type="time"
                                                    required
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Service & Staff Section - Full Width */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                        <Scissors size={16} className="text-cyan-500" />
                                        Service Details
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service *</label>
                                            <select 
                                                required
                                                value={formData.serviceId}
                                                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select a service...</option>
                                                {servicesList.map(s => (
                                                    <option key={s.id} value={s.id}>{s.description} - ₹{s.price}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Stylist</label>
                                            <select 
                                                value={formData.staffId}
                                                onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 appearance-none cursor-pointer"
                                            >
                                                <option value="">Any Available</option>
                                                {staffList.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes (Optional)</label>
                                        <textarea 
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            rows={3}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                                            placeholder="Any special requests or notes..."
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => router.push('/appointments')}
                                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSaving || !formData.customerName || !formData.serviceId}
                                        className="flex-[2] py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-cyan-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={20} />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={20} />
                                                Confirm Booking
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
