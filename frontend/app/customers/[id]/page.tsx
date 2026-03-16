"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Phone,
    Calendar,
    Edit2,
    Trash2,
    Receipt,
    Scissors,
    ShoppingBag,
    Sparkles,
    Crown,
    TrendingUp,
    CalendarCheck,
    Clock,
    User,
    CreditCard,
    Package,
    Download,
    Loader2,
    Home,
    ChevronRight,
    Users
} from "lucide-react";

interface InvoiceItem {
    id: string;
    service?: { description: string; code?: string };
    product?: { description: string; code?: string };
    package?: { description: string; code?: string };
    membershipPlan?: { name: string; code?: string };
    staff?: { id: string; name: string };
    price: number;
    tax: number;
    total: number;
}

interface Payment {
    id: string;
    method: string;
    amount: number;
}

interface Invoice {
    id?: string;
    invoiceId: string;
    date: string;
    totalGross: number;
    totalTax: number;
    totalDiscount: number;
    totalNet: number;
    items: InvoiceItem[];
    payments: Payment[];
}

interface Customer {
    id: string;
    name: string;
    phone: string | null;
    createdAt: string;
    isMember?: boolean;
    membershipId?: string | null;
    membershipTier?: string | null;
    membershipStart?: string | null;
    membershipExpiry?: string | null;
    history?: Invoice[];
}

interface CustomerAnalytics {
    totalSpent: number;
    totalVisits: number;
    averageOrderValue: number;
    favoriteService: string;
    lastVisitDate: string | null;
    paymentMethodsUsed: Record<string, number>;
    monthlySpending: Record<string, number>;
}

// Helper functions
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
    const colors = [
        'from-violet-500 to-purple-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-teal-600',
        'from-cyan-500 to-blue-600',
        'from-indigo-500 to-violet-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: date.toLocaleString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        fullDate: date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        weekday: date.toLocaleString('en-US', { weekday: 'short' })
    };
};

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
};

// Calculate customer analytics
const calculateAnalytics = (customer: Customer): CustomerAnalytics => {
    const history = customer.history || [];
    
    if (history.length === 0) {
        return {
            totalSpent: 0,
            totalVisits: 0,
            averageOrderValue: 0,
            favoriteService: '-',
            lastVisitDate: null,
            paymentMethodsUsed: {},
            monthlySpending: {}
        };
    }

    const totalSpent = history.reduce((sum, inv) => sum + inv.totalNet, 0);
    const serviceCount: Record<string, number> = {};
    const paymentMethodsUsed: Record<string, number> = {};
    const monthlySpending: Record<string, number> = {};

    history.forEach(invoice => {
        invoice.items.forEach(item => {
            const serviceName = item.service?.description || item.product?.description || 'Other';
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });

        invoice.payments.forEach(payment => {
            paymentMethodsUsed[payment.method] = (paymentMethodsUsed[payment.method] || 0) + payment.amount;
        });

        const date = new Date(invoice.date);
        const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + invoice.totalNet;
    });

    const favoriteService = Object.entries(serviceCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '-';

    const lastVisitDate = history[0]?.date || null;

    return {
        totalSpent,
        totalVisits: history.length,
        averageOrderValue: totalSpent / history.length,
        favoriteService,
        lastVisitDate,
        paymentMethodsUsed,
        monthlySpending
    };
};

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const fetchCustomer = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/customers/${customerId}`);
            if (res.ok) {
                const data = await res.json();
                setCustomer(data);
            } else {
                router.push('/customers');
            }
        } catch (err) {
            console.error("Failed to fetch customer:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this customer? This cannot be undone.")) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch(`${apiUrl}/customers/${customerId}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/customers');
            }
        } catch (err) {
            console.error("Failed to delete customer:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
        router.push(`/customers?edit=${customerId}`);
    };

    const analytics = useMemo(() => {
        if (!customer) return null;
        return calculateAnalytics(customer);
    }, [customer]);

    const isVip = customer?.isMember || (analytics && analytics.totalSpent > 10000);
    const isRegular = analytics && analytics.totalVisits >= 5;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center animate-pulse">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 rounded-3xl bg-rose-500/30 blur-xl animate-pulse" />
                    </div>
                    <p className="mt-6 text-slate-400 font-medium">Loading customer...</p>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Not Found</h2>
                    <p className="text-slate-500 mb-6">The customer you&apos;re looking for doesn&apos;t exist.</p>
                    <button 
                        onClick={() => router.push('/customers')}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={18} />
                        Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => router.push('/customers')}
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
                                        onClick={() => router.push('/customers')}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Customers
                                    </button>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="text-slate-900 font-medium truncate max-w-[150px]">{customer.name}</span>
                                </nav>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleEdit}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all disabled:opacity-50"
                                >
                                    <Edit2 size={18} />
                                    Edit
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-medium transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Profile Header Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-lg shadow-slate-200/40 mb-8">
                        <div className="flex items-start gap-6">
                            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${getAvatarColor(customer.name)} flex items-center justify-center text-white font-bold text-3xl shadow-xl shrink-0 relative`}>
                                {getInitials(customer.name)}
                                {isVip && (
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Crown size={16} className="text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{customer.name}</h1>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {customer.phone && (
                                                <a 
                                                    href={`tel:${customer.phone}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium border border-rose-100 hover:bg-rose-100 transition-colors"
                                                >
                                                    <Phone size={14} />
                                                    {customer.phone}
                                                </a>
                                            )}
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200">
                                                <Calendar size={14} />
                                                Customer since {formatDate(customer.createdAt).fullDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {customer.isMember && (
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-lg text-sm font-semibold border border-amber-200 flex items-center gap-1.5">
                                            <Crown size={14} />
                                            {customer.membershipTier} Member
                                        </span>
                                    )}
                                    {isRegular && (
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200 flex items-center gap-1.5">
                                            <User size={14} />
                                            Regular Customer
                                        </span>
                                    )}
                                    {analytics && (
                                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                                            {analytics.totalVisits} Visit{analytics.totalVisits !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {analytics?.lastVisitDate && (
                                        <span className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium border border-rose-100">
                                            Last visit {getRelativeTime(analytics.lastVisitDate)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Membership Card (if member) */}
                    {customer.isMember && (
                        <div className="relative group mb-8 overflow-hidden rounded-[2.5rem]">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                            
                            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
                                <div className="relative w-full max-w-[400px] aspect-[1.6/1] rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02] hover:rotate-1">
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                                    <div className="relative flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">Naturals Lounge</p>
                                            <h2 className="text-xl font-bold text-white tracking-tight">Privilege Member</h2>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                            <Crown size={24} className="text-white" />
                                        </div>
                                    </div>

                                    <div className="relative space-y-4">
                                        <p className="text-2xl font-mono text-white tracking-[0.15em] drop-shadow-md">
                                            {customer.membershipId || 'NAT-M-0000'}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Member Name</p>
                                                <p className="text-sm font-semibold text-white truncate max-w-[180px]">{customer.name.toUpperCase()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Expires On</p>
                                                <p className="text-sm font-semibold text-white">
                                                    {customer.membershipExpiry ? new Date(customer.membershipExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'NEVER'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 text-center md:text-left">
                                    <div className="space-y-2">
                                        <span className="px-3 py-1 bg-amber-400 font-bold text-slate-900 text-[10px] uppercase tracking-widest rounded-full">
                                            {customer.membershipTier} Member
                                        </span>
                                        <h3 className="text-3xl font-bold text-white">Exclusive Rewards</h3>
                                        <p className="text-slate-400 text-sm max-w-sm">
                                            Enjoy priority booking, special member pricing, and personalized luxury treatments.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Member Since</p>
                                            <p className="text-white font-semibold">
                                                {customer.membershipStart ? new Date(customer.membershipStart).getFullYear() : '2024'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <p className="text-white font-semibold italic">Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Grid */}
                    {analytics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-500">
                                        <Receipt size={24} />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-rose-600 uppercase tracking-wider mb-1">Total Spent</p>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.totalSpent)}</p>
                            </div>

                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-violet-500">
                                        <TrendingUp size={24} />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider mb-1">Avg. Order Value</p>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.averageOrderValue)}</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-500">
                                        <CalendarCheck size={24} />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Total Visits</p>
                                <p className="text-2xl font-bold text-slate-900">{analytics.totalVisits}</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-amber-500">
                                        <Sparkles size={24} />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Favorite Service</p>
                                <p className="text-lg font-bold text-slate-900 truncate" title={analytics.favoriteService}>
                                    {analytics.favoriteService}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Payment Methods */}
                    {analytics && Object.keys(analytics.paymentMethodsUsed).length > 0 && (
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-sm mb-8">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <CreditCard size={18} className="text-slate-400" />
                                Payment Methods Used
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(analytics.paymentMethodsUsed)
                                    .sort(([,a], [,b]) => b - a)
                                    .map(([method, amount]) => (
                                        <div key={method} className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-sm font-semibold text-slate-700">{method}</span>
                                            <span className="text-sm text-slate-400 ml-2">{formatCurrency(amount)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Visit History */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Clock size={20} className="text-slate-400" />
                                Visit History
                            </h3>
                            <span className="text-sm text-slate-500">
                                {customer.history?.length || 0} visits
                            </span>
                        </div>

                        <div className="space-y-4">
                            {!customer.history || customer.history.length === 0 ? (
                                <div className="text-center py-12">
                                    <CalendarCheck size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h4 className="font-semibold text-slate-800 mb-1">No Visits Yet</h4>
                                    <p className="text-sm text-slate-500">This customer hasn&apos;t made any purchases yet.</p>
                                </div>
                            ) : (
                                customer.history.map((invoice) => {
                                    const date = formatDate(invoice.date);
                                    const serviceItems = invoice.items.filter(i => i.service);
                                    const productItems = invoice.items.filter(i => i.product);
                                    const packageItems = invoice.items.filter(i => i.package);
                                    const membershipPlanItems = invoice.items.filter(i => i.membershipPlan);

                                    return (
                                        <div 
                                            key={invoice.invoiceId} 
                                            className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-rose-200 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-white flex flex-col items-center justify-center text-slate-700 shadow-sm">
                                                        <span className="text-xl font-bold leading-none">{date.day}</span>
                                                        <span className="text-xs font-semibold uppercase">{date.month}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Receipt size={14} className="text-slate-400" />
                                                            <span className="font-semibold text-slate-900">{invoice.invoiceId}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500">{date.weekday}, {date.time}</p>
                                                        <p className="text-xs text-slate-400">{getRelativeTime(invoice.date)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(invoice.totalNet)}</p>
                                                    <div className="flex gap-1 mt-1 justify-end flex-wrap">
                                                        {invoice.payments.map((p, i) => (
                                                            <span key={i} className="text-xs px-2 py-0.5 bg-white rounded-full text-slate-600 font-medium border border-slate-200">
                                                                {p.method}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 bg-white rounded-xl p-4">
                                                {serviceItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                                                                <Scissors size={14} className="text-rose-500" />
                                                            </div>
                                                            <span className="font-medium text-slate-700">{item.service?.description}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                                                            {item.staff && (
                                                                <p className="text-xs text-slate-400">by {item.staff.name.split(' ')[0]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {productItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                                                                <ShoppingBag size={14} className="text-amber-500" />
                                                            </div>
                                                            <span className="font-medium text-slate-700">{item.product?.description}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                                                            {item.staff && (
                                                                <p className="text-xs text-slate-400">by {item.staff.name.split(' ')[0]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {packageItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                                                                <Package size={14} className="text-violet-500" />
                                                            </div>
                                                            <span className="font-medium text-slate-700">{item.package?.description}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                                                            {item.staff && (
                                                                <p className="text-xs text-slate-400">by {item.staff.name.split(' ')[0]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {membershipPlanItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                                                                <Crown size={14} className="text-amber-500" />
                                                            </div>
                                                            <span className="font-medium text-slate-700">{item.membershipPlan?.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                                                            {item.staff && (
                                                                <p className="text-xs text-slate-400">by {item.staff.name.split(' ')[0]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span>Subtotal: {formatCurrency(invoice.totalGross)}</span>
                                                    {invoice.totalTax && invoice.totalTax > 0 && <span>Tax: {formatCurrency(invoice.totalTax)}</span>}
                                                    {invoice.totalDiscount > 0 && <span className="text-rose-500">Discount: -{formatCurrency(invoice.totalDiscount)}</span>}
                                                </div>
                                                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors">
                                                    <Download size={16} />
                                                    Download Invoice
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
