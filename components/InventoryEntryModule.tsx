
import React, { useState } from 'react';
import { Inbox, Plus, Search, FileText, TrendingUp, Save, X, History, Package, Box } from 'lucide-react';
import { Product, InventoryEntry } from '../types';

interface InventoryEntryModuleProps {
  products: Product[];
  onAddEntry: (entry: InventoryEntry) => void;
}

const InventoryEntryModule: React.FC<InventoryEntryModuleProps> = ({ products, onAddEntry }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<InventoryEntry>>({ quantity: 0 });

  const entries: InventoryEntry[] = [
    { id: 'ENT-001', date: '2026-01-15', productCode: 'AG001', productName: 'AGUA BOT. 300 ML X 24UD', quantity: 500, supplier: 'ECOAGUAS SAS', batch: 'L2210', notes: 'Entrada bodega principal' },
    { id: 'ENT-002', date: '2026-01-14', productCode: 'AGRO1', productName: 'ABONO ORG. MIN. BULTO 50 KL', quantity: 200, supplier: 'AGRONATUREX', batch: 'B990', notes: 'Stock temporada cítricos' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productCode && formData.quantity) {
      const prod = products.find(p => p.code === formData.productCode);
      onAddEntry({
        ...formData,
        id: `ENT-${Date.now()}`,
        date: new Date().toISOString(),
        productName: prod?.name || 'Desconocido'
      } as InventoryEntry);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Entrada de Mercancía</h2>
          <p className="text-slate-500 text-sm font-medium italic">Gestión de stock maestro y reabastecimiento institucional.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">
          <Plus size={18} /> Registrar Ingreso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Box size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entradas Mes</p>
               <p className="text-2xl font-black text-slate-800">142 Ingresos</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valorización</p>
               <p className="text-2xl font-black text-slate-800">$42.5M</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><History size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Ingreso</p>
               <p className="text-sm font-black text-slate-800 uppercase">Hace 2 horas</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
         <div className="p-6 border-b border-slate-50 flex items-center gap-4">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar ingresos por producto o proveedor..."
              className="flex-1 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
               <thead>
                  <tr className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
                     <th className="p-5">ID / Fecha</th>
                     <th className="p-5">Producto Ingresado</th>
                     <th className="p-5">Proveedor / Origen</th>
                     <th className="p-5">Cantidad</th>
                     <th className="p-5">Lote / Batch</th>
                     <th className="p-5 text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {entries.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-5 font-black text-slate-800">
                          <p className="leading-none">{e.id}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{e.date}</p>
                       </td>
                       <td className="p-5 font-black text-slate-900 uppercase">{e.productName}</td>
                       <td className="p-5 font-bold text-slate-500 uppercase">{e.supplier}</td>
                       <td className="p-5 font-black text-emerald-600 text-sm">+{e.quantity}</td>
                       <td className="p-5 font-mono text-slate-400 uppercase">{e.batch || 'N/A'}</td>
                       <td className="p-5 text-right">
                          <button className="p-2 text-slate-300 hover:text-blue-500"><FileText size={16} /></button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-8">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Registrar Ingreso</h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 text-slate-400 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Producto Maestro</label>
                    <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none appearance-none" onChange={e => setFormData({...formData, productCode: e.target.value})}>
                       <option value="">Seleccionar...</option>
                       {products.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad Ingreso</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black" onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}/>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lote</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black" onChange={e => setFormData({...formData, batch: e.target.value})}/>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Proveedor</label>
                    <input type="text" required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" onChange={e => setFormData({...formData, supplier: e.target.value})}/>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#0056b2] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3">
                    <Save size={18} /> Consolidar Inventario
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default InventoryEntryModule;
