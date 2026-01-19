
import React from 'react';
import { 
  LayoutDashboard, Users, Sprout, Menu, X, ShoppingCart, 
  ShieldCheck, LogOut, ClipboardList, Database,
  Wallet, PackageSearch, Target, BarChart3, Package, 
  Settings, Truck, Inbox, FileSpreadsheet, Calendar,
  Wand2, FileDown
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

// Fix: Moved MapPin definition to top-level scope to avoid hoisting/scoping issues within the Layout component
const MapPin = ({size, className}: {size: number, className?: string}) => <span className={className}>📍</span>;

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Grupos de navegación organizados
  const menuGroups = [
    {
      title: 'Operativo',
      items: [
        { id: 'dashboard', label: 'Dashboard AI', icon: LayoutDashboard, roles: ['superadmin', 'master_admin', 'lider_comercial', 'kam_junior', 'auditoria'] as UserRole[] },
        { id: 'route', label: 'Mi Hoja de Ruta', icon: MapPin, roles: ['superadmin', 'master_admin', 'kam_junior'] as UserRole[] },
        { id: 'planner', label: 'Planner Comercial', icon: Calendar, roles: ['superadmin', 'master_admin', 'kam_junior', 'lider_comercial'] as UserRole[] },
        { id: 'orders', label: 'Terminal Ventas', icon: ShoppingCart, roles: ['superadmin', 'master_admin', 'kam_junior'] as UserRole[] },
        { id: 'sales_wizard', label: 'Mago de Ventas', icon: Wand2, roles: ['superadmin', 'master_admin', 'kam_junior'] as UserRole[] },
      ]
    },
    {
      title: 'Prospección y KAM',
      items: [
        { id: 'prospects', label: 'Funnel Oportunidades', icon: Target, roles: ['superadmin', 'master_admin', 'kam_junior', 'lider_comercial'] as UserRole[] },
        { id: 'prospect_import', label: 'Importar Leads', icon: FileDown, roles: ['superadmin', 'master_admin', 'lider_comercial'] as UserRole[] },
      ]
    },
    {
      title: 'Backoffice y Logística',
      items: [
        { id: 'summaries', label: 'Resúmenes BI', icon: BarChart3, roles: ['superadmin', 'master_admin', 'lider_comercial', 'auditoria'] as UserRole[] },
        { id: 'logistica', label: 'Logística Despacho', icon: Truck, roles: ['superadmin', 'master_admin', 'entregador'] as UserRole[] },
        { id: 'cartera', label: 'Maestro Cartera', icon: Wallet, roles: ['superadmin', 'master_admin', 'jefe_cartera'] as UserRole[] },
        { id: 'inventory_entry', label: 'Entradas Almacén', icon: Inbox, roles: ['superadmin', 'master_admin', 'jefe_bodega', 'jefe_produccion'] as UserRole[] },
        { id: 'inventory_audit', label: 'Auditoría Técnica', icon: PackageSearch, roles: ['superadmin', 'master_admin', 'auditoria'] as UserRole[] },
      ]
    },
    {
      title: 'Infraestructura',
      items: [
        { id: 'clients', label: 'Maestro Clientes', icon: Users, roles: ['superadmin', 'master_admin', 'admin', 'lider_comercial'] as UserRole[] },
        { id: 'products_mgt', label: 'Maestro Productos', icon: Package, roles: ['superadmin', 'master_admin', 'jefe_bodega'] as UserRole[] },
        { id: 'tomapedidos_clients', label: 'Espejo Tomapedidos', icon: FileSpreadsheet, roles: ['superadmin', 'master_admin', 'auditoria'] as UserRole[] },
        { id: 'users_mgt', label: 'Gestión de Equipo', icon: ShieldCheck, roles: ['superadmin', 'master_admin', 'admin'] as UserRole[] },
        { id: 'sync', label: 'Pasarela de Datos', icon: Database, roles: ['superadmin', 'master_admin', 'auditoria'] as UserRole[] },
        { id: 'config', label: 'Configuración', icon: Settings, roles: ['superadmin', 'master_admin'] as UserRole[] },
      ]
    }
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] font-sans">
      {/* Móvil: Header */}
      <div className="md:hidden bg-[#0f172a] text-white p-4 flex justify-between items-center sticky top-0 z-[70]">
        <div className="flex items-center gap-2">
          <Sprout size={24} className="text-emerald-400" />
          <span className="font-black text-lg tracking-tighter uppercase">AgriCRM</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-white/10 rounded-xl">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Principal */}
      <aside className={`${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-[60] w-72 bg-[#0f172a] text-slate-50 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl`}>
        <div className="p-8 hidden md:flex items-center gap-4 border-b border-white/5">
          <div className="p-3 bg-[#0056b2] rounded-2xl shadow-lg shadow-blue-900/40">
             <Sprout size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">AgriCRM</h1>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Master Edition</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {menuGroups.map((group, idx) => {
            // REPARACIÓN CRÍTICA: master_admin ve TODO el menú (bypass total de roles)
            const isMaster = user.role === 'master_admin';
            const visibleItems = group.items.filter(item => isMaster || item.roles.includes(user.role));
            
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx}>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">{group.title}</p>
                 <div className="space-y-1">
                   {visibleItems.map((item) => (
                     <button
                       key={item.id}
                       onClick={() => handleTabChange(item.id)}
                       className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all
                         ${activeTab === item.id ? 'bg-[#0056b2] text-white shadow-xl' : 'hover:bg-white/5 text-slate-400'}`}
                     >
                       <item.icon size={18} /> {item.label}
                     </button>
                   ))}
                 </div>
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-900/30">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-900/20">{user.name.charAt(0)}</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black uppercase text-slate-200 truncate">{user.name}</p>
              <p className="text-[8px] font-bold text-blue-400 truncate uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
             <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
