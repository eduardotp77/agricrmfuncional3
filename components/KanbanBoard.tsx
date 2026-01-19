
import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  History, 
  DollarSign, 
  RefreshCw,
  Search,
  X,
  Target,
  FlaskConical,
  Briefcase,
  Trophy,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';
import { Prospect, ProspectStatus } from '../types';

interface KanbanBoardProps {
  prospects: Prospect[];
  onMoveProspect: (id: string, newStatus: ProspectStatus) => void;
  onAddProspect: (prospect: Prospect) => void;
  hideHeader?: boolean;
}

const ProspectCard: React.FC<{ 
  prospect: Prospect; 
  bg: string; 
  onMove: (newStatus: ProspectStatus) => void;
  canGoBack: boolean;
  canGoNext: boolean;
  prevStatus?: ProspectStatus;
  nextStatus?: ProspectStatus;
}> = ({ prospect, bg, onMove, canGoBack, canGoNext, prevStatus, nextStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasCustomFields = Object.keys(prospect.customFields || {}).length > 0;

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${bg} opacity-50`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight leading-none mb-1">{prospect.name}</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <History size={10} /> {prospect.businessName}
          </p>
        </div>
        <button className="p-2 text-slate-200 group-hover:text-slate-400 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <div className="bg-slate-50 rounded-2xl p-4 mb-3 space-y-2 border border-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potencial de Compra</span>
          <span className="text-xs font-black text-slate-900">${(prospect.estimatedPurchase || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
           <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Fuente</span>
           <span className="text-[10px] font-bold text-slate-600 italic">{prospect.source || 'Directo'}</span>
        </div>
      </div>

      {/* SECCIÓN DE CAMPOS DINÁMICOS */}
      {hasCustomFields && (
        <div className="mb-4">
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="w-full flex items-center justify-between p-3 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-all group/btn"
           >
              <div className="flex items-center gap-2">
                 <LayoutGrid size={12} className="text-blue-500" />
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Datos Adicionales</span>
              </div>
              {isExpanded ? <ChevronUp size={14} className="text-blue-400" /> : <ChevronDown size={14} className="text-blue-400" />}
           </button>
           
           {isExpanded && (
             <div className="mt-2 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                {Object.entries(prospect.customFields).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-white border border-slate-50 rounded-lg text-[9px]">
                     <span className="font-black text-slate-400 uppercase tracking-tighter truncate max-w-[100px]">{key}</span>
                     <span className="font-bold text-slate-700 truncate ml-2">{val?.toString() || '---'}</span>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button 
          disabled={!canGoBack}
          onClick={() => prevStatus && onMove(prevStatus)}
          className={`p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-100 transition-all active:scale-90 ${!canGoBack ? 'opacity-0' : ''}`}
        >
          <ChevronLeft size={16} />
        </button>
        
        <button 
           onClick={() => nextStatus && onMove(nextStatus)}
           className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 ${
            prospect.status === ProspectStatus.CERRADO_CLIENTE ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white hover:bg-blue-600'
          }`}
        >
          {prospect.status === ProspectStatus.CERRADO_CLIENTE ? 'CLIENTE ACTIVO' : (
            <>AVANZAR <ArrowRight size={12} /></>
          )}
        </button>
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ prospects, onMoveProspect, onAddProspect, hideHeader = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProspect, setNewProspect] = useState<Partial<Prospect>>({
    status: ProspectStatus.SIN_CALIFICAR,
    estimatedPurchase: 0,
    totalPurchased: 0,
    repurchaseCount: 0,
    customFields: {}
  });

  const columns: { status: ProspectStatus; icon: any; color: string; bg: string }[] = [
    { status: ProspectStatus.SIN_CALIFICAR, icon: Target, color: 'text-slate-500', bg: 'bg-slate-500' },
    { status: ProspectStatus.CALIFICADO, icon: FlaskConical, color: 'text-blue-500', bg: 'bg-blue-500' },
    { status: ProspectStatus.SEGUIMIENTO, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500' },
    { status: ProspectStatus.CERRADO_CLIENTE, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProspect.name && newProspect.businessName) {
      onAddProspect({
        ...newProspect,
        id: `PR-${Date.now()}`,
        lastInteractionDate: new Date().toISOString(),
      } as Prospect);
      setIsModalOpen(false);
      setNewProspect({
        status: ProspectStatus.SIN_CALIFICAR,
        estimatedPurchase: 0,
        totalPurchased: 0,
        repurchaseCount: 0,
        customFields: {}
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Pipeline de Oportunidades</h2>
            <p className="text-slate-500 text-sm font-medium italic">Gestión visual del embudo de conversión institucional.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0056b2] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Iniciar Prospección
          </button>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
        {columns.map(({ status, icon: Icon, color, bg }, idx) => (
          <div key={status} className="flex-1 min-w-[320px] flex flex-col gap-5">
            <div className="flex items-center justify-between p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${bg}/10 ${color} rounded-2xl flex items-center justify-center`}>
                     <Icon size={20} />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-700">
                    {status}
                  </h3>
               </div>
               <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                {prospects.filter(p => p.status === status).length}
              </span>
            </div>

            <div className="space-y-4 min-h-[500px]">
              {prospects
                .filter(p => p.status === status)
                .map(prospect => (
                  <ProspectCard 
                    key={prospect.id}
                    prospect={prospect}
                    bg={bg}
                    onMove={(newStatus) => onMoveProspect(prospect.id, newStatus)}
                    canGoBack={idx > 0}
                    canGoNext={idx < columns.length - 1}
                    prevStatus={columns[idx-1]?.status}
                    nextStatus={columns[idx+1]?.status}
                  />
                ))}
                
                {prospects.filter(p => p.status === status).length === 0 && (
                   <div className="py-20 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-200">
                      <Icon size={48} className="opacity-20 mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">Columna Vacía</p>
                   </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-10 bg-[#0056b2] text-white flex justify-between items-center shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-[2rem] backdrop-blur-md border border-white/10">
                     <Target size={32} />
                  </div>
                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Nueva Oportunidad</h3>
                     <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mt-2">Censo de Prospectos Institucionales</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identidad Persona</label>
                  <input required className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none" value={newProspect.name || ''} onChange={e => setNewProspect({...newProspect, name: e.target.value})} placeholder="Ej. Carlos Sanchez" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Negocio / Finca</label>
                  <input required className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none" value={newProspect.businessName || ''} onChange={e => setNewProspect({...newProspect, businessName: e.target.value})} placeholder="Ej. Agrotodo Lebrija" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observación Técnica de Interés</label>
                <textarea className="w-full p-4 bg-white border-none rounded-[2rem] text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none h-28" value={newProspect.interest || ''} onChange={e => setNewProspect({...newProspect, interest: e.target.value})} placeholder="Indique qué cultivos foco tiene el prospecto o qué marcas de la competencia usa..." />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Potencial de Venta Estimado ($)</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" className="w-full pl-12 pr-4 py-5 bg-white border-none rounded-2xl text-lg font-black text-blue-600 shadow-sm outline-none" value={newProspect.estimatedPurchase || ''} onChange={e => setNewProspect({...newProspect, estimatedPurchase: Number(e.target.value)})} placeholder="0" />
                </div>
              </div>

              <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-950/20 hover:bg-[#0056b2] transition-all flex items-center justify-center gap-4">
                <Target size={24} /> Iniciar Seguimiento en Pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
