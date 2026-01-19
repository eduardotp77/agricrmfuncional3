
import React, { useState, useRef } from 'react';
import { 
  Upload, X, ChevronRight, CheckCircle2, AlertCircle, 
  Database, FileText, ArrowRight, Settings2, Eye, 
  Sparkles, Loader2, Table, LayoutGrid
} from 'lucide-react';
import Papa from 'papaparse';
import { Prospect, ProspectStatus } from '../types';

interface DynamicImportWizardProps {
  onImport: (prospects: Prospect[]) => void;
  onCancel: () => void;
}

type MappingTarget = 'name' | 'businessName' | 'interest' | 'estimatedPurchase' | 'source' | 'ignore' | 'dynamic';

interface FieldMapping {
  csvHeader: string;
  target: MappingTarget;
}

const FIXED_FIELDS: { key: MappingTarget; label: string; required?: boolean }[] = [
  { key: 'name', label: 'Nombre Persona', required: true },
  { key: 'businessName', label: 'Razón Social / Negocio', required: true },
  { key: 'source', label: 'Fuente del Dato' },
  { key: 'interest', label: 'Interés / Notas' },
  { key: 'estimatedPurchase', label: 'Potencial de Compra' }
];

const DynamicImportWizard: React.FC<DynamicImportWizardProps> = ({ onImport, onCancel }) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setCsvData(results.data);
        
        // Auto-mapeo inteligente inicial
        const initialMappings: FieldMapping[] = (results.meta.fields || []).map(h => {
          const header = h.toLowerCase();
          if (header.includes('nombre') || header.includes('persona')) return { csvHeader: h, target: 'name' };
          if (header.includes('negocio') || header.includes('empresa') || header.includes('razon')) return { csvHeader: h, target: 'businessName' };
          if (header.includes('fuente')) return { csvHeader: h, target: 'source' };
          if (header.includes('interes') || header.includes('nota')) return { csvHeader: h, target: 'interest' };
          if (header.includes('potencial') || header.includes('valor')) return { csvHeader: h, target: 'estimatedPurchase' };
          return { csvHeader: h, target: 'dynamic' }; // Por defecto a campo dinámico
        });

        setMappings(initialMappings);
        setStep('mapping');
        setIsProcessing(false);
      },
      error: () => {
        alert("Error al leer el archivo CSV.");
        setIsProcessing(false);
      }
    });
  };

  const updateMapping = (header: string, target: MappingTarget) => {
    setMappings(prev => prev.map(m => m.csvHeader === header ? { ...m, target } : m));
  };

  const transformData = (): Prospect[] => {
    return csvData.map((row, idx) => {
      const prospect: Partial<Prospect> = {
        id: `DYN-${Date.now()}-${idx}`,
        status: ProspectStatus.SIN_CALIFICAR,
        lastInteractionDate: new Date().toISOString(),
        totalPurchased: 0,
        repurchaseCount: 0,
        customFields: {}
      };

      mappings.forEach(m => {
        const val = row[m.csvHeader];
        if (m.target === 'ignore') return;
        
        if (m.target === 'dynamic') {
          prospect.customFields![m.csvHeader] = val;
        } else if (m.target === 'estimatedPurchase') {
          prospect.estimatedPurchase = parseFloat(val?.toString().replace(/[^\d.]/g, '') || '0');
        } else {
          // @ts-ignore
          prospect[m.target] = val?.toString() || '';
        }
      });

      return prospect as Prospect;
    });
  };

  const handleFinalImport = () => {
    const finalData = transformData();
    // Validación mínima: Verificar campos requeridos
    const hasInvalid = finalData.some(p => !p.businessName || !p.name);
    if (hasInvalid) {
      if (!confirm("Algunos registros no tienen Razón Social o Nombre. ¿Deseas importar los que sean válidos?")) return;
    }
    
    onImport(finalData.filter(p => p.businessName && p.name));
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
      {/* Stepper Header */}
      <div className="bg-slate-900 p-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-2xl transition-all ${step === 'upload' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-slate-800'}`}>
              <Upload size={20} className="text-white" />
           </div>
           <div className="h-px w-8 bg-slate-800"></div>
           <div className={`p-3 rounded-2xl transition-all ${step === 'mapping' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-slate-800'}`}>
              <Settings2 size={20} className="text-white" />
           </div>
           <div className="h-px w-8 bg-slate-800"></div>
           <div className={`p-3 rounded-2xl transition-all ${step === 'preview' ? 'bg-emerald-600 shadow-lg shadow-emerald-900/40' : 'bg-slate-800'}`}>
              <Eye size={20} className="text-white" />
           </div>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-500 hover:text-white transition-colors">
           <X size={24} />
        </button>
      </div>

      <div className="p-10">
        {step === 'upload' && (
          <div className="space-y-8 py-10">
            <div className="text-center max-w-sm mx-auto">
               <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Iniciador Maestro</h3>
               <p className="text-sm text-slate-400 font-medium mt-2 italic">Importa prospectos desde cualquier fuente (Maps, Lists, CRM Externo)</p>
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-100 rounded-[3.5rem] py-24 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group"
            >
               {isProcessing ? (
                 <Loader2 size={64} className="text-blue-600 animate-spin" />
               ) : (
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <FileText size={40} className="text-blue-500" />
                    </div>
                    <p className="text-lg font-black text-slate-700 uppercase tracking-tight">Seleccionar archivo CSV</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-widest">Detección automática de campos</p>
                 </div>
               )}
               <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
             <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Mapeador de Inteligencia</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vincula los datos a la estructura central</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <Sparkles size={14} /> Campos Sugeridos
                </div>
             </div>

             <div className="max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                         <th className="pb-4 px-2">Columna en CSV</th>
                         <th className="pb-4 px-2">Asignar a Campo CRM</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {mappings.map((m, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 px-2">
                              <p className="font-black text-slate-700 text-sm uppercase">{m.csvHeader}</p>
                              <p className="text-[9px] text-slate-400 font-medium italic">Ej: {csvData[0][m.csvHeader]?.toString().substring(0, 30) || 'Vacío'}</p>
                           </td>
                           <td className="py-4 px-2">
                              <select 
                                className={`w-full p-3 rounded-2xl text-[10px] font-black uppercase outline-none transition-all ${
                                  m.target === 'dynamic' ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' : 
                                  m.target === 'ignore' ? 'bg-slate-50 text-slate-400 border-2 border-transparent' : 
                                  'bg-white border-2 border-slate-100 text-blue-600'
                                }`}
                                value={m.target}
                                onChange={(e) => updateMapping(m.csvHeader, e.target.value as MappingTarget)}
                              >
                                 <option value="ignore">Ignorar Columna</option>
                                 <optgroup label="Campos Fijos AgriCRM">
                                    {FIXED_FIELDS.map(f => (
                                      <option key={f.key} value={f.key}>{f.label} {f.required ? '*' : ''}</option>
                                    ))}
                                 </optgroup>
                                 <optgroup label="Campos Flexibles">
                                    <option value="dynamic">✨ Crear como Campo Dinámico</option>
                                 </optgroup>
                              </select>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="pt-6 flex justify-between gap-4">
                <button onClick={() => setStep('upload')} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Atrás</button>
                <button onClick={() => setStep('preview')} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                   Continuar a Vista Previa <ArrowRight size={18} />
                </button>
             </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-white text-emerald-600 rounded-3xl shadow-xl">
                      <CheckCircle2 size={32} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Procesado con Éxito</h3>
                      <p className="text-sm text-emerald-700/70 font-medium italic">{csvData.length} registros listos para inserción.</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Campos Dinámicos</p>
                   <p className="text-2xl font-black text-emerald-900">{mappings.filter(m => m.target === 'dynamic').length}</p>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Previsualización del Primer Registro</p>
                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                   <div className="grid grid-cols-2 gap-8 mb-8">
                      {FIXED_FIELDS.filter(f => mappings.find(m => m.target === f.key)).map(field => (
                        <div key={field.key}>
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{field.label}</p>
                           <p className="text-sm font-black text-slate-800 uppercase">{transformData()[0][field.key] || '---'}</p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="pt-6 border-t border-slate-200/50">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <LayoutGrid size={12} /> Datos Adicionales (Custom Fields)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {Object.entries(transformData()[0].customFields).map(([k, v]) => (
                            <div key={k} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                               <span className="text-[9px] font-black text-slate-500 uppercase">{k}</span>
                               <span className="text-[10px] font-bold text-slate-700">{v?.toString() || 'N/A'}</span>
                            </div>
                         ))}
                         {Object.keys(transformData()[0].customFields).length === 0 && (
                            <p className="text-[10px] text-slate-400 italic">No se mapearon campos dinámicos.</p>
                         )}
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setStep('mapping')} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase text-xs">Editar Mapeo</button>
                <button onClick={handleFinalImport} className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-900/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                   <Database size={20} /> Ejecutar Importación Masiva
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicImportWizard;
