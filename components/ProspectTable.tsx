
import React from 'react';
import { Prospect, ProspectStatus } from '../types';
import { DollarSign, RefreshCw, Calendar, Tag } from 'lucide-react';

interface ProspectTableProps {
  prospects: Prospect[];
  onMoveProspect: (id: string, newStatus: ProspectStatus) => void;
}

const ProspectTable: React.FC<ProspectTableProps> = ({ prospects, onMoveProspect }) => {
  const getStatusStyle = (status: ProspectStatus) => {
    switch (status) {
      case ProspectStatus.SIN_CALIFICAR: return 'text-slate-500 bg-slate-100';
      case ProspectStatus.CALIFICADO: return 'text-blue-600 bg-blue-50';
      case ProspectStatus.SEGUIMIENTO: return 'text-amber-600 bg-amber-50';
      case ProspectStatus.CERRADO_CLIENTE: return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 w-12">#</th>
              <th className="p-4 font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">Prospecto / Persona</th>
              <th className="p-4 font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">Establecimiento / Finca</th>
              <th className="p-4 font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">Estado Funnel</th>
              <th className="p-4 font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">Potencial Est.</th>
              <th className="p-4 font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">Venta Real</th>
              <th className="p-4 font-black text-slate-400 uppercase tracking-widest">Recompras</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prospects.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4 text-slate-300 font-mono border-r border-slate-100">{idx + 1}</td>
                <td className="p-4 font-bold text-slate-700 border-r border-slate-100">{p.name}</td>
                <td className="p-4 text-slate-500 border-r border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {p.businessName}
                  </div>
                </td>
                <td className="p-4 border-r border-slate-100">
                  <select 
                    value={p.status}
                    onChange={(e) => onMoveProspect(p.id, e.target.value as ProspectStatus)}
                    className={`px-3 py-1 rounded-full font-bold uppercase tracking-tighter outline-none cursor-pointer border-none appearance-none ${getStatusStyle(p.status)}`}
                  >
                    {/* Fixed type casting for enum values */}
                    {(Object.values(ProspectStatus) as ProspectStatus[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 font-mono text-slate-600 border-r border-slate-100">
                  ${p.estimatedPurchase.toLocaleString()}
                </td>
                <td className={`p-4 font-bold border-r border-slate-100 ${p.totalPurchased > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                  ${p.totalPurchased.toLocaleString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 font-bold">
                    <RefreshCw size={12} className={p.repurchaseCount > 0 ? 'text-emerald-500' : ''} />
                    {p.repurchaseCount}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProspectTable;
