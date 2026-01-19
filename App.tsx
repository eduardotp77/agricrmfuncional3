
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientManagement from './components/ClientManagement';
import TaskManager from './components/TaskManager';
import ProspectsModule from './components/ProspectsModule';
import OrderManagement from './components/OrderManagement';
import ReportsModule from './components/ReportsModule';
import CarteraModule from './components/CarteraModule';
import ProductManagement from './components/ProductManagement';
import InventoryEntryModule from './components/InventoryEntryModule';
import SyncModule from './components/SyncModule';
import UserManagement from './components/UserManagement';
import AIChatBot from './components/AIChatBot';
import AuthScreen from './components/Auth/AuthScreen';
import RouteManager from './components/RouteManager';
import ConfigModule from './components/ConfigModule';
import DeliveryLogistics from './components/DeliveryLogistics';
import InventoryAuditForm from './components/InventoryAudit';
import TomapedidosClientTable from './components/TomapedidosClientTable';
import CommercialPlanner from './components/CommercialPlanner';
import SalesWizard from './components/SalesWizard';
import ProspectImport from './components/ProspectImport';
import { AlertCircle, RefreshCw as RefreshIcon } from 'lucide-react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  Client, Order, Product, User, Task, Prospect, CarteraItem, Delivery, UserRole, 
  Config, NoVentaRecord, InventoryEntry
} from './types';
import { INITIAL_CONFIG, SAMPLE_CLIENTS, SAMPLE_PRODUCTS } from './constants';

const AppContent: React.FC = () => {
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [config, setConfig] = useState<Config>(() => {
    const saved = localStorage.getItem('agri_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('agri_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('agri_clients');
    return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : SAMPLE_CLIENTS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('agri_products');
    return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : SAMPLE_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('agri_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartera, setCartera] = useState<CarteraItem[]>(() => {
    const saved = localStorage.getItem('agri_cartera');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('agri_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [prospects, setProspects] = useState<Prospect[]>(() => {
    const saved = localStorage.getItem('agri_prospects');
    return saved ? JSON.parse(saved) : [];
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem('agri_deliveries');
    return saved ? JSON.parse(saved) : [];
  });

  const [noVentas, setNoVentas] = useState<NoVentaRecord[]>(() => {
    const saved = localStorage.getItem('agri_noventas');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (users.length > 0) localStorage.setItem('agri_users', JSON.stringify(users));
    localStorage.setItem('agri_clients', JSON.stringify(clients));
    localStorage.setItem('agri_products', JSON.stringify(products));
    localStorage.setItem('agri_orders', JSON.stringify(orders));
    localStorage.setItem('agri_cartera', JSON.stringify(cartera));
    localStorage.setItem('agri_tasks', JSON.stringify(tasks));
    localStorage.setItem('agri_prospects', JSON.stringify(prospects));
    localStorage.setItem('agri_deliveries', JSON.stringify(deliveries));
    localStorage.setItem('agri_noventas', JSON.stringify(noVentas));
  }, [users, clients, products, orders, cartera, tasks, prospects, deliveries, noVentas]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'entregador') setActiveTab('logistica');
      else if (currentUser.role === 'superadmin' || currentUser.role === 'master_admin') setActiveTab('dashboard');
      else setActiveTab('route');
    }
  }, [currentUser]);

  if (authLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <RefreshIcon className="text-blue-500 animate-spin" size={48} />
    </div>
  );

  if (!isAuthenticated) return <AuthScreen />;

  // DEFINICIÓN DE PERMISOS MAESTROS
  const allAccess: UserRole[] = ['superadmin', 'master_admin'];

  const tabPermissions: Record<string, UserRole[]> = {
    'dashboard': [...allAccess, 'admin', 'lider_comercial', 'auditoria'],
    'summaries': [...allAccess, 'admin', 'lider_comercial', 'auditoria'],
    'route': [...allAccess, 'lider_comercial', 'kam_junior'],
    'planner': [...allAccess, 'lider_comercial', 'kam_junior'],
    'sales_wizard': [...allAccess, 'kam_junior'],
    'orders': [...allAccess, 'kam_junior'],
    'prospects': [...allAccess, 'lider_comercial', 'kam_junior'],
    'prospect_import': [...allAccess, 'lider_comercial'],
    'logistica': [...allAccess, 'entregador'],
    'inventory_entry': [...allAccess, 'jefe_bodega', 'jefe_produccion'],
    'inventory_audit': [...allAccess, 'auditoria'],
    'products_mgt': [...allAccess, 'jefe_bodega'],
    'cartera': [...allAccess, 'jefe_cartera'],
    'tasks': [...allAccess, 'lider_comercial', 'kam_junior'],
    'clients': [...allAccess, 'admin', 'lider_comercial', 'kam_junior'],
    'tomapedidos_clients': [...allAccess, 'auditoria'],
    'config': [...allAccess],
    'sync': [...allAccess, 'admin', 'auditoria'],
    'users_mgt': [...allAccess, 'admin', 'lider_comercial']
  };

  const renderContent = () => {
    if (!currentUser) return null;
    const allowed = tabPermissions[activeTab] || [];
    if (!allowed.includes(currentUser.role)) {
      return (
        <div className="p-20 text-center space-y-4">
           <AlertCircle size={64} className="text-red-500 mx-auto" />
           <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Acceso Restringido</h2>
           <p className="text-slate-400 font-medium italic">Tu rol ({currentUser.role}) no tiene permisos para esta terminal.</p>
           <button onClick={() => setActiveTab('dashboard')} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Volver al Inicio</button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard clients={clients} opportunities={[]} samples={[]} prospects={prospects} orders={orders} />;
      case 'summaries': return <ReportsModule orders={orders} noVentas={noVentas} clients={clients} products={products} />;
      case 'route': return <RouteManager clients={clients} onSelectClient={() => setActiveTab('orders')} />;
      case 'planner': return <CommercialPlanner clients={clients} onAddActivity={() => {}} />;
      // Fix: Changed invalid onAddSuggested prop to onAddOrder to correctly update the central orders state in App.tsx
      case 'sales_wizard': return <SalesWizard client={clients[0]} products={products} onAddOrder={o => setOrders(prev => [o, ...prev])} />;
      case 'orders': return <OrderManagement products={products} clients={clients} orders={orders} onSaveOrder={o => setOrders(prev => [o, ...prev])} onSaveNoVenta={nv => setNoVentas(prev => [nv, ...prev])} />;
      case 'prospects': return <ProspectsModule prospects={prospects} onAddProspect={p => setProspects(prev => [p, ...prev])} onMoveProspect={(id, s) => setProspects(prev => prev.map(p => p.id === id ? {...p, status: s} : p))} onImportProspects={p => setProspects(prev => [...p, ...prev])} />;
      case 'prospect_import': return <ProspectImport onImport={(p) => { setProspects(prev => [...p, ...prev]); setActiveTab('prospects'); }} />;
      case 'logistica': return <DeliveryLogistics deliveries={deliveries} onImportDeliveries={setDeliveries} onUpdateDelivery={(id, up) => setDeliveries(prev => prev.map(d => d.id === id ? {...d, ...up} : d))} />;
      case 'inventory_entry': return <InventoryEntryModule products={products} onAddEntry={(e: InventoryEntry) => {}} />;
      case 'inventory_audit': return <InventoryAuditForm products={products} clients={clients} onSaveAudit={() => {}} />;
      case 'products_mgt': return <ProductManagement products={products} onUpdateProduct={p => setProducts(prev => prev.map(pr => pr.code === p.code ? p : pr))} onAddProduct={p => setProducts(prev => [...prev, p])} />;
      case 'cartera': return <CarteraModule cartera={cartera} clients={clients} onImportCartera={setCartera} />;
      case 'tasks': return <TaskManager tasks={tasks} users={users} clients={clients} currentUser={currentUser} onAddTask={t => setTasks(prev => [t, ...prev])} onUpdateTask={(id, up) => setTasks(prev => prev.map(t => t.id === id ? {...t, ...up} : t))} />;
      case 'clients': return <ClientManagement clients={clients} config={config} prospects={prospects} onAddClient={c => setClients(prev => [...prev, c])} onUpdateClient={c => setClients(prev => prev.map(cl => cl.id === c.id ? c : cl))} onDeleteClient={id => setClients(prev => prev.filter(cl => cl.id !== id))} onFusionProspect={() => {}} onBulkAddClients={nc => setClients(prev => [...prev, ...nc])} />;
      case 'tomapedidos_clients': return <TomapedidosClientTable clients={clients} onAddClient={c => setClients(prev => [...prev, c])} onUpdateClient={c => setClients(prev => prev.map(cl => cl.id === c.id ? c : cl))} />;
      case 'config': return <ConfigModule config={config} onUpdateConfig={setConfig} />;
      case 'users_mgt': return <UserManagement users={users} onUpdateUser={(id, up) => setUsers(prev => prev.map(u => u.id === id ? {...u, ...up} : u))} onBulkAddUsers={nu => setUsers(prev => [...prev, ...nu])} />;
      case 'sync': return <SyncModule onImportOrders={setOrders} onImportClients={setClients} onImportProducts={setProducts} onImportCartera={setCartera} orders={orders} clients={clients} products={products} />;
      default: return <Dashboard clients={clients} opportunities={[]} samples={[]} prospects={prospects} orders={orders} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser!} onLogout={() => {}}>
      {renderContent()}
      <AIChatBot />
    </Layout>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
