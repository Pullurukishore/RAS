"use client";
import { Settings as SettingsIcon, Shield, Store, Sparkles, Users, Receipt, ChevronRight, ArrowLeft, Bell, Database, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  interface SettingItem {
    title: string;
    icon: any;
    desc: string;
    color: string;
    bg: string;
    border: string;
    hover: string;
    href?: string;
    onClick?: () => void;
  }

  interface SettingGroup {
    title: string;
    description: string;
    items: SettingItem[];
  }

  const settingGroups: SettingGroup[] = [
    {
      title: "Business Settings",
      description: "Manage your salon's core operations",
      items: [
        { title: "Salon Menu", icon: Sparkles, desc: "Edit services, products, and packages", href: "/salon-menu", color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200", hover: "hover:border-violet-300" },
        { title: "Store Profile", icon: Store, desc: "Branch name, address, and GST details", href: "/settings/store-profile", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", hover: "hover:border-blue-300" },
        { title: "Staff Management", icon: Users, desc: "Manage employees, roles, and attendance", href: "/staff", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", hover: "hover:border-emerald-300" },
        { title: "Billing & Taxes", icon: Receipt, desc: "Invoice formats and tax configurations", href: "/settings/billing", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200", hover: "hover:border-orange-300" },
      ]
    },
    {
      title: "System Preferences",
      description: "Configure app behavior and security",
      items: [
        { title: "Security", icon: Shield, desc: "Admin password and session management", href: "/settings/security", color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200", hover: "hover:border-rose-300" },
        { title: "Alerts & Notifications", icon: Bell, desc: "Customer inactivity and system alerts", href: "/settings/notifications", color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200", hover: "hover:border-rose-300" },
      ]
    },
    {
      title: "Maintenance & Data",
      description: "Secure your data and system integrity",
      items: [
        { 
          title: "SQL Backup", 
          icon: Database, 
          desc: "Full database structure and data backup (.sql)", 
          onClick: () => handleBackup('sql'),
          color: "text-amber-600", 
          bg: "bg-amber-100", 
          border: "border-amber-200", 
          hover: "hover:border-amber-300" 
        },
        { 
          title: "JSON Export", 
          icon: Download, 
          desc: "Export all application data as JSON records", 
          onClick: () => handleBackup('json'),
          color: "text-cyan-600", 
          bg: "bg-cyan-100", 
          border: "border-cyan-200", 
          hover: "hover:border-cyan-300" 
        },
      ]
    }
  ];

  const handleBackup = (type: 'sql' | 'json') => {
    const endpoint = type === 'sql' ? '/settings/backup' : '/settings/backup/json';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    
    // Create a hidden anchor element to trigger the download
    const link = document.createElement('a');
    link.href = `${baseUrl}${endpoint}`;
    link.download = ''; // The browser will use the filename from Content-Disposition
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="px-6 py-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <SettingsIcon size={20} />
              </div>
              Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your application preferences and configurations</p>
          </div>
        </div>

        <div className="space-y-10">
          {settingGroups.map((group, idx) => (
            <div key={idx} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{group.title}</h2>
                <p className="text-sm text-slate-500">{group.description}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {group.items.map(setting => (
                  setting.href ? (
                    <Link 
                      key={setting.title} 
                      href={setting.href} 
                      className="group block"
                    >
                      <div className={`bg-white p-5 rounded-2xl border ${setting.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between h-full`}>
                        <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${setting.bg} ${setting.color}`}>
                            <setting.icon size={22} strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{setting.title}</h3>
                            <p className="text-sm text-slate-500">{setting.desc}</p>
                          </div>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                          <ChevronRight size={18} strokeWidth={2.5} />
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <button 
                      key={setting.title} 
                      onClick={setting.onClick}
                      className="group block text-left w-full"
                    >
                      <div className={`bg-white p-5 rounded-2xl border ${setting.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between h-full`}>
                        <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${setting.bg} ${setting.color}`}>
                            <setting.icon size={22} strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{setting.title}</h3>
                            <p className="text-sm text-slate-500">{setting.desc}</p>
                          </div>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                          <ChevronRight size={18} strokeWidth={2.5} />
                        </div>
                      </div>
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
