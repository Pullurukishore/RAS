"use client";
import { Users, Search, UserPlus } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Client Management</h1>
        <button className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all">
          <UserPlus size={20} /> New Client
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search clients by name, phone or ID..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-teal-500"
              />
           </div>
        </div>
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
           <Users size={48} className="opacity-20 mb-4" />
           <p className="font-medium italic">No clients found. Use the search bar or add a new client.</p>
        </div>
      </div>
    </div>
  );
}
