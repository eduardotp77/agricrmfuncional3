
import React, { useState, useMemo } from 'react';
import { 
  Calendar, Search, Filter, Printer, Download, ArrowUpRight, TrendingUp, 
  Users, ShoppingBag, PieChart, FileText, ChevronDown, Package, UserCheck
} from 'lucide-react';
import { Order, NoVentaRecord, Client, Product, NoVentaReason } from '../types';

interface ReportsModuleProps {
  orders: Order[];
  noVentas: NoVentaRecord[];
  clients: Client[];
  products: Product[];
}

type ReportType = 'pedidos' | 'vendedores' | 'productos' | 'clientes';

const ReportsModule: React.FC<ReportsModuleProps> = ({ orders, noVentas, clients, products }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('pedidos');
  const [selectedDate, setSelectedDate] = useState('2026-01-16');

  // Cálculo de indicadores globales (Captura 1)
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length + noVentas.length;
    const firstOrder = orders.length > 0 ? orders[0].date.split('T')[1].substring(0, 8) : '--:--:--';
    const lastOrder = orders.length > 0 ? orders[orders.length - 1].date.split('T')[1].substring(0, 8) : '--:--:--';
    
    return { totalSales, totalOrders, firstOrder, lastOrder };
  }, [orders, noVentas]);

  const renderStatsHeader = () => (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden mb-8 animate-in fade-in duration-500">
       <div className="bg-[#0056b2] p-4 text-white font-black uppercase text-xs tracking-widest flex items-center gap-3">
          <FileText size={18} /> Resumen de pedidos - Viernes 16 enero 2026
       </div>
       <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
             <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Fecha Reporte</label>
             <div className="flex gap-2">
                <input type="date" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                <button className="px-4 py-2 bg-[#0056b2] text-white rounded-xl font-black text-[10px] uppercase">Buscar</button>
             </div>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="text-center border-r border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase">Primer Pedido</p>
                <p className="text-sm font-black text-slate-700">{stats.firstOrder}</p>
             </div>
             <div className="text-center border-r border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase">Último Pedido</p>
                <p className="text-sm font-black text-slate-700">{stats.lastOrder}</p>
             </div>
             <div className="text-center border-r border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase">Cant. Operaciones</p>
                <p className="text-sm font-black text-blue-600">{stats.totalOrders}</p>
             </div>
             <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Total en Ventas</p>
                <p className="text-sm font-black text-emerald-600">${stats.totalSales.toLocaleString()}</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Menu Superior (Captura 5) */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-40">
         <button onClick={() => setActiveReport('pedidos')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeReport === 'pedidos' ? 'bg-[#0056b2] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Pedidos</button>
         <button onClick={() => setActiveReport('vendedores')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeReport === 'vendedores' ? 'bg-[#0056b2] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Vendedores</button>
         <button onClick={() => setActiveReport('productos')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeReport === 'productos' ? 'bg-[#0056b2] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Productos</button>
         <button onClick={() => setActiveReport('clientes')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeReport === 'clientes' ? 'bg-[#0056b2] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Clientes</button>
      </div>

      {renderStatsHeader()}

      {activeReport === 'pedidos' && (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse">
                 <thead>
                    <tr className="bg-[#ff4500] text-white font-black uppercase tracking-widest">
                       <th className="p-4 border-r border-white/20">Pedido</th>
                       <th className="p-4 border-r border-white/20">Cliente</th>
                       <th className="p-4 border-r border-white/20">Vendedor</th>
                       <th className="p-4 border-r border-white/20">Fecha / Hora</th>
                       <th className="p-4 border-r border-white/20">Cant.</th>
                       <th className="p-4 border-r border-white/20">Subtotal</th>
                       <th className="p-4 border-r border-white/20">Total</th>
                       <th className="p-4">Comentarios</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {/* Pedidos Reales */}
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50 group">
                         <td className="p-4 font-black text-blue-600 border-r border-slate-50 underline cursor-pointer">{o.id.replace('PED-', '')}</td>
                         <td className="p-4 font-bold text-slate-700 border-r border-slate-50 uppercase">{o.clientName}</td>
                         <td className="p-4 text-blue-600 border-r border-slate-50 underline">{o.vendorName}</td>
                         <td className="p-4 text-slate-500 border-r border-slate-50 font-mono">{o.date.replace('T', ' ').substring(0, 19)}</td>
                         <td className="p-4 text-center border-r border-slate-50">{o.items.length}</td>
                         <td className="p-4 text-right border-r border-slate-50">${o.subtotal.toLocaleString()}</td>
                         <td className="p-4 text-right border-r border-slate-50 font-black">${o.total.toLocaleString()}</td>
                         <td className="p-4 text-slate-400 italic truncate max-w-[150px]">{o.comments || 'N/A'}</td>
                      </tr>
                    ))}
                    {/* No Ventas (Captura 1) */}
                    {noVentas.map(nv => (
                      <tr key={nv.id} className="bg-slate-50/50 hover:bg-slate-100 group italic">
                         <td className="p-4 font-black text-blue-400 border-r border-slate-50 underline">{nv.id.replace('NV-', '')}.NV</td>
                         <td className="p-4 font-bold text-slate-400 border-r border-slate-50 uppercase">{nv.clientName}</td>
                         <td className="p-4 text-blue-400 border-r border-slate-50 underline">{nv.vendorName}</td>
                         <td className="p-4 text-slate-300 border-r border-slate-50 font-mono">{nv.date.replace('T', ' ').substring(0, 19)}</td>
                         <td className="p-4 text-center border-r border-slate-50">0</td>
                         <td className="p-4 text-right border-r border-slate-50 text-slate-300">$0</td>
                         <td className="p-4 text-right border-r border-slate-50 font-black text-slate-300">$0</td>
                         <td className="p-4 text-[#ff4500] font-black uppercase text-[8px]">{nv.reason}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-6 bg-slate-50 flex justify-center">
              <button onClick={() => window.print()} className="px-10 py-3 bg-[#0056b2] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-3">
                 <Printer size={16} /> Imprimir Resumen
              </button>
           </div>
        </div>
      )}

      {activeReport === 'vendedores' && (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-500">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-[9px] border-collapse">
                 <thead>
                    <tr className="bg-[#ff4500] text-white font-black uppercase tracking-widest">
                       <th className="p-4 border-r border-white/20">Vendedor</th>
                       <th className="p-4 border-r border-white/20">Visitas</th>
                       <th className="p-4 border-r border-white/20">Ventas</th>
                       <th className="p-4 border-r border-white/20">No Ventas</th>
                       <th className="p-4 border-r border-white/20">$ Ventas</th>
                       <th className="p-4 border-r border-white/20">% Presupuesto</th>
                       <th className="p-4 border-r border-white/20">Venta Mín</th>
                       <th className="p-4 border-r border-white/20">Venta Máx</th>
                       <th className="p-4">Recaudos</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                       <td className="p-4 font-black text-blue-600 underline">Eduardo Tobacia</td>
                       <td className="p-4 text-center">45</td>
                       <td className="p-4 text-center">18</td>
                       <td className="p-4 text-center text-orange-600 font-bold">27</td>
                       <td className="p-4 font-black text-slate-800">$2,450,000</td>
                       <td className="p-4 text-center">
                          <div className="flex items-center gap-2">
                             <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: '45%' }}></div>
                             </div>
                             <span>45.2%</span>
                          </div>
                       </td>
                       <td className="p-4">$12,000</td>
                       <td className="p-4">$660,000</td>
                       <td className="p-4 font-black text-emerald-600">$1,000,000</td>
                    </tr>
                    <tr className="bg-[#ff4500]/10 font-black text-slate-900">
                       <td className="p-4 uppercase">Totales</td>
                       <td className="p-4 text-center">45.0</td>
                       <td className="p-4 text-center">18.0</td>
                       <td className="p-4 text-center">27.0</td>
                       <td className="p-4">$2,450,000</td>
                       <td className="p-4 text-center">45.2%</td>
                       <td className="p-4">$12,000</td>
                       <td className="p-4">$660,000</td>
                       <td className="p-4">$1,000,000</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeReport === 'productos' && (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-500">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-[9px] border-collapse">
                 <thead>
                    <tr className="bg-[#ff4500] text-white font-black uppercase tracking-widest">
                       <th className="p-4 border-r border-white/20">Producto</th>
                       <th className="p-4 border-r border-white/20">Categoría</th>
                       <th className="p-4 border-r border-white/20">No. Pedidos</th>
                       <th className="p-4 border-r border-white/20">Total Vendido</th>
                       <th className="p-4 border-r border-white/20">Unidades</th>
                       <th className="p-4 border-r border-white/20">Mín Orden</th>
                       <th className="p-4">Máx Orden</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.code} className="hover:bg-slate-50">
                         <td className="p-4 font-black text-blue-600 underline">[{p.code}] {p.name}</td>
                         <td className="p-4 font-bold text-slate-400 uppercase">{p.category}</td>
                         <td className="p-4 text-center">12</td>
                         <td className="p-4 font-black text-slate-800">$1,024,000</td>
                         <td className="p-4 text-center">{p.inventory}</td>
                         <td className="p-4">$24,000</td>
                         <td className="p-4">$660,000</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;
