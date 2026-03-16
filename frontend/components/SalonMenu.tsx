"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Service {
  id: string; // From prisma
  code: string;
  description: string;
  price: number;
  mPrice: number;
  gst: number;
  category?: string;
  type?: 'Service' | 'Product' | 'Package';
}


const SalonMenu = ({ onAdd }: { onAdd: (item: Service) => void }) => {
  const [activeTab, setActiveTab] = useState<'Service' | 'Product' | 'Package'>('Service');

  const [data, setData] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [activeGender, setActiveGender] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const typeQuery = activeTab.toLowerCase();
    let query = `${apiUrl}/menu?type=${typeQuery}`;
    
    if (activeGender && activeTab === 'Service') {
      query += `&gender=${activeGender}`;
    }

    fetch(query)
      .then(res => res.json())
      .then(json => {
          setData(json.map((i: any) => ({ ...i, type: activeTab })));
      })
      .catch(err => console.error("Salon Menu fetch failed:", err));

  }, [activeTab, activeGender, apiUrl]);

  const filteredData = data.filter(item => 
    item.description.toLowerCase().includes(search.toLowerCase()) || 
    item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white flex flex-col h-[700px] w-full font-sans border-t-[3px] border-t-white relative">
      <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-[#f0f1f3] z-50 border-l border-white shadow-inner"></div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-white sticky top-0 z-20 mr-2.5">
        {(['Service', 'Product', 'Package'] as const).map(tab => (

          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[13px] font-bold transition-all relative outline-none tracking-wide ${
              activeTab === tab 
                ? "text-[#1DBA90]" 
                : "text-[#768798] hover:text-[#526373]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#1DBA90]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-5 bg-white space-y-4 z-10 sticky top-[53px] mr-2.5">
        <div className="flex gap-4">
           {/* Search Input */}
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9EACB9]" size={16} />
              <input 
                type="text" 
                placeholder="Search by Code or Description..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#F6F7F9] border-none rounded-lg text-sm text-[#404c57] focus:ring-2 focus:ring-[#1DBA90]/20 focus:outline-none transition-all placeholder:text-[#9EACB9] font-medium"
              />
           </div>
           
           {/* Gender Dropdown */}
           <div className={`relative w-36 shrink-0 transition-opacity ${activeTab !== 'Service' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <select 
               value={activeGender}
               onChange={(e) => setActiveGender(e.target.value)}
               className="w-full appearance-none bg-[#F6F7F9] border-none rounded-lg text-sm font-semibold text-[#526373] px-4 py-2.5 pr-10 focus:ring-2 focus:ring-[#1DBA90]/20 focus:outline-none transition-all cursor-pointer"
             >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
             </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9EACB9] pointer-events-none stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="flex-1 overflow-auto bg-white px-6 pb-4 mr-2.5">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white z-10 sticky top-0 bg-white shadow-[0_1px_0_0_#eaeef2]">
            <tr>
              <th className="py-4 font-bold text-[11px] uppercase tracking-widest text-[#9EACB9] w-32 border-b-2 border-[#eaeef2]">Code</th>
              <th className="py-4 font-bold text-[11px] uppercase tracking-widest text-[#9EACB9] border-b-2 border-[#eaeef2] w-[450px]">Description</th>
              <th className="py-4 font-bold text-[11px] uppercase tracking-widest text-[#9EACB9] text-right w-28 border-b-2 border-[#eaeef2]">Price</th>
              <th className="py-4 font-bold text-[11px] uppercase tracking-widest text-[#9EACB9] text-right w-28 border-b-2 border-[#eaeef2]">M-Price</th>
              <th className="py-4 border-b-2 border-[#eaeef2]"></th>
            </tr>
          </thead>
          <tbody className="">
            {filteredData.length === 0 ? (
               <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2 animate-pulse">
                        <Search className="text-slate-300" size={24} />
                      </div>
                      <p className="font-semibold text-slate-600 text-base">We didn't find any items</p>
                      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">Try adjusting your search query or filters to find what you're looking for.</p>
                    </div>
                  </td>
               </tr>
            ) : filteredData.map((item, index) => (
              <tr 
                key={item.id} 
                onClick={() => onAdd(item)}
                className={`cursor-pointer transition-colors ${index % 2 === 1 ? 'bg-[#fafdff]' : 'bg-white'} hover:bg-[#eaf8f5] group`}
              >
                <td className="py-5 border-b border-[#eaeef2]">
                  <span className="font-mono text-[11px] font-bold text-[#768798]">{item.code}</span>
                </td>
                <td className="py-5 font-bold text-[#404c57] text-[13px] border-b border-[#eaeef2]">
                  <div className="flex flex-col">
                    <span>{item.description}</span>
                    {item.category && (
                      <span className="text-[10px] text-[#1DBA90] uppercase tracking-widest font-bold mt-0.5">{item.category}</span>
                    )}
                  </div>
                </td>
                <td className="py-5 text-right font-black text-[#404c57] font-mono text-[13px] border-b border-[#eaeef2]">
                   <span className="text-[#a5b2bd] font-normal text-xs mr-0.5">₹</span>{item.price}
                </td>
                <td className="py-5 text-right font-black text-[#1DBA90] font-mono text-[13px] border-b border-[#eaeef2]">
                   <span className="text-[#8cd1c2] font-normal text-xs mr-0.5">₹</span>{item.mPrice}
                </td>
                <td className="py-5 border-b border-[#eaeef2]"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalonMenu;
