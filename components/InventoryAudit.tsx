
import React, { useState } from 'react';
import { PackageSearch, Plus, Save, History, ClipboardCheck, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { Product, Client } from '../types';

interface InventoryAuditProps {
  products: Product[];
  clients: Client[];
  onSaveAudit: (audit: any) => void;
}

const InventoryAuditForm: React.FC<InventoryAuditProps> = ({ products, clients, onSaveAudit }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [auditItems, setAuditItems] = useState<Record<string, number>>({});

  const handleSave = () => {
    if (!selectedClient) return;
    const audit = {
      id: `AUD-${Date.now()}`,
      clientId: selectedClient,
      date: new Date().toISOString(),
      items: Object.entries(auditItems).map(([code, qty]) => ({
        productCode: code,
        quantityFound: qty
      }))
    };
    onSaveAudit(audit);
    setAuditItems({});
    setSelectedClient('');
    alert('Auditoría de estantería guardada con éxito.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Chequeo de Estantería</h3>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Validación de stock en PDV / Mayorista</p>
              </div>
              <ClipboardCheck className="text-blue-500" size={32} />
           </div>

           <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {products.map(p => (
                <div key={p.code} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:border-emerald-200 hover:shadow-lg transition-all">
                   <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.code}</p>
                      <h4 className="text-sm font-black text-slate-800 leading-tight uppercase">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sugerido Reorden: {p.reorderPoint} {p.unit}</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock Físico</p>
                         <input 
                           type="number" 
                           placeholder="0" 
                           className="w-24 p-3 bg-white border border-slate-200 rounded-2xl text-center font-black text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg"
                           value={auditItems[p.code] || ""}
                           onChange={(e) => setAuditItems({...auditItems, [p.code]: parseInt(e.target.value) || 0})}
                         />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white border border-white/10 relative overflow-hidden">
           <div className="absolute -left-10 -bottom-10 opacity-10"><PackageSearch size={150} /></div>
           <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2 relative z-10">
              <PackageSearch className="text-blue-400" /> Resumen Auditoría
           </h3>
           
           <div className="mb-8 relative z-10">
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-widest">Establecimiento Maestro</label>
              <select 
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="" className="bg-slate-900">Seleccionar...</option>
                {clients.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
              </select>
           </div>

           <div className="space-y-4 mb-8 relative z-10">
              <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referencias Auditadas</p>
                    <p className="text-3xl font-black text-white">{Object.keys(auditItems).length}</p>
                 </div>
                 <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/20">
                    <ClipboardCheck size={24} />
                 </div>
              </div>
           </div>

           <button 
             disabled={!selectedClient || Object.keys(auditItems).length === 0}
             onClick={handleSave}
             className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-900/40 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none transition-all flex items-center justify-center gap-2 relative z-10 active:scale-95"
           >
             <Save size={18} /> Consolidar Auditoría
           </button>
           
           <div className="mt-10 pt-8 border-t border-white/10 flex items-start gap-3 relative z-10">
              <Info className="text-blue-400 mt-1 shrink-0" size={16} />
              <p className="text-[10px] text-slate-400 italic leading-relaxed font-medium uppercase tracking-wider">
                 Los datos recolectados alimentarán el modelo predictivo de compras de Tomapedidos para optimizar el despacho del canal mayorista.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAuditForm;
