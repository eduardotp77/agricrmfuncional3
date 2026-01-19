
import React, { useState } from 'react';
import { 
  Trello, 
  Table as TableIcon, 
  List as ListIcon, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  ShoppingBag,
  Target,
  FileDown,
  Sparkles
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import ProspectTable from './ProspectTable';
import ProspectList from './ProspectList';
import DynamicImportWizard from './DynamicImportWizard';
import { Prospect, ProspectStatus } from '../types';

interface ProspectsModuleProps {
  prospects: Prospect[];
  onAddProspect: (p: Prospect) => void;
  onMoveProspect: (id: string, newStatus: ProspectStatus) => void;
  onImportProspects: (p: Prospect[]) => void;
}

type ViewType = 'kanban' | 'table' | 'list' | 'import';

const ProspectsModule: React.FC<ProspectsModuleProps> = ({ prospects, onAddProspect, onMoveProspect, onImportProspects }) => {
  const [view, setView] = useState<ViewType>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProspects = prospects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPipe = prospects.reduce((sum, p) => sum + (p.estimatedPurchase || 0), 0);
  const conversionCount = prospects.filter(p => p.status === ProspectStatus.CERRADO_CLIENTE).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Target size={120} /></div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl relative z-10">
            <Target size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Potencial</p>
            <p className="text-xl font-black text-slate-800">${(totalPipe / 1000000).toFixed(1)}M</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl relative z-10">
            <TrendingUp size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prospectos Activos</p>
            <p className="text-xl font-black text-slate-800">{prospects.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Sparkles size={120} /></div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl relative z-10">
            <Sparkles size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversión Dinámica</p>
            <p className="text-xl font-black text-slate-800">{conversionCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-2 rounded-[2.2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-[1.5rem] w-full lg:w-auto">
          <button onClick={() => setView('kanban')} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'kanban' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
            <Trello size={16} /> Tablero
          </button>
          <button onClick={() => setView('table')} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'table' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
            <TableIcon size={16} /> Tabla
          </button>
          <button onClick={() => setView('import')} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'import' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
            <FileDown size={16} /> Inteligencia CSV
          </button>
        </div>

        {view !== 'import' && (
          <div className="flex items-center gap-3 w-full lg:w-auto px-4">
            <div className="relative flex-1 lg:w-72 group">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Filtrar funnel..." 
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
               />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        {view === 'kanban' && <KanbanBoard prospects={filteredProspects} onMoveProspect={onMoveProspect} onAddProspect={onAddProspect} hideHeader />}
        {view === 'table' && <ProspectTable prospects={filteredProspects} onMoveProspect={onMoveProspect} />}
        {view === 'import' && (
          <div className="max-w-5xl mx-auto">
             <DynamicImportWizard 
               onImport={(p) => { onImportProspects(p); setView('kanban'); }} 
               onCancel={() => setView('kanban')}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProspectsModule;
