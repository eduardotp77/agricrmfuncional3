
import React, { useState, useRef, useMemo } from 'react';
import { 
  Users, UserPlus, Shield, Lock, Key, RefreshCw, Trash2, 
  Search, X, Save, CheckCircle2, AlertCircle, Upload, 
  FileText, Loader2, Mail, Briefcase, ChevronRight, UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Papa from 'papaparse';

interface UserManagementProps {
  users: User[];
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onBulkAddUsers: (newUsers: User[]) => void;
}

// Added missing master_admin to complete the Record<UserRole, string>
const ROLES_HIERARCHY: Record<UserRole, string> = {
  'superadmin': 'Control Total / Root',
  'admin': 'Administrador Senior',
  'master_admin': 'Administrador Maestro',
  'lider_comercial': 'Líder de Ventas',
  'lider_mercadeo': 'Líder de Estrategia',
  'kam_junior': 'Key Account Manager (KAM)',
  'entregador': 'Logística / Despacho',
  'jefe_bodega': 'Inventario Maestro',
  'jefe_cartera': 'Crédito y Cobranza',
  'jefe_produccion': 'Planta / Empaque',
  'auditoria': 'Auditoría y BI'
};

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUser, onBulkAddUsers }) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [formData, setFormData] = useState<Partial<User>>({ role: 'kam_junior', status: 'active' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageAll = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  const isComercialLeader = currentUser?.role === 'lider_comercial';

  // Filtrar lista según jerarquía
  const visibleUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.includes(searchTerm);
      if (canManageAll) return matchesSearch;
      if (isComercialLeader) return matchesSearch && (u.role === 'kam_junior' || u.leaderId === currentUser?.id);
      return false;
    });
  }, [users, searchTerm, currentUser, canManageAll, isComercialLeader]);

  const availableRoles = useMemo(() => {
    if (canManageAll) return Object.keys(ROLES_HIERARCHY) as UserRole[];
    if (isComercialLeader) return ['kam_junior'] as UserRole[];
    return [];
  }, [canManageAll, isComercialLeader]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;
    
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role as UserRole,
      status: 'active',
      leaderId: isComercialLeader ? currentUser?.id : formData.leaderId,
      lastLogin: 'Nunca'
    };
    
    onBulkAddUsers([newUser]);
    setIsModalOpen(false);
    setFormData({ role: 'kam_junior', status: 'active' });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(20);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportProgress(60);
        setTimeout(() => {
          const mapped: User[] = results.data.map((row: any, idx) => ({
            id: `u-csv-${Date.now()}-${idx}`,
            name: row.nombre || row.name || 'Sin Nombre',
            email: row.email || `user${idx}@agro.com`,
            role: (row.rol || row.role || 'kam_junior').toLowerCase() as UserRole,
            status: 'active',
            lastLogin: 'Importado'
          }));
          onBulkAddUsers(mapped);
          setIsImporting(false);
          setImportProgress(0);
          alert('Importación institucional completada.');
        }, 1000);
      }
    });
  };

  const handleResetPassword = (email: string) => {
    const link = `https://agricrm.agro/reset?token=${btoa(email)}`;
    alert(`Enlace generado: ${link}\n(Simulación: Se ha enviado a ${email})`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
         <div>
            <div className="flex items-center gap-4 mb-2">
               <div className="p-3 bg-slate-900 text-white rounded-2xl">
                  <Users size={28} />
               </div>
               <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-800">Equipo Humano</h2>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Gestión Centralizada de Identidades y Privilegios</p>
         </div>
         
         <div className="flex gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
               <Upload size={16} /> Importar CSV
               <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCSVUpload} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/30"
            >
               <UserPlus size={18} /> Crear Usuario
            </button>
         </div>
      </div>

      {/* Loading Overlay for CSV */}
      {isImporting && (
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-blue-100 text-center space-y-6 animate-pulse">
           <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Sincronizando Base Maestra...</h3>
           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-md mx-auto">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{width: `${importProgress}%`}}></div>
           </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
           <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nombre o email corporativo..."
          className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
                <th className="p-6">Colaborador / ID</th>
                <th className="p-6">Email / Contacto</th>
                <th className="p-6">Rol Institucional</th>
                <th className="p-6">Estado</th>
                <th className="p-6 text-center">Auditoría</th>
                <th className="p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleUsers.map(u => (
                <tr key={u.id} className="hover:bg-white/60 transition-colors group">
                  <td className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0056b2] text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                       <p className="font-black text-slate-800 text-[13px] uppercase tracking-tighter leading-none mb-1">{u.name}</p>
                       <p className="text-[8px] font-bold text-slate-400 font-mono">{u.id}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                       <Mail size={12} className="text-blue-500" />
                       <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <Shield size={12} className="text-amber-500" />
                       <span className="font-black text-slate-700 uppercase tracking-widest">{ROLES_HIERARCHY[u.role] || u.role}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => onUpdateUser(u.id, { status: u.status === 'active' ? 'inactive' : 'active' })}
                      className={`px-4 py-1.5 rounded-xl font-black uppercase text-[8px] tracking-widest border-2 transition-all ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                       {u.status}
                    </button>
                  </td>
                  <td className="p-6 text-center font-bold text-slate-400 italic">
                     {u.lastLogin || 'No registrado'}
                  </td>
                  <td className="p-6 text-right">
                     <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleResetPassword(u.email)}
                          className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all shadow-sm"
                          title="Restablecer Password"
                        >
                           <Key size={18} />
                        </button>
                        <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                           <Edit3 size={18} />
                        </button>
                        {currentUser?.role === 'superadmin' && (
                           <button className="p-3 bg-white border border-slate-100 text-slate-200 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                              <Trash2 size={18} />
                           </button>
                        )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5"><UserPlus size={200} /></div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Alta Colaborador</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronización de Privilegios</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 text-slate-400 transition-all"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <div className="relative group">
                       <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                       <input 
                         required 
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                         placeholder="Ej. Sofia Ruiz"
                         value={formData.name || ''}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                       <input 
                         required 
                         type="email"
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                         placeholder="sofia@agro.com"
                         value={formData.email || ''}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol de Acceso</label>
                       <select 
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10"
                         value={formData.role}
                         onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                       >
                          {availableRoles.map(r => <option key={r} value={r}>{ROLES_HIERARCHY[r]}</option>)}
                       </select>
                    </div>
                    {canManageAll && (
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Líder Asignado</label>
                          <select 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10"
                            value={formData.leaderId || ''}
                            onChange={e => setFormData({...formData, leaderId: e.target.value})}
                          >
                             <option value="">Ninguno / Root</option>
                             {users.filter(u => u.role === 'lider_comercial' || u.role === 'admin').map(u => (
                               <option key={u.id} value={u.id}>{u.name}</option>
                             ))}
                          </select>
                       </div>
                    )}
                 </div>

                 <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                    <Shield className="text-blue-500 mt-1" size={24} />
                    <p className="text-[9px] font-bold text-blue-900 leading-relaxed italic uppercase">
                       Al crear el usuario, el sistema generará una contraseña temporal automática y enviará una notificación 2FA al primer inicio de sesión.
                    </p>
                 </div>

                 <button 
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-[#0056b2] transition-all"
                 >
                    <UserCheck size={20} /> Consolidar Identidad
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const Edit3 = ({size}: {size: number}) => <RefreshCw size={size} />;

export default UserManagement;
