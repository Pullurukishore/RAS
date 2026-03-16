"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
    Edit2, 
    X,
    CheckCircle2,
    RefreshCw,
    Crown,
    ArrowLeft,
    Loader2
} from "lucide-react";

export default function EditCustomerPage() {
    const router = useRouter();
    const { id } = useParams();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        isMember: false,
        membershipTier: "Standard",
        membershipExpiry: ""
    });

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await fetch(`${apiUrl}/customers/${id}`);
                if (res.ok) {
                    const customer = await res.json();
                    setFormData({
                        name: customer.name,
                        phone: customer.phone || "",
                        isMember: customer.isMember || false,
                        membershipTier: customer.membershipTier || "Standard",
                        membershipExpiry: customer.membershipExpiry ? new Date(customer.membershipExpiry).toISOString().split('T')[0] : ""
                    });
                } else {
                    alert("Customer not found");
                    router.push("/customers");
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load customer");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchCustomer();
    }, [id, apiUrl, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const res = await fetch(`${apiUrl}/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if(res.ok) {
                router.push("/customers");
            } else {
                alert("Failed to update customer");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 py-10 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold mb-8 bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 shadow-sm"
                >
                    <ArrowLeft size={18} />
                    Back to Directory
                </button>

                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-white/60 overflow-hidden">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-10">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
                        
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl text-white">
                                <Edit2 size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Edit Client Details</h1>
                                <p className="text-slate-400 font-medium">Update profile information for {formData.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                                    <input 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-slate-800 placeholder:text-slate-400 outline-none"
                                        placeholder="Enter customer name"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input 
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setFormData({...formData, phone: val});
                                        }}
                                        maxLength={10}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-slate-800 placeholder:text-slate-400 outline-none"
                                        placeholder="10 digit mobile number"
                                    />
                                </div>
                            </div>

                            {/* Membership Section */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.isMember ? 'bg-amber-100 text-amber-600 shadow-amber-200' : 'bg-slate-200 text-slate-500'}`}>
                                            <Crown size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg leading-tight">Premium Membership</p>
                                            <p className="text-sm text-slate-500">Enable exclusive member prices and benefits</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, isMember: !formData.isMember})}
                                        className={`relative w-14 h-7 rounded-full transition-colors duration-500 ${formData.isMember ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 ${formData.isMember ? 'left-8' : 'left-1'}`} />
                                    </button>
                                </div>

                                {formData.isMember && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Membership Tier</label>
                                            <select 
                                                value={formData.membershipTier}
                                                onChange={(e) => setFormData({...formData, membershipTier: e.target.value})}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none appearance-none"
                                            >
                                                <option>Standard</option>
                                                <option>Premium</option>
                                                <option>VIP</option>
                                                <option>Elite</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                                            <input 
                                                type="date"
                                                value={formData.membershipExpiry}
                                                onChange={(e) => setFormData({...formData, membershipExpiry: e.target.value})}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6">
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[2rem] font-bold text-lg hover:shadow-2xl hover:shadow-slate-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-70 group"
                                >
                                    {isSaving ? <RefreshCw className="animate-spin" size={24} /> : <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />}
                                    {isSaving ? 'Updating...' : 'Update Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
