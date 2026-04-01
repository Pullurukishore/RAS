import { Trash2, User, ChevronDown, Check } from "lucide-react";
import { BillItem } from "./types";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BillItemsTableProps {
  items: BillItem[];
  staff: any[];
  updateItemStaff: (itemId: string, staffId: string) => void;
  removeItem: (id: string) => void;
}

export default function BillItemsTable({ 
  items, 
  staff, 
  updateItemStaff, 
  removeItem 
}: BillItemsTableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex-1 overflow-auto rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm relative" ref={dropdownRef}>
      <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
        <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 border-b border-slate-100 sticky top-0 z-20 shadow-sm">
          <tr>
            <th className="px-6 py-4 font-black uppercase tracking-[0.1em] text-[10px] text-slate-400">Staff Assigned</th>
            <th className="px-6 py-4 font-black uppercase tracking-[0.1em] text-[10px] text-slate-400">Services / Products</th>
            <th className="px-6 py-4 font-black uppercase tracking-[0.1em] text-[10px] text-slate-400 text-center">Qty</th>
            <th className="px-6 py-4 font-black uppercase tracking-[0.1em] text-[10px] text-slate-400 text-right">Unit Price</th>
            <th className="px-6 py-4 font-black uppercase tracking-[0.1em] text-[10px] text-slate-400 text-center">Tax %</th>
            <th className="px-6 py-4 font-black uppercase tracking-[0.1em] text-[10px] text-slate-400 text-right">Total</th>
            <th className="px-6 py-4 text-center w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-32 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-2 shadow-inner">
                    <span className="text-3xl opacity-50">🛍️</span>
                  </div>
                  <p className="font-bold text-slate-500 text-lg">Your cart is empty</p>
                  <p className="text-sm text-slate-400 max-w-xs">Select services from the menu to start billing</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                <td className="px-6 py-5 align-top">
                  <div className="relative">
                    {/* Custom Staff Selector */}
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                      className={`flex flex-col items-start gap-0.5 p-2.5 rounded-xl border transition-all duration-300 w-full min-w-[180px] text-left
                        ${item.staffId 
                          ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm' 
                          : 'bg-rose-50 border-rose-200 hover:bg-rose-100/50 animate-pulse'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px]
                            ${item.staffId ? 'bg-indigo-500' : 'bg-rose-400'}
                          `}>
                            {item.staffName ? item.staffName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className={`text-sm font-bold truncate max-w-[100px] ${item.staffId ? 'text-slate-800' : 'text-rose-600'}`}>
                            {item.staffName || 'Select Staff'}
                          </span>
                        </div>
                        <ChevronDown size={14} className={`${item.staffId ? 'text-slate-400' : 'text-rose-400'} transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                      </div>
                      {item.staffRole && (
                        <span className="text-[10px] font-medium text-slate-400 ml-9 italic tracking-wide">
                          {item.staffRole}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeDropdown === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute z-[30] top-full mt-2 left-0 w-[240px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 max-h-[300px] overflow-auto ring-4 ring-slate-900/5"
                        >
                          <div className="px-3 py-2 border-b border-slate-50 mb-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Team</p>
                          </div>
                          {staff.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                updateItemStaff(item.id, s.id);
                                setActiveDropdown(null);
                              }}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-indigo-50 group/item
                                ${item.staffId === s.id ? 'bg-indigo-50/50' : ''}
                              `}
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs
                                ${item.staffId === s.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 group-hover/item:bg-indigo-100 group-hover/item:text-indigo-600'}
                              `}>
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 text-left">
                                <p className={`text-sm font-bold ${item.staffId === s.id ? 'text-indigo-700' : 'text-slate-700 group-hover/item:text-indigo-600'}`}>
                                  {s.name}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 group-hover/item:text-indigo-400">{s.role}</p>
                              </div>
                              {item.staffId === s.id && <Check size={16} className="text-indigo-600" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex flex-col gap-1.5 mt-1">
                    <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-900 transition-colors">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                       {item.serviceId ? (
                         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-sm flex items-center gap-1">
                           <User size={10} /> Service
                         </span>
                       ) : item.productId ? (
                         <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shadow-sm flex items-center gap-1">
                           📦 Product
                         </span>
                       ) : (
                         <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shadow-sm">
                           🎁 Package
                         </span>
                       )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center align-top">
                  <div className="mt-1">
                    <span className="font-black text-slate-700 bg-slate-100 px-4 py-2 rounded-xl text-sm shadow-inner border border-slate-200/50">
                      {item.qty}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right align-top">
                  <div className="flex flex-col items-end mt-1">
                    {item.isMemberPrice && (
                      <span className="text-[10px] font-bold text-slate-400 line-through opacity-70 mb-0.5">
                        ₹{item.regularPrice?.toLocaleString()}
                      </span>
                    )}
                    <span className="font-mono text-slate-800 font-black text-base flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 font-normal">₹</span>
                      {item.price.toLocaleString()}
                    </span>
                    {item.isMemberPrice && (
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-full mt-1.5 border border-amber-400/20 shadow-sm">
                        Member Price
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-center align-top">
                   <div className="mt-1">
                    <span className="font-black text-teal-600 bg-emerald-50/50 px-3 py-1.5 rounded-xl text-[11px] border border-emerald-100 uppercase tracking-widest shadow-sm">
                      {item.gst || 0}%
                    </span>
                   </div>
                </td>
                <td className="px-6 py-5 text-right align-top font-black text-slate-900 font-mono text-lg tracking-tighter">
                  <div className="mt-1 flex items-baseline justify-end gap-1">
                    <span className="text-xs text-slate-400 font-normal">₹</span>
                    {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="px-6 py-5 text-center align-top">
                  <div className="mt-1">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 hover:rotate-12 transform active:scale-90"
                      title="Remove item"
                    >
                      <Trash2 size={20} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

