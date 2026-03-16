"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
    UserRound, 
    Star, 
    TrendingUp, 
    UserPlus, 
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    Filter,
    Loader2,
    RefreshCw,
    Crown,
    Sparkles,
    ShieldCheck,
    Briefcase,
    Award,
    Eye
} from "lucide-react";

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

export default function StaffPage() {
    const router = useRouter();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/staff`);
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (err) {
            console.error("Failed to fetch staff:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        
        setDeletingId(id);
        try {
            const res = await fetch(`${apiUrl}/staff/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStaff();
            }
        } catch(err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredStaff = useMemo(() => {
        return staffList.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                                (s.role && s.role.toLowerCase().includes(search.toLowerCase())) ||
                                (s.specialization && s.specialization.toLowerCase().includes(search.toLowerCase()));
            const matchesStatus = filterStatus === "All" || s.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [staffList, search, filterStatus]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Active': return 'bg-emerald-500';
            case 'On Leave': return 'bg-amber-500';
            case 'Inactive': return 'bg-slate-400';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
            <div className="relative px-6 lg:px-10 py-10 space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-violet-600 uppercase tracking-[0.2em]">Team Directory</span>
                                <span className="text-[10px] text-slate-400">Manage your salon professionals</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                            Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-600">Management</span>
                        </h1>
                        <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                            Oversee your team of experts, track performance metrics, and maintain exceptional service standards.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => fetchStaff()}
                            className="group p-3.5 bg-white/80 backdrop-blur-xl border border-slate-200/60 text-slate-600 rounded-2xl font-medium hover:bg-white hover:border-violet-300 hover:text-violet-600 transition-all duration-300 shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw size={20} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        </button>
                        <button 
                            onClick={() => router.push('/staff/form')}
                            className="group relative overflow-hidden bg-slate-900 text-white px-6 py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-slate-900/25 transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <UserPlus size={18} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="relative z-10">Add Team Member</span>
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Team Size</p>
                                <p className="text-3xl font-bold text-slate-900">{staffList.length} <span className="text-lg font-medium text-slate-400">Experts</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Now</p>
                                <p className="text-3xl font-bold text-slate-900">{staffList.filter(s => s.status === 'Active').length} <span className="text-lg font-medium text-slate-400">Working</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-rose-200/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Rating</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {staffList.length > 0 ? (staffList.reduce((acc, s) => acc + s.rating, 0) / staffList.length).toFixed(1) : "0.0"}
                                    <span className="text-lg font-medium text-slate-400">/5.0</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center bg-white/60 backdrop-blur-xl rounded-3xl p-2 border border-white/60 shadow-lg shadow-slate-200/30">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name, role or expertise..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 bg-white/80 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl">
                        <Filter size={16} className="ml-3 text-slate-400" />
                        {["All", "Active", "On Leave", "Inactive"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${filterStatus === status ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Staff Grid */}
                <div className="min-h-[50vh]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                            <p className="mt-4 text-slate-500 font-medium">Loading team directory...</p>
                        </div>
                    ) : filteredStaff.length === 0 ? (
                        <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] py-24 flex flex-col items-center text-center px-8 overflow-hidden shadow-xl shadow-slate-200/30">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-purple-50/60 to-fuchsia-50/80" />
                            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-inner">
                                <UserRound size={44} className="text-slate-400" />
                            </div>
                            <h3 className="relative text-2xl font-bold text-slate-900 mb-3">No Members Found</h3>
                            <p className="relative text-slate-500 max-w-sm mb-8 leading-relaxed">We couldn&apos;t find any team members matching your search criteria.</p>
                            <button 
                                onClick={() => {setSearch(""); setFilterStatus("All");}} 
                                className="relative px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-medium text-sm hover:shadow-xl hover:shadow-violet-500/30 transition-all flex items-center gap-2"
                            >
                                <Sparkles size={16} />
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredStaff.map((member, idx) => (
                                <div 
                                    key={member.id}
                                    onClick={() => router.push(`/staff/${member.id}`)}
                                    className="group relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-violet-200/30 hover:border-violet-200/60 transition-all duration-500 cursor-pointer overflow-hidden"
                                    style={{ animationDelay: `${idx * 75}ms` }}
                                >
                                    {/* Status indicator line */}
                                    <div className={`absolute top-0 left-8 right-8 h-1 rounded-b-full ${getStatusColor(member.status)} ${member.status === 'Active' ? 'shadow-[0_0_20px_rgba(16,185,129,0.6)]' : ''}`} />

                                    <div className="flex items-start justify-between mb-5">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:rotate-2 transition-all duration-300`}>
                                            {getInitials(member.name)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-slate-100 shadow-sm">
                                                <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)} ${member.status === 'Active' ? 'animate-pulse' : ''}`} />
                                                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{member.status}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(member.id, e)}
                                                disabled={deletingId === member.id}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                {deletingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-violet-700 transition-colors">{member.name}</h3>
                                    <p className="text-sm font-semibold text-violet-600/90 mb-4">{member.role || 'Professional'}</p>

                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 shadow-sm">
                                            <Star size={14} className="text-amber-500 fill-amber-500" />
                                            <span className="text-sm font-bold text-amber-700">{member.rating ? member.rating.toFixed(1) : "5.0"}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">Rating</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 group-hover:bg-white/90 transition-colors shadow-sm">
                                            <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                                                <Briefcase size={12} />
                                                <span className="text-[10px] font-semibold uppercase tracking-wider">Experience</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{member.experience || 'Entry Level'}</p>
                                        </div>
                                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 group-hover:bg-white/90 transition-colors shadow-sm">
                                            <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                                                <Award size={12} />
                                                <span className="text-[10px] font-semibold uppercase tracking-wider">Specialty</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800 truncate" title={member.specialization || 'Generalist'}>{member.specialization || 'Generalist'}</p>
                                        </div>
                                    </div>

                                    {/* Action buttons on hover */}
                                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/staff/${member.id}`);
                                            }}
                                            className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Eye size={14} />
                                            View
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/staff/form?id=${member.id}`);
                                            }}
                                            className="flex-1 py-2 bg-violet-100 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-200 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
