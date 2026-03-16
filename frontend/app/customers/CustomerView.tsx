"use client";

import { useEffect, useState, useMemo } from "react";
import {
    X,
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
    ArrowUpRight,
    ArrowDownRight,
    Package,
    ChevronLeft,
    Download
} from "lucide-react";

interface InvoiceItem {
    id: string;
    service?: { description: string; code?: string };
    product?: { description: string; code?: string };
    package?: { description: string; code?: string };
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
        // Count services
        invoice.items.forEach(item => {
            const serviceName = item.service?.description || item.product?.description || 'Other';
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });

        // Count payment methods
        invoice.payments.forEach(payment => {
            paymentMethodsUsed[payment.method] = (paymentMethodsUsed[payment.method] || 0) + payment.amount;
        });

        // Monthly spending
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

interface CustomerViewProps {
    customer: Customer;
    onClose: () => void;
    onEdit: (customer: Customer) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
}

export default function CustomerView({ customer, onClose, onEdit, onDelete, isLoading = false }: CustomerViewProps) {
    const analytics = useMemo(() => calculateAnalytics(customer), [customer]);
    const isVip = analytics.totalSpent > 10000;
    const isRegular = analytics.totalVisits >= 5;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose}
            />
            
            {/* Drawer */}
            <div className="relative w-full md:w-[600px] h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col overflow-hidden">
                {/* Header with gradient */}
                <div className="relative h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900 overflow-hidden shrink-0">
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    
                    {/* Top actions */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
                        <button 
                            onClick={onClose}
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onEdit(customer)}
                                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-md border border-white/10"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                onClick={() => onDelete(customer.id)}
                                className="p-2.5 bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-300 rounded-xl transition-all backdrop-blur-md border border-white/10"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-md border border-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Large avatar */}
                    <div className="absolute -bottom-10 left-8">
                        <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${getAvatarColor(customer.name)} flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-white relative`}>
                            {getInitials(customer.name)}
                            {isVip && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Crown size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer name & quick info */}
                    <div className="absolute bottom-6 left-40 right-8">
                        <h2 className="text-3xl font-bold text-white mb-1">{customer.name}</h2>
                        <div className="flex items-center gap-3 text-white/70">
                            {customer.phone && (
                                <span className="flex items-center gap-1.5 text-sm">
                                    <Phone size={14} />
                                    {customer.phone}
                                </span>
                            )}
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span className="flex items-center gap-1.5 text-sm">
                                <Calendar size={14} />
                                Since {formatDate(customer.createdAt).fullDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pt-16 px-8 pb-8">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {isVip && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-lg text-sm font-semibold border border-amber-200 flex items-center gap-1.5">
                                <Crown size={14} />
                                VIP Client
                            </span>
                        )}
                        {isRegular && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200 flex items-center gap-1.5">
                                <User size={14} />
                                Regular
                            </span>
                        )}
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                            {analytics.totalVisits} Visit{analytics.totalVisits !== 1 ? 's' : ''}
                        </span>
                        {analytics.lastVisitDate && (
                            <span className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium border border-rose-100">
                                Last visit {getRelativeTime(analytics.lastVisitDate)}
                            </span>
                        )}
                    </div>

                    {/* Analytics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Total Spent */}
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-500">
                                    <Receipt size={20} />
                                </div>
                                {analytics.totalSpent > 0 && (
                                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                        <ArrowUpRight size={14} />
                                        <span>Active</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs font-medium text-rose-600 uppercase tracking-wider mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.totalSpent)}</p>
                        </div>

                        {/* Average Order */}
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-violet-500">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-violet-600 uppercase tracking-wider mb-1">Avg. Order Value</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.averageOrderValue)}</p>
                        </div>

                        {/* Total Visits */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-500">
                                    <CalendarCheck size={20} />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Total Visits</p>
                            <p className="text-2xl font-bold text-slate-900">{analytics.totalVisits}</p>
                        </div>

                        {/* Favorite Service */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-amber-500">
                                    <Sparkles size={20} />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Favorite Service</p>
                            <p className="text-lg font-bold text-slate-900 truncate" title={analytics.favoriteService}>
                                {analytics.favoriteService}
                            </p>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    {Object.keys(analytics.paymentMethodsUsed).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CreditCard size={14} /> Payment Methods Used
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(analytics.paymentMethodsUsed)
                                    .sort(([,a], [,b]) => b - a)
                                    .map(([method, amount]) => (
                                        <div key={method} className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-sm font-semibold text-slate-700">{method}</span>
                                            <span className="text-xs text-slate-400 ml-2">{formatCurrency(amount)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Visit History */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Clock size={14} /> Visit History
                            </h3>
                            {isLoading && (
                                <span className="text-xs font-medium text-rose-500 animate-pulse">Loading...</span>
                            )}
                        </div>

                        <div className="space-y-4">
                            {!isLoading && (!customer.history || customer.history.length === 0) && (
                                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                                    <CalendarCheck size={48} className="mx-auto text-slate-300 mb-3" />
                                    <h4 className="font-semibold text-slate-800 mb-1">No Visits Yet</h4>
                                    <p className="text-sm text-slate-500">This customer hasn&apos;t made any purchases yet.</p>
                                </div>
                            )}

                            {!isLoading && customer.history?.map((invoice) => {
                                const date = formatDate(invoice.date);
                                const serviceItems = invoice.items.filter(i => i.service);
                                const productItems = invoice.items.filter(i => i.product);
                                const packageItems = invoice.items.filter(i => i.package);

                                return (
                                    <div 
                                        key={invoice.invoiceId} 
                                        className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/30 transition-all duration-300"
                                    >
                                        {/* Invoice Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                {/* Date Box */}
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-700">
                                                    <span className="text-lg font-bold leading-none">{date.day}</span>
                                                    <span className="text-[10px] font-semibold uppercase">{date.month}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Receipt size={14} className="text-slate-400" />
                                                        <span className="text-sm font-semibold text-slate-900">{invoice.invoiceId}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">{date.weekday}, {date.time}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{getRelativeTime(invoice.date)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(invoice.totalNet)}</p>
                                                <div className="flex gap-1 mt-1 justify-end flex-wrap">
                                                    {invoice.payments.map((p, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">
                                                            {p.method}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Summary */}
                                        <div className="space-y-2 bg-slate-50 rounded-xl p-4">
                                            {/* Services */}
                                            {serviceItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
                                                            <Scissors size={12} className="text-rose-500" />
                                                        </div>
                                                        <span className="font-medium text-slate-700">{item.service?.description}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                                                        {item.staff && (
                                                            <p className="text-[10px] text-slate-400">by {item.staff.name.split(' ')[0]}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Products */}
                                            {productItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                                                            <ShoppingBag size={12} className="text-amber-500" />
                                                        </div>
                                                        <span className="font-medium text-slate-700">{item.product?.description}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                                                        {item.staff && (
                                                            <p className="text-[10px] text-text-slate-400">by {item.staff.name.split(' ')[0]}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Packages */}
                                            {packageItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                                                            <Package size={12} className="text-violet-500" />
                                                        </div>
                                                        <span className="font-medium text-slate-700">{item.package?.description}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                                                        {item.staff && (
                                                            <p className="text-[10px] text-slate-400">by {item.staff.name.split(' ')[0]}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Invoice Footer */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                                <span>Subtotal: {formatCurrency(invoice.totalGross)}</span>
                                                {invoice.totalTax > 0 && <span>Tax: {formatCurrency(invoice.totalTax)}</span>}
                                                {invoice.totalDiscount > 0 && <span className="text-rose-500">Discount: -{formatCurrency(invoice.totalDiscount)}</span>}
                                            </div>
                                            <button className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors">
                                                <Download size={14} />
                                                Invoice
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
