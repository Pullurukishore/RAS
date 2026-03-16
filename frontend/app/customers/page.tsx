"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { 
    Users, 
    Search, 
    UserPlus, 
    Phone, 
    Edit2, 
    Trash2, 
    Calendar, 
    Crown,
    TrendingUp,
    Heart,
    ArrowRight,
    Eye,
    MoreVertical
} from "lucide-react";

interface Customer {
    id: string;
    name: string;
    phone: string | null;
    createdAt: string;
    isMember?: boolean;
    membershipId?: string | null;
    membershipTier?: string | null;
    membershipExpiry?: string | null;
}

// Generate avatar initials from name
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Generate consistent avatar color from name
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

// Format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

// Format date nicely
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: date.toLocaleString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        time: date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/customers`);
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewProfile = (customer: Customer) => {
        router.push(`/customers/${customer.id}`);
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if(!confirm("Are you sure you want to completely delete this customer and their history? This cannot be undone.")) return;
        try {
            const res = await fetch(`${apiUrl}/customers/${id}`, { method: 'DELETE' });
            if(res.ok) {
                fetchCustomers();
            }
        } catch(err) {
            console.error(err);
        }
    };

    const filteredCustomers = useMemo(() => {
        if (!search) return customers;
        return customers.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase()) || 
            (c.phone && c.phone.includes(search))
        );
    }, [customers, search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
            {/* Subtle background pattern */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-10 space-y-8">
                
                {/* Elegant Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-rose-600 uppercase tracking-[0.2em]">Clientele</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                            Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Directory</span>
                        </h1>
                        <p className="text-slate-500 text-sm max-w-md">
                            Manage your valued customers with ease. Track their visits, membership status, and registration details.
                        </p>
                    </div>
                    <button 
                        onClick={() => router.push('/customers/new')}
                        className="group relative overflow-hidden bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-slate-900/25 transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <UserPlus size={18} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative z-10">Register Client</span>
                    </button>
                </div>

                {/* Premium Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-rose-200/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Clients</p>
                                <p className="text-3xl font-bold text-slate-900">{customers.length} <span className="text-lg font-medium text-slate-400">Members</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">This Month</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {customers.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length}
                                    <span className="text-lg font-medium text-slate-400"> New</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Crown size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Client Status</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {customers.length > 0 ? 'Active' : 'Empty'}
                                    <span className="text-lg font-medium text-slate-400"> Directory</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by customer name or phone number..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                    />
                </div>

                {/* Premium Customer View */}
                <div className="min-h-[50vh]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center animate-pulse">
                                    <Users className="w-8 h-8 text-white animate-spin" />
                                </div>
                                <div className="absolute inset-0 w-16 h-16 rounded-3xl bg-rose-500/30 blur-xl animate-pulse" />
                            </div>
                            <p className="mt-6 text-slate-400 font-medium">Loading customers...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="relative bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-[2.5rem] py-24 flex flex-col items-center text-center px-8 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/50" />
                            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-inner">
                                <Users size={40} className="text-slate-400" />
                            </div>
                            <h3 className="relative text-2xl font-bold text-slate-900 mb-2">No Customers Found</h3>
                            <p className="relative text-slate-500 max-w-sm mb-8">Your directory is empty or no matches found for your search.</p>
                            <button 
                                onClick={() => router.push('/customers/new')}
                                className="relative px-6 py-3 bg-slate-900 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-slate-900/25 transition-all"
                            >
                                Register First Client
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                            <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                                            <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Membership Status</th>
                                            <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registered On</th>
                                            <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredCustomers.map((customer) => (
                                            <tr 
                                                key={customer.id}
                                                className="group hover:bg-slate-50/50 transition-all duration-300 cursor-default"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(customer.name)} flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                                            {getInitials(customer.name)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{customer.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Phone size={12} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                                                            <span className="text-sm font-bold">{customer.phone || 'No Phone Number'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    {customer.isMember ? (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                                                            <Crown size={14} fill="currentColor" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{customer.membershipTier || 'Standard'} Member</span>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                                                            <Users size={14} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Regular Client</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <span className="text-xs font-semibold">
                                                            {new Date(customer.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleViewProfile(customer)}
                                                            className="p-2.5 rounded-xl bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm border border-slate-100 group-hover:border-rose-200"
                                                            title="View Profile"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/customers/${customer.id}/edit`);
                                                            }}
                                                            className="p-2.5 rounded-xl bg-white text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all shadow-sm border border-slate-100 group-hover:border-amber-200"
                                                            title="Edit Client"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleDelete(customer.id, e)}
                                                            className="p-2.5 rounded-xl bg-white text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-all shadow-sm border border-slate-100 group-hover:border-rose-300"
                                                            title="Delete Client"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
