
import { UserRole, ClientType, InteractionType, Config, Client, Product, ClientStatus } from './types';

/**
 * CONFIGURACIÓN GEOGRÁFICA PREDETERMINADA (Bucaramanga, Santander)
 */
export const DEFAULT_COORDINATES = {
  lat: 7.1193,
  lng: -73.1198
};

/**
 * LABELS AMIGABLES PARA ROLES (UI)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Administrador',
  admin: 'Administrador',
  master_admin: 'Administrador Maestro',
  lider_comercial: 'Gerente Comercial',
  lider_mercadeo: 'Director de Mercadeo',
  kam_junior: 'Key Account Manager (KAM)',
  entregador: 'Logística de Despacho',
  jefe_bodega: 'Gestor de Almacén',
  jefe_cartera: 'Analista de Cartera',
  jefe_produccion: 'Director de Planta',
  auditoria: 'Auditoría Técnica'
};

/**
 * CATEGORÍAS DE INTERACCIÓN (CRM)
 */
export const INTERACTION_TYPES: { id: InteractionType; label: string; color: string }[] = [
  { id: 'visita_tecnica', label: '🚜 Visita Técnica', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'visita_comercial', label: '🤝 Visita Comercial', color: 'bg-blue-100 text-blue-700' },
  { id: 'cobro', label: '💰 Gestión de Cobro', color: 'bg-red-100 text-red-700' },
  { id: 'entrega_muestra', label: '📦 Entrega de Muestra', color: 'bg-amber-100 text-amber-700' },
  { id: 'llamada', label: '📞 Seguimiento Telefónico', color: 'bg-purple-100 text-purple-700' }
];

/**
 * TIPOS DE CLIENTES
 */
export const CLIENT_TYPES: { id: ClientType; label: string }[] = [
  { id: 'tradicional', label: 'Canal Tradicional (TAT)' },
  { id: 'institucional', label: 'Canal Institucional (B2B)' }
];

/**
 * CONFIGURACIÓN DE LISTAS DE PRECIOS
 */
export const PRICE_LISTS = [
  { id: 'PR001', label: 'Lista Base Mayorista' },
  { id: 'PR002', label: 'Lista Institucional Especial' },
  { id: 'PR003', label: 'Lista Retail / TAT' }
];

/**
 * CONFIGURACIÓN DE RUTAS MAESTRAS (Ejemplos)
 */
export const MASTER_ROUTES = [
  'Lunes - Norte',
  'Martes - Piedecuesta',
  'Miércoles - Girón',
  'Jueves - Floridablanca',
  'Viernes - Centro',
  'Sábado - Lebrija'
];

export const INITIAL_CONFIG: Config = {
  zones: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Lebrija'],
  routes: ['BUG001', 'PID003', 'FLO001', 'GENERAL'],
  priceLists: ['PR001', 'PR002', 'PR003'],
  activityTypes: [
    { id: 'act-1', name: 'Visita Comercial', icon: 'Handshake', color: 'bg-blue-50 text-blue-600', points: 10 },
    { id: 'act-2', name: 'Entrega de Muestra', icon: 'Package', color: 'bg-emerald-50 text-emerald-600', points: 15 },
  ]
};

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'C10',
    name: 'TIENDA DONDE RICARDO',
    businessName: 'Ricardo Sierra',
    nit: '123456789-1',
    docNumber: '123456789',
    contactName: 'Ricardo Sierra',
    address: 'Calle 10 # 20-30',
    phone: '3151234567',
    mobile: '3151234567',
    email: 'ricardo@tienda.com',
    zone: 'Norte',
    city: 'Bucaramanga',
    routeId: 'BUG001',
    routes: ['Lunes-Norte'],
    priceListId: 'PR001',
    priceList: 'PR001',
    type: 'tradicional',
    status: ClientStatus.ACTIVO,
    location: { lat: 7.1193, lng: -73.1198 },
    creditLimit: 1000000,
    discountRate: 0.05,
    currentDebt: 0,
    isActive: true,
    takeOrderWithDebt: false,
    visitOrder: 1
  }
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'P1',
    code: 'AG001',
    name: 'AGUA BOT. 300 ML X 24UD',
    category: 'LÍQUIDOS',
    basePrice: 12000,
    taxRate: 0.19,
    stock: 100,
    inventory: 100,
    reorderPoint: 20,
    unit: 'UND',
    presentation: 'Caja x 24',
    status: 'active'
  }
];
