import { Trash2 } from "lucide-react";
import { BillItem } from "./types";

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
  return (
    <div className="flex-1 overflow-auto rounded-xl border border-slate-100/50 bg-white/50 backdrop-blur-sm relative">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50/80 backdrop-blur-md text-slate-500 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Staff</th>
            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Particulars</th>
            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Qty</th>
            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Price</th>
            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Total</th>
            <th className="px-6 py-4 text-center w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-24 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <span className="text-2xl opacity-50">🛒</span>
                  </div>
                  <p className="font-medium text-slate-500">No services added to the bill yet</p>
                  <p className="text-xs text-slate-400 max-w-xs">Click the "Add Item" button above to browse services and products</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-teal-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="relative">
                    <select 
                      value={item.staffId}
                      onChange={(e) => updateItemStaff(item.id, e.target.value)}
                      className={`appearance-none bg-transparent font-bold border-none focus:ring-0 cursor-pointer pl-0 py-1 text-sm outline-none w-full min-w-[140px]
                        ${item.staffId ? 'text-teal-600' : 'text-rose-500 animate-pulse'}
                      `}
                    >
                      <option value="">SELECT STAFF</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {/* Custom down arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 group-hover:text-teal-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-slate-700">
                      {item.description}
                    </p>
                    {item.serviceId ? <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block w-fit">Service</span> : item.productId ? <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block w-fit">Product</span> : item.packageId ? <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block w-fit">Package</span> : <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block w-fit">Item</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{item.qty}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    {item.isMemberPrice && (
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter line-through opacity-50">
                        ₹{item.regularPrice?.toLocaleString()}
                      </span>
                    )}
                    <span className="font-mono text-slate-700 font-bold">
                      <span className="text-xs text-slate-400 mr-0.5 font-normal">₹</span>
                      {item.price.toLocaleString()}
                    </span>
                    {item.isMemberPrice && (
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded mt-1 border border-amber-100 shadow-sm animate-pulse">
                        M-Price
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono text-base">
                  <span className="text-xs text-slate-400 mr-1 font-normal">₹</span>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
