"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Plus, 
    User, 
    Scissors, 
    Search,
    Phone,
    X,
    CheckCircle2,
    AlertCircle,
    Edit2,
    Trash2,
    Sparkles,
    CalendarCheck,
    Crown,
    TrendingUp,
    Users,
    RefreshCw,
    ChevronRight,
    ArrowRight
} from "lucide-react";

// Types
interface Staff {
    id: string;
    name: string;
}

interface Service {
    id: string;
    description: string;
    price: number;
}

interface Appointment {
    id: string;
    customerName: string;
    customerPhone?: string;
    staffId?: string;
    serviceId?: string;
    date: string;
    time: string;
    status: string;
    notes?: string;
    staff?: Staff;
    service?: Service;
}

// Helper functions
const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
    const colors = [
        'from-cyan-500 to-teal-600',
        'from-emerald-500 to-teal-600',
        'from-violet-500 to-purple-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-blue-500 to-cyan-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    'Scheduled': { 
        bg: 'bg-cyan-50', 
        text: 'text-cyan-700', 
        border: 'border-cyan-200',
        icon: 'text-cyan-500'
    },
    'Completed': { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        icon: 'text-emerald-500'
    },
    'Cancelled': { 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        icon: 'text-rose-500'
    },
    'No Show': { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        icon: 'text-amber-500'
    },
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Appointment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    staffId: "",
    serviceId: "",
    date: formatDateStr(new Date()),
    time: "10:00",
    status: "Scheduled",
    notes: ""
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Generate a sliding window of dates for the calendar header (-3 days to +10 days)
  const dateList = useMemo(() => {
     const list = [];
     const start = new Date(selectedDate);
     start.setDate(selectedDate.getDate() - 3); // 3 days ago

     for(let i=0; i<14; i++) {
         const current = new Date(start);
         current.setDate(start.getDate() + i);
         list.push(current);
     }
     return list;
  }, [selectedDate]);

  useEffect(() => {
      fetchInitialData();
  }, []);

  useEffect(() => {
      fetchAppointments();
  }, [selectedDate]);

  const fetchInitialData = async () => {
      try {
          const [staffRes, servicesRes] = await Promise.all([
              fetch(`${apiUrl}/staff`),
              fetch(`${apiUrl}/menu?type=service`)
          ]);
          if(staffRes.ok) setStaffList(await staffRes.json());
          if(servicesRes.ok) setServicesList(await servicesRes.json());
      } catch (err) {
          console.error("Failed to fetch dependencies", err);
      }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const dateStr = formatDateStr(selectedDate);
      const res = await fetch(`${apiUrl}/appointments?date=${dateStr}`);
      if (res.ok) {
          const data = await res.json();
          setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (appt?: Appointment) => {
      if(appt) {
          setEditingItem(appt);
          setFormData({
              customerName: appt.customerName,
              customerPhone: appt.customerPhone || "",
              staffId: appt.staffId || "",
              serviceId: appt.serviceId || "",
              date: appt.date ? appt.date.split('T')[0] : formatDateStr(selectedDate),
              time: appt.time || "10:00",
              status: appt.status,
              notes: appt.notes || ""
          });
      } else {
          setEditingItem(null);
          setFormData({
              customerName: "",
              customerPhone: "",
              staffId: staffList.length > 0 ? staffList[0].id : "",
              serviceId: servicesList.length > 0 ? servicesList[0].id : "",
              date: formatDateStr(selectedDate),
              time: "10:00",
              status: "Scheduled",
              notes: ""
          });
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${apiUrl}/appointments/${editingItem.id}` : `${apiUrl}/appointments`;

      try {
          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });
          
          if(res.ok) {
              setIsModalOpen(false);
              fetchAppointments();
          } else {
              alert("Failed to save appointment");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure you want to permanently delete this appointment?")) return;
      try {
          const res = await fetch(`${apiUrl}/appointments/${id}`, { method: 'DELETE' });
          if(res.ok) {
              fetchAppointments();
          }
      } catch(err) {
          console.error(err);
      }
  };

  const updateStatus = async (id: string, newStatus: string) => {
      try {
          // Find the specific appointment to fetch original date and avoid rewriting with current time
          const currentAppt = appointments.find(a => a.id === id);
          if(!currentAppt) return;
          
          const res = await fetch(`${apiUrl}/appointments/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...currentAppt, status: newStatus })
          });
          if(res.ok) {
              fetchAppointments();
          }
      } catch(err) {
          console.error(err);
      }
  };

  const filteredAppointments = useMemo(() => {
      if(!search) return appointments;
      return appointments.filter(a => 
          a.customerName.toLowerCase().includes(search.toLowerCase()) || 
          (a.customerPhone && a.customerPhone.includes(search)) ||
          (a.service && a.service.description.toLowerCase().includes(search.toLowerCase())) ||
          (a.staff && a.staff.name.toLowerCase().includes(search.toLowerCase()))
      );
  }, [appointments, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-700">
            
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <CalendarIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-cyan-600 uppercase tracking-[0.2em]">Scheduler</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                        Appointments <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600">Calendar</span>
                    </h1>
                    <p className="text-slate-500 text-sm max-w-md">
                        Manage salon bookings and schedules. Track appointments, assign stylists, and keep your calendar organized.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSelectedDate(new Date())}
                        className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 text-slate-700 px-5 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-100/50 transition-all duration-300"
                    >
                        <CalendarCheck size={16} className="text-cyan-600 group-hover:scale-110 transition-transform" />
                        Today
                    </button>
                    <button 
                        onClick={() => router.push('/appointments/new')}
                        className="group relative overflow-hidden bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-slate-900/25 transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Plus size={18} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="relative z-10">Book Slot</span>
                    </button>
                </div>
            </div>

            {/* Premium Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-cyan-200/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today's Bookings</p>
                            <p className="text-3xl font-bold text-slate-900">{appointments.length} <span className="text-lg font-medium text-slate-400">Slots</span></p>
                        </div>
                    </div>
                </div>

                <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</p>
                            <p className="text-3xl font-bold text-slate-900">
                                {appointments.filter(a => a.status === 'Completed').length}
                                <span className="text-lg font-medium text-slate-400"> Done</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Upcoming</p>
                            <p className="text-3xl font-bold text-slate-900">
                                {appointments.filter(a => a.status === 'Scheduled').length}
                                <span className="text-lg font-medium text-slate-400"> Pending</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl shadow-slate-200/30 p-6 md:p-8">
                
                {/* Horizontal Calendar Scroller */}
                <div className="pb-8 mb-8 border-b border-slate-100/60 overflow-x-auto no-scrollbar">
                    <div className="flex gap-3 min-w-max">
                        {dateList.map((date, idx) => {
                            const isSelected = formatDateStr(date) === formatDateStr(selectedDate);
                            const isToday = formatDateStr(date) === formatDateStr(new Date());
                            
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNumber = date.getDate();
                            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                            return (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex flex-col items-center justify-center w-[72px] py-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                                        isSelected 
                                            ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-900/20 ring-4 ring-cyan-100 scale-105' 
                                            : 'bg-slate-50/80 text-slate-500 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-transparent hover:border-slate-100'
                                    }`}
                                >
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>{dayName}</span>
                                    <span className={`text-2xl font-bold mt-1 mb-0.5 ${isSelected ? 'text-white' : 'text-slate-800'}`}>{dayNumber}</span>
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-teal-300' : 'text-slate-400'}`}>
                                        {isToday && !isSelected ? 'TODAY' : monthName}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, phone, or service..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100">
                        <CalendarIcon size={14} className="text-cyan-500" />
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center animate-pulse">
                                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                                </div>
                                <div className="absolute inset-0 w-16 h-16 rounded-3xl bg-cyan-500/30 blur-xl animate-pulse" />
                            </div>
                            <p className="mt-6 text-slate-400 font-medium">Loading schedule...</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="relative bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-[2.5rem] py-24 flex flex-col items-center text-center px-8 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-teal-50/50" />
                            <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <CalendarIcon size={40} className="text-slate-300" />
                            </div>
                            <h3 className="relative text-2xl font-bold text-slate-900 mb-2">No Bookings Found</h3>
                            <p className="relative text-slate-500 max-w-sm mb-8">Your schedule is clear for this date. Enjoy the downtime or start booking customers!</p>
                            <button 
                                onClick={() => router.push('/appointments/new')}
                                className="relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Book First Slot
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAppointments.map((appt, idx) => {
                                const statusStyle = STATUS_COLORS[appt.status] || STATUS_COLORS['Scheduled'];
                                
                                return (
                                    <div 
                                        key={appt.id} 
                                        className="group relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-cyan-200/30 hover:border-cyan-200/60 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${idx * 75}ms` }}
                                    >
                                        {/* Hover gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
                                        
                                        <div className="relative">
                                            {/* Card Header */}
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4 py-2 rounded-xl font-bold text-lg tracking-tight shadow-lg shadow-slate-900/20">
                                                        {appt.time}
                                                    </div>
                                                    <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                        {appt.status}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); openForm(appt); }} 
                                                        className="p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={16}/>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(appt.id); }} 
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Customer Info with Avatar */}
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(appt.customerName)} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}>
                                                    {getInitials(appt.customerName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">
                                                        {appt.customerName}
                                                    </h3>
                                                    {appt.customerPhone && (
                                                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                                                            <Phone size={12} />
                                                            <span className="text-sm font-medium">{appt.customerPhone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Service & Staff Details */}
                                            <div className="space-y-3 bg-slate-50/80 rounded-2xl p-4 mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                                                        <Scissors size={16} className="text-violet-600" />
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Service</p>
                                                        <p className="font-semibold text-slate-800 text-sm truncate">{appt.service?.description || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center shrink-0">
                                                        <User size={16} className="text-cyan-600" />
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Stylist</p>
                                                        <p className="font-semibold text-slate-800 text-sm truncate">{appt.staff?.name || 'Unassigned'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                                {appt.status !== 'Completed' && (
                                                    <button 
                                                        onClick={() => updateStatus(appt.id, 'Completed')}
                                                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <CheckCircle2 size={14} /> Finish
                                                    </button>
                                                )}
                                                {appt.status === 'Scheduled' && (
                                                    <>
                                                        <button 
                                                            onClick={() => updateStatus(appt.id, 'No Show')}
                                                            className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <AlertCircle size={14} /> No Show
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStatus(appt.id, 'Cancelled')}
                                                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {appt.status !== 'Scheduled' && (
                                                    <button 
                                                        onClick={() => updateStatus(appt.id, 'Scheduled')}
                                                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        Revert
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Premium Booking Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
                <div 
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
                    onClick={() => !isSaving && setIsModalOpen(false)}
                />
                
                <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-300 border border-white/50 flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Modal Header with Gradient */}
                    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 px-8 py-8 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
                        
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSaving}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all backdrop-blur-md border border-white/10 disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                                {editingItem ? <Edit2 size={28} className="text-white" /> : <CalendarIcon size={28} className="text-white" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {editingItem ? 'Edit Booking' : 'New Appointment'}
                                </h2>
                                <p className="text-slate-400 text-sm mt-0.5">
                                    {editingItem ? 'Update appointment details' : 'Schedule a new booking'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-8 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Name</label>
                                    <input 
                                        required
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-400"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                    <input 
                                        type="tel"
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-400"
                                        placeholder="10 digit number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</label>
                                    <input 
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</label>
                                <select 
                                    required
                                    value={formData.serviceId}
                                    onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 appearance-none"
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
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 appearance-none"
                                >
                                    <option value="">Any Available</option>
                                    {staffList.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {editingItem && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 appearance-none"
                                    >
                                        <option>Scheduled</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                        <option>No Show</option>
                                    </select>
                                </div>
                            )}

                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-cyan-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isSaving ? <RefreshCw className="animate-spin" size={22} /> : <CheckCircle2 size={22} />}
                                    {isSaving ? 'Saving...' : (editingItem ? 'Update Booking' : 'Confirm Booking')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
