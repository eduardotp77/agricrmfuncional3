
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Key, 
  RefreshCw, 
  Trash2, 
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  Mail,
  UserX
} from 'lucide-react';
import { User, Profile } from '../types';

interface SuperAdminPanelProps {
  users: User[];
  profiles: Profile[];
  superAdminEmail: string;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onTransferSuperAdmin: (newEmail: string) => void;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ 
  users, 
  profiles, 
  superAdminEmail,
  onUpdateUser,
  onTransferSuperAdmin
}) => {
  const [newSuperAdminEmail, setNewSuperAdminEmail] = useState('');
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);

  const handleTransfer = () => {
    if (newSuperAdminEmail && newSuperAdminEmail.includes('@')) {
      onTransferSuperAdmin(newSuperAdminEmail);
      setShowConfirmTransfer(false);
      alert(`Mando transferido a: ${newSuperAdminEmail}`);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-900/40">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Panel de Control Maestro</h2>
            </div>
            <p className="text-slate-400 font-medium max-w-xl">
              Estás en modo SuperAdmin. Tienes acceso total a la infraestructura del CRM, gestión de datos maestros y control de identidades.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Identidad SuperAdmin</p>
            <p className="font-mono text-sm">{superAdminEmail}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
            <ArrowRightLeft className="text-purple-600" /> Transferir / Reemplazar Mando
          </h3>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            Si necesitas delegar tu autoridad o cambiar tu cuenta principal, ingresa el nuevo correo de superadmin aquí. El mando será transferido inmediatamente.
          </p>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder="nuevo@superadmin.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-purple-600 outline-none transition-all"
                value={newSuperAdminEmail}
                onChange={(e) => setNewSuperAdminEmail(e.target.value)}
              />
            </div>
            {!showConfirmTransfer ? (
              <button 
                onClick={() => setShowConfirmTransfer(true)}
                disabled={!newSuperAdminEmail}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Solicitar Reemplazo
              </button>
            ) : (
              <div className="p-6 bg-red-50 border border-red-100 rounded-2xl space-y-4 animate-in zoom-in duration-300">
                <p className="text-xs font-black text-red-600 uppercase text-center">¿Confirmas la transferencia de mando?</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowConfirmTransfer(false)} className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-black text-[10px] uppercase">Cancelar</button>
                  <button onClick={handleTransfer} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-900/20">Confirmar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Key className="text-blue-600" /> Seguridad y Auditoría
           </h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <ShieldAlert className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">Logs de Actividad</span>
                 </div>
                 <button className="text-[10px] font-black uppercase text-blue-600">Ver Todo</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <RefreshCw className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">Backup Base Maestra</span>
                 </div>
                 <button className="text-[10px] font-black uppercase text-blue-600">Descargar</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <UserX className="text-red-500" />
                    <span className="text-xs font-bold text-red-700">Cuentas Bloqueadas</span>
                 </div>
                 <span className="text-xs font-black text-red-600">0</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
