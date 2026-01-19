
import React, { useState } from 'react';
import { Building2, Plus, Search, FileText, Trash2, Edit2, X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Business } from '../types';

interface BusinessManagementProps {
  businesses: Business[];
  onAddBusiness: (b: Business) => void;
  onUpdateBusiness: (b: Business) => void;
  onDeleteBusiness: (id: string) => void;
}

const BusinessManagement: React.FC<BusinessManagementProps> = ({ 
  businesses, onAddBusiness, onUpdateBusiness, onDeleteBusiness 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [formData, setFormData] = useState<Partial<Business>>({ category: 'Distribuidor' });

  const filtered = businesses.filter(b => 
    b.legalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.nit.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.legalName && formData.nit) {
      onAddBusiness({ ...formData, id: `BIZ-${Date.now()}` } as Business);
      setIsModalOpen(false);
      setFormData({ category: 'Distribuidor' });
    }
  };

  const handleImport = () => {
    const lines = importText.split('\n');
    lines.forEach(line => {
      const p = line.split(/[,|\t]/);
      if (p.length >= 2) {
        onAddBusiness({
          id: `BIZ-${Date.now()}-${Math.random()}`,
          legalName: p[0].trim(),
          nit: p[1].trim(),
          category: 'Distribuidor'
        } as Business);
      }
    });
    setImportText('');
    setIsImportOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Empresas e Instituciones</h2>
          <p className="text-slate-500 text-sm">Gestiona las razones sociales y casas comerciales.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <FileSpreadsheet size={18} /> Importar
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
            <Plus size={18} /> Nueva Empresa
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por NIT o Razón Social..."
          className="flex-1 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(b => (
          <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Building2 size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => onDeleteBusiness(b.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{b.legalName}</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">NIT: {b.nit}</p>
            <div className="flex items-center gap-2">
               <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{b.category}</span>
               {b.website && <span className="text-[10px] text-blue-500 truncate">{b.website}</span>}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
              <h3 className="font-bold text-emerald-900">Nueva Razón Social</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Nombre Legal</label>
                <input required className="w-full p-2 bg-slate-50 border rounded-lg" value={formData.legalName || ''} onChange={e => setFormData({...formData, legalName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">NIT</label>
                <input required className="w-full p-2 bg-slate-50 border rounded-lg" value={formData.nit || ''} onChange={e => setFormData({...formData, nit: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Categoría</label>
                <select className="w-full p-2 bg-slate-50 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                  <option value="Distribuidor">Distribuidor</option>
                  <option value="Productor">Productor</option>
                  <option value="Cooperativa">Cooperativa</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">Guardar Empresa</button>
            </form>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50 text-blue-900">
              <h3 className="font-bold flex items-center gap-2"><FileSpreadsheet /> Importar Empresas</h3>
              <button onClick={() => setIsImportOpen(false)}><X /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Pega aquí (Nombre, NIT)</p>
              <textarea rows={6} className="w-full p-3 font-mono text-sm bg-slate-50 border rounded-xl" value={importText} onChange={e => setImportText(e.target.value)} placeholder="Agroindustrias S.A, 900.111.222-1" />
              <button onClick={handleImport} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Procesar Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
