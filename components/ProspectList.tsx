
import React from 'react';
import { Prospect, ProspectStatus } from '../types';
import { ChevronRight, Calendar, User, Building } from 'lucide-react';

interface ProspectListProps {
  prospects: Prospect[];
  onMoveProspect: (id: string, newStatus: ProspectStatus) => void;
}

const ProspectList: React.FC<ProspectListProps> = ({ prospects, onMoveProspect }) => {
  return (
    <div className="space-y-2">
      {prospects.map(p => (
        <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div className="flex items-center gap-4 flex-1">
             <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <User size={20} />
             </div>
             <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 truncate">{p.name}</h4>
                <div className="flex items-center gap-3 mt-0.5">
                   <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Building size={10} /> {p.businessName}
                   </p>
                   <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar size={10} /> {new Date(p.lastInteractionDate).toLocaleDateString()}
                   </p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    p.status === ProspectStatus.CERRADO_CLIENTE ? 'bg-emerald-500' : 
                    p.status === ProspectStatus.SEGUIMIENTO ? 'bg-amber-500' : 'bg-slate-300'
                  }`}></span>
                  <span className="text-xs font-bold text-slate-600">{p.status}</span>
                </div>
             </div>
             <button className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                <ChevronRight size={20} />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProspectList;
