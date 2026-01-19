
import React, { useState } from 'react';
import { 
  Trello, 
  Table as TableIcon, 
  List as ListIcon, 
  Search, 
  Filter, 
  Sparkles,
  ArrowRightLeft,
  Target
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import ProspectTable from './ProspectTable';
import ProspectList from './ProspectList';
import { Prospect, ProspectStatus } from '../types';

interface FunnelViewProps {
  prospects: Prospect[];
  onAddProspect: (p: Prospect) => void;
  onMoveProspect: (id: string, newStatus: ProspectStatus) => void;
}

type ViewMode = 'kanban' | 'table' | 'list';

const FunnelView: React.FC<FunnelViewProps> = ({ prospects, onAddProspect, onMoveProspect }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = prospects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Embudo de Oportunidades</h2>
          <p className="text-slate-500 text-sm font-medium">Gestión relacional de prospectos y conversión institucional.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Trello size={16} /> Kanban
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TableIcon size={16} /> Tabla
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ListIcon size={16} /> Lista
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por nombre, establecimiento o zona..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
          <Filter size={20} />
        </button>
      </div>

      <div className="min-h-[500px]">
        {viewMode === 'kanban' && (
          <KanbanBoard 
            prospects={filtered} 
            onMoveProspect={onMoveProspect} 
            onAddProspect={onAddProspect} 
            hideHeader={true}
          />
        )}
        {viewMode === 'table' && (
          <ProspectTable 
            prospects={filtered} 
            onMoveProspect={onMoveProspect} 
          />
        )}
        {viewMode === 'list' && (
          <ProspectList 
            prospects={filtered} 
            onMoveProspect={onMoveProspect} 
          />
        )}
      </div>

      <div className="fixed bottom-8 right-8">
         <button className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/40 hover:scale-110 transition-transform active:scale-95 group relative">
            <Sparkles size={28} />
            <span className="absolute right-20 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
               Asesor AI de Cierre
            </span>
         </button>
      </div>
    </div>
  );
};

export default FunnelView;
