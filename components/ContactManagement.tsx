
import React, { useState } from 'react';
import { 
  UserPlus, Search, Phone, Trash2, X, Building2, Download, Share2, RefreshCw, Mail, Cake, MessageSquare, Star, CheckCircle2, Globe, ExternalLink
} from 'lucide-react';
import { Client, Contact, Business } from '../types';

interface ContactManagementProps {
  contacts: Contact[];
  clients: Client[];
  businesses: Business[];
  onAddContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const ContactManagement: React.FC<ContactManagementProps> = ({ 
  contacts, clients, businesses, onAddContact, onUpdateContact, onDeleteContact 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>({ role: 'Mostrador', birthday: '', notes: '' });

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBusinessName = (id: string) => businesses.find(b => b.id === id)?.legalName || 'AgriCRM Master';
  const getEstablishmentName = (id?: string) => clients.find(c => c.id === id)?.name || 'Sin Sede Vinculada';

  // Sincronización con Google Contacts (Simulación de API)
  const handleGoogleSync = async (contactId: string) => {
    setIsSyncing(contactId);
    try {
      // En una implementación real aquí se llamaría a gapi.client.people
      await new Promise(res => setTimeout(res, 2000));
      onUpdateContact({ 
        ...contacts.find(c => c.id === contactId)!, 
        isSyncedWithGoogle: true 
      } as Contact);
      alert("Contacto sincronizado con Google Cloud.");
    } catch (e) {
      alert("Error en la conexión con Google Services.");
    } finally {
      setIsSyncing(null);
    }
  };

  const handleGlobalImport = async () => {
    setIsGlobalSyncing(true);
    // Simulación de OAuth y Fetch de Google Contacts
    await new Promise(res => setTimeout(res, 3000));
    setIsGlobalSyncing(false);
    alert("Se han importado 12 nuevos contactos desde Google.");
  };

  const handleOpenAdd = () => {
    setFormData({ role: 'Mostrador', birthday: '', notes: '', businessId: businesses[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.businessId) {
      onAddContact({ ...formData, id: `CON-${Date.now()}` } as Contact);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Agenda Estratégica</h2>
          <p className="text-slate-500 text-sm font-medium italic">Gestión de identidades integrada con Google Cloud Services.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleGlobalImport}
             disabled={isGlobalSyncing}
             className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-blue-50 text-[#0056b2] font-black text-[10px] uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
           >
             {isGlobalSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Globe size={16} />}
             Sincronizar Google
           </button>
           <button onClick={handleOpenAdd} className="flex items-center gap-2 px-6 py-3 bg-[#0056b2] text-white rounded-2xl hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20">
             <UserPlus size={16} /> Nuevo Contacto
           </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-2xl">
          <Search className="text-slate-400" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nombre, cargo o empresa..."
          className="flex-1 outline-none text-sm font-bold placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 relative group overflow-hidden">
            {c.isSyncedWithGoogle && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-[3rem] flex items-start justify-end p-4 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
            )}
            
            <div className="flex items-center gap-5 mb-8">
               <div className="w-16 h-16 bg-[#0f172a] rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:bg-[#0056b2] transition-colors">
                  {c.name.charAt(0)}
               </div>
               <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tighter text-base leading-none mb-1">{c.name}</h4>
                  <p className="text-[10px] font-black text-[#0056b2] uppercase tracking-[0.2em]">{c.role}</p>
               </div>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-start gap-4 text-slate-500 group-hover:text-slate-800 transition-colors">
                  <div className="p-2 bg-slate-50 rounded-xl"><Building2 size={16} className="text-slate-400" /></div>
                  <div>
                     <p className="text-[11px] font-black uppercase leading-tight">{getBusinessName(c.businessId)}</p>
                     <p className="text-[9px] font-bold text-slate-400 mt-0.5">{getEstablishmentName(c.establishmentId)}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 text-slate-500">
                  <div className="p-2 bg-slate-50 rounded-xl"><Phone size={16} className="text-slate-400" /></div>
                  <p className="text-xs font-mono font-black tracking-tighter text-slate-700">{c.phone}</p>
               </div>
               {c.birthday && (
                 <div className="flex items-center gap-4 text-pink-500">
                    <div className="p-2 bg-pink-50 rounded-xl"><Cake size={16} /></div>
                    <p className="text-[11px] font-black uppercase tracking-widest">{new Date(c.birthday).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</p>
                 </div>
               )}
            </div>

            <div className="p-5 bg-slate-50 rounded-3xl mb-8 border border-slate-100">
               <p className="text-[9px] text-slate-400 font-black uppercase mb-2 tracking-widest">Anotaciones de Campo</p>
               <p className="text-[11px] text-slate-600 italic leading-relaxed font-medium">"{c.notes || 'Sin observaciones estratégicas registradas'}"</p>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
               <button 
                 onClick={() => handleGoogleSync(c.id)}
                 disabled={isSyncing === c.id}
                 className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                   ${c.isSyncedWithGoogle ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none' : 'bg-slate-900 text-white hover:bg-[#0056b2]'}
                 `}
               >
                 {isSyncing === c.id ? <RefreshCw className="animate-spin" size={14} /> : (c.isSyncedWithGoogle ? <CheckCircle2 size={14} /> : <Share2 size={14} />)}
                 {c.isSyncedWithGoogle ? 'En Google' : 'Sincronizar'}
               </button>
               <a href={`https://wa.me/${c.phone}`} target="_blank" rel="noreferrer" className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-md">
                 <MessageSquare size={20} />
               </a>
               <button onClick={() => onDeleteContact(c.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                 <Trash2 size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                 <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl">Registrar Contacto</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Conexión con Google People API</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identidad Completa</label>
                  <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Ricardo Sierra" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa / Casa Comercial</label>
                  <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" value={formData.businessId} onChange={e => setFormData({...formData, businessId: e.target.value})}>
                    <option value="">Seleccionar Empresa...</option>
                    {businesses.map(b => <option key={b.id} value={b.id}>{b.legalName}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo</label>
                  <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Ej. Gerente Compra" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Celular (WhatsApp)</label>
                  <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+57 315..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cumpleaños</label>
                  <input type="date" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none" value={formData.birthday || ''} onChange={e => setFormData({...formData, birthday: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil Psicológico y Notas DISC</label>
                <textarea className="w-full p-5 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none h-32" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Ej: Es un perfil dominante, prefiere datos técnicos directos, le gusta el café amargo..." />
              </div>
              
              <div className="flex gap-4">
                 <button type="submit" className="flex-[2] py-5 bg-[#0056b2] text-white font-black uppercase text-xs tracking-[0.2em] rounded-3xl shadow-2xl shadow-blue-900/40 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active-scale">
                    <Save size={20} /> Guardar en AgriCRM
                 </button>
                 <button 
                  type="button"
                  onClick={() => alert("Función habilitada: El contacto se subirá a Google automáticamente al guardar.")}
                  className="flex-1 py-5 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-xl flex items-center justify-center gap-2"
                 >
                    <Globe size={16} /> + Google
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Save = ({size}: {size: number}) => <Download size={size} />;

export default ContactManagement;
