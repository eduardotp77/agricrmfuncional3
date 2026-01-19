
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  MapPin, Clock, CheckCircle2, MoreHorizontal, Download, 
  Upload, FileSpreadsheet, RefreshCw, X, Search, Filter,
  Share2
} from 'lucide-react';
import { Client, PlannedActivity, VisitFrequency } from '../types';

interface CommercialPlannerProps {
  clients: Client[];
  onAddActivity: (activity: PlannedActivity) => void;
}

const CommercialPlanner: React.FC<CommercialPlannerProps> = ({ clients, onAddActivity }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<PlannedActivity[]>([]);
  const [newActivity, setNewActivity] = useState<Partial<PlannedActivity>>({
    type: 'VISIT',
    status: 'PLANNED'
  });

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Espacios en blanco para el inicio del mes
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Fecha;Cliente;Tipo;Estado\n" + 
      activities.map(a => `${a.date};${a.clientName};${a.type};${a.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PLANNER_COMERCIAL_${monthNames[currentDate.getMonth()]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncGoogle = () => {
    alert("Sincronizando con Google Calendar API... Cargando agenda institucional.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Planner Comercial</h2>
          <p className="text-slate-500 text-sm font-medium italic">Planificación técnica y comercial del canal institucional.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleSyncGoogle} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-blue-50 transition-all">
             <RefreshCw size={16} /> Sync Google Calendar
           </button>
           <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
             <Download size={16} /> Exportar Agenda
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <button onClick={handlePrevMonth} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><ChevronLeft size={20}/></button>
                 <h3 className="text-xl font-black uppercase text-slate-800 tracking-tighter w-40 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                 <button onClick={handleNextMonth} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><ChevronRight size={20}/></button>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                 <Plus size={16} /> Programar
              </button>
           </div>

           <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => <div key={d}>{d}</div>)}
           </div>

           <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => (
                <div key={idx} className={`min-h-[100px] p-2 rounded-2xl border transition-all ${day ? 'bg-slate-50/50 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30' : 'border-transparent'}`}>
                   {day && (
                     <>
                        <span className="text-xs font-black text-slate-400">{day}</span>
                        <div className="mt-2 space-y-1">
                           {/* Ejemplo de actividad programada */}
                           {day % 7 === 0 && (
                              <div className="p-1.5 bg-blue-100 border border-blue-200 rounded-lg text-[8px] font-black text-blue-700 uppercase leading-none">
                                 Visita Técnico
                              </div>
                           )}
                           {day === 16 && (
                              <div className="p-1.5 bg-emerald-100 border border-emerald-200 rounded-lg text-[8px] font-black text-emerald-700 uppercase leading-none">
                                 Entrega Muestra
                              </div>
                           )}
                        </div>
                     </>
                   )}
                </div>
              ))}
           </div>
        </div>

        {/* Panel de Próximas Actividades */}
        <div className="space-y-6">
           <div className="bg-[#0f172a] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10"><CalendarIcon size={150} /></div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2 relative z-10">
                 <Clock className="text-blue-400" /> Próximas Visitas
              </h3>
              
              <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {clients.slice(0, 5).map(c => (
                    <div key={c.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{c.frequency}</p>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">En 3 días</span>
                       </div>
                       <h4 className="font-black text-xs uppercase leading-tight">{c.name}</h4>
                       <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><MapPin size={10} /> {c.city}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Eficiencia de Ruta</h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Cobertura Lograda</span>
                    <span className="text-sm font-black text-emerald-600">82%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{width: '82%'}}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Cumplidas</p>
                       <p className="text-xl font-black text-slate-800">45</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Pendientes</p>
                       <p className="text-xl font-black text-blue-600">12</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Programar Actividad</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Institucional & Técnica</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
              </div>

              <form className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Establecimiento Maestro</label>
                    <select className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none">
                       <option>Seleccionar cliente...</option>
                       {clients.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                       <input type="date" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo Actividad</label>
                       <select className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold">
                          <option>VISITA COMERCIAL</option>
                          <option>ENTREGA MUESTRA</option>
                          <option>GESTIÓN CARTERA</option>
                          <option>AUDITORÍA TÉCNICA</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas de Planificación</label>
                    <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold h-24" placeholder="Ej: Revisar stock de foliares..."></textarea>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#0056b2] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                    <CheckCircle2 size={18} /> Confirmar en Agenda
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CommercialPlanner;
