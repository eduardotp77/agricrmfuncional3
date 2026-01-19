
import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, FlaskConical, Target, Sparkles, ShoppingBag, Repeat, Zap, Package, AlertCircle, DollarSign, Clock, MapPin, ShoppingCart } from 'lucide-react';
import { Client, Opportunity, TechnicalSample, Prospect, ProspectStatus, Order } from '../types';
import { getCRMInsights } from '../services/geminiService';

interface DashboardProps {
  clients: Client[];
  opportunities: Opportunity[];
  samples: TechnicalSample[];
  prospects: Prospect[];
  orders: Order[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ clients, opportunities, samples, prospects, orders }) => {
  const [insights, setInsights] = useState<string>("Iniciando auditoría técnica de ruta...");
  const [loadingInsights, setLoadingInsights] = useState(false);

  // KPIs Críticos Solicitados
  const masterKPIs = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const numOrders = orders.length;
    // Simulación de ruta activa (clientes totales vs atendidos)
    const routeTotal = clients.length; 
    const atendidos = new Set(orders.map(o => o.clientId)).size;
    const faltantes = Math.max(0, routeTotal - atendidos);

    return { totalSales, numOrders, faltantes };
  }, [orders, clients]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const res = await getCRMInsights({
        numClients: clients.length,
        numProspects: prospects.length,
        totalPipeValue: prospects.reduce((sum, p) => sum + p.estimatedPurchase, 0),
        samples: samples.length
      });
      setInsights(res);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [clients.length, prospects.length, samples.length]);

  return (
    <div className="space-y-6">
      {/* Barra de KPIs Críticos de Auditoría (Cabecera Superior) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         <div className="bg-[#0056b2] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute -right-6 -bottom-6 opacity-10"><ShoppingCart size={120} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Pedidos Logrados</p>
            <p className="text-4xl font-black tracking-tighter">{masterKPIs.numOrders}</p>
         </div>
         <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute -right-6 -bottom-6 opacity-10"><MapPin size={120} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Faltantes en Ruta</p>
            <p className="text-4xl font-black tracking-tighter">{masterKPIs.faltantes}</p>
         </div>
         <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute -right-6 -bottom-6 opacity-10"><DollarSign size={120} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Total Vendido ($)</p>
            <p className="text-3xl font-black tracking-tighter">${masterKPIs.totalSales.toLocaleString()}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Embudo de Oportunidades</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { name: 'Prospectos', value: prospects.length },
                 { name: 'Pedidos', value: orders.length },
                 { name: 'Clientes', value: clients.length }
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                 <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-900/40">
                <Sparkles size={20} />
             </div>
             <h3 className="font-black uppercase tracking-tighter text-lg">Gemini Strategy Auditor</h3>
          </div>
          <div className="text-sm leading-relaxed text-slate-300 font-medium italic bg-white/5 p-6 rounded-2xl border border-white/10 whitespace-pre-wrap">
            {loadingInsights ? "Procesando Big Data Tomapedidos..." : insights}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
