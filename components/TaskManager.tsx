
import React, { useState } from 'react';
import { 
  ClipboardList, Plus, Calendar, User as UserIcon, 
  Tag, AlertCircle, CheckCircle2, Clock, Filter, Search, X, 
  ChevronRight, Briefcase, Building2, MapPin
} from 'lucide-react';
// Corrected imports from types.ts
import { Task, TaskStatus, TaskPriority, TaskCategory, User, Client, UserRole } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  users: User[];
  clients: Client[];
  currentUser: User;
  onAddTask: (task: Task) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, users, clients, currentUser, onAddTask, onUpdateTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    category: TaskCategory.VISIT
  });

  // Visibilidad Jerárquica: Líderes ven lo de su equipo, Operativos ven solo lo suyo
  const filteredTasks = tasks.filter(t => {
    const isOwner = t.assignedToId === currentUser.id;
    const isCreator = t.createdById === currentUser.id;
    const isLeaderOfAssigned = users.find(u => u.id === t.assignedToId)?.leaderId === currentUser.id;
    // Fix: Replaced UserRole.MASTER pseudo-enum usage with string literal 'superadmin'
    const isMaster = currentUser.role === 'superadmin';
    
    const canView = isOwner || isCreator || isLeaderOfAssigned || isMaster;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    
    return canView && matchesSearch && matchesCategory;
  });

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.CRITICAL: return 'bg-red-500 text-white';
      case TaskPriority.HIGH: return 'bg-amber-500 text-white';
      case TaskPriority.MEDIUM: return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title && newTask.assignedToId && newTask.clientId) {
      onAddTask({
        ...newTask,
        id: `TSK-${Date.now()}`,
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
      } as Task);
      setIsModalOpen(false);
      setNewTask({ status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, category: TaskCategory.VISIT });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Agenda Operativa AGRICRM</h2>
          <p className="text-slate-500 text-sm font-medium italic">Gestión de actividades por equipo y ruta comercial.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-600 transition-all"
        >
          <Plus size={18} /> Asignar Actividad
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por tarea o cliente..."
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <select 
             className="flex-1 md:flex-none px-4 py-3 bg-slate-50 rounded-2xl text-[10px] font-black uppercase outline-none"
             value={filterCategory}
             onChange={e => setFilterCategory(e.target.value)}
           >
             <option value="">Todas las Categorías</option>
             {/* Cast Object.values to TaskCategory[] for type-safe mapping and key assignment */}
             {(Object.values(TaskCategory) as TaskCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
               Prioridad {task.priority}
            </div>
            
            <div className="mb-4">
               <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">{task.category}</span>
            </div>

            <h4 className="font-black text-slate-800 uppercase text-[13px] mb-2 leading-tight">{task.title}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-2 mb-6 font-medium italic">"{task.description}"</p>

            <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl">
               <div className="flex items-center gap-2 text-slate-600">
                  <Building2 size={14} className="shrink-0 text-slate-400" />
                  <p className="text-[10px] font-black uppercase truncate">{clients.find(c => c.id === task.clientId)?.name || 'Cliente Master'}</p>
               </div>
               <div className="flex items-center gap-2 text-slate-600">
                  <UserIcon size={14} className="shrink-0 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase truncate">Resp: {users.find(u => u.id === task.assignedToId)?.name}</p>
               </div>
               <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={14} className="shrink-0 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{new Date(task.dueDate).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</p>
               </div>
            </div>

            <div className="flex gap-2">
               {task.status !== TaskStatus.COMPLETED ? (
                 <button 
                   onClick={() => onUpdateTask(task.id, { status: TaskStatus.COMPLETED })}
                   className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                 >
                    <CheckCircle2 size={14} /> Marcar Hecho
                 </button>
               ) : (
                 <div className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} /> Completada
                 </div>
               )}
               <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all">
                  <ChevronRight size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-8 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl">
                       <ClipboardList size={20} />
                    </div>
                    <h3 className="text-xl font-black uppercase text-slate-800 tracking-tighter">Asignación Estratégica</h3>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-all"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo de la Actividad</label>
                    <input 
                      required 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200" 
                      placeholder="Ej. Aplicación de muestra técnica en lote de limón"
                      value={newTask.title || ''}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Persona Responsable</label>
                       <select 
                         required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none"
                         value={newTask.assignedToId || ''}
                         onChange={e => setNewTask({...newTask, assignedToId: e.target.value})}
                       >
                          <option value="">Seleccionar del equipo...</option>
                          {users.filter(u => u.status === 'active').map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Establecimiento / Cliente</label>
                       <select 
                         required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none"
                         value={newTask.clientId || ''}
                         onChange={e => setNewTask({...newTask, clientId: e.target.value})}
                       >
                          <option value="">Vincular cliente...</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - {c.routeType}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Límite</label>
                       <input 
                         type="date"
                         required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none"
                         value={newTask.dueDate || ''}
                         onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridad</label>
                       <select 
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium"
                         value={newTask.priority}
                         onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                       >
                          {/* Cast Object.values to TaskPriority[] for type-safe mapping and key assignment */}
                          {(Object.values(TaskPriority) as TaskPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                       <select 
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium"
                         value={newTask.category}
                         onChange={e => setNewTask({...newTask, category: e.target.value as any})}
                       >
                          {/* Cast Object.values to TaskCategory[] for type-safe mapping and key assignment */}
                          {(Object.values(TaskCategory) as TaskCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Instrucciones Detalladas</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none h-24"
                      placeholder="Indica qué productos usar, qué medir o qué documentos solicitar..."
                      value={newTask.description || ''}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                    />
                 </div>

                 <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/30 hover:bg-blue-600 transition-all mt-4">
                    Confirmar Asignación de Tarea
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
