
/**
 * ROLES DE USUARIO - Definición Estricta
 */
export type UserRole = 
  | 'superadmin'
  | 'admin'
  | 'master_admin' 
  | 'lider_comercial' 
  | 'lider_mercadeo' 
  | 'kam_junior' 
  | 'entregador' 
  | 'jefe_bodega' 
  | 'jefe_cartera' 
  | 'jefe_produccion' 
  | 'auditoria';

/**
 * ESTADOS Y TIPOS DE ENTIDADES
 */
export type UserStatus = 'active' | 'inactive';

export enum ClientStatus {
  ACTIVO = 'Activo / Vigente',
  INACTIVO = 'Inactivo',
  PROSPECTO = 'Prospecto',
  BLOQUEADO = 'Bloqueado',
  FRIO = 'Frío',
  CALIFICADO = 'Calificado'
}

export type ClientType = 'tradicional' | 'institucional';
export type ProductStatus = 'active' | 'inactive';
export type ProductUnit = 'bulto' | 'litro' | 'kilo' | 'tonelada' | 'UND';
export type OrderStatus = 'draft' | 'pending_approval' | 'approved' | 'dispatching' | 'delivered' | 'cancelled' | 'Creado';
export type PaymentMethod = 'cash' | 'credit' | 'transfer' | 'CONTADO' | 'Transferencia' | 'Cash';
export type SyncStatus = 'synced' | 'pending';
export type InteractionType = 'visita_tecnica' | 'visita_comercial' | 'cobro' | 'entrega_muestra' | 'llamada';

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TaskCategory {
  VISIT = 'VISIT',
  COLLECTION = 'COLLECTION',
  TECHNICAL = 'TECHNICAL',
  ADMIN = 'ADMIN'
}

export enum RouteType {
  TRADICIONAL = 'TRADICIONAL',
  INSTITUCIONAL = 'INSTITUCIONAL'
}

export enum VisitFrequency {
  SEMANAL = 'SEMANAL',
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL'
}

export enum ProspectStatus {
  SIN_CALIFICAR = 'SIN_CALIFICAR',
  CALIFICADO = 'CALIFICADO',
  SEGUIMIENTO = 'SEGUIMIENTO',
  CERRADO_CLIENTE = 'CERRADO_CLIENTE'
}

/**
 * MAESTROS AUXILIARES Y CONFIGURACIÓN
 */

export interface PriceListDetail {
  listId: string; // 'PR001'
  productId: string; // 'AG001'
  price: number;
  minQty: number;
}

export interface RouteConfig {
  id: string;
  name: string;
}

export interface NoSaleReasonConfig {
  id: string;
  name: string;
}

export interface SellerConfig {
  id: string;
  name: string;
  active: boolean;
}

export interface SystemConfig {
  routes: RouteConfig[];
  noSaleReasons: NoSaleReasonConfig[];
  sellers: SellerConfig[];
  priceListDetails: PriceListDetail[];
  globalConfig: Record<string, any>;
}

/**
 * INTERFACES DEL SISTEMA
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  leaderId?: string;
  phone?: string;
  lastLogin?: string;
}

export interface ClientLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Client {
  id: string;
  name: string;
  businessName: string;
  nit: string;
  docType?: string;
  docNumber: string;
  contactName: string;
  address: string;
  phone: string;
  email: string;
  zone: string;
  routes: string[];
  priceListId: string;
  priceList?: string;
  type: ClientType;
  status: ClientStatus;
  location: ClientLocation;
  creditLimit: number;
  discountRate: number;
  currentDebt: number;
  lastVisit?: string;
  lastVisitDate?: string;
  routeId: string;
  city: string;
  neighborhood?: string;
  state?: string;
  country?: string;
  mobile: string;
  isActive: boolean;
  takeOrderWithDebt: boolean;
  visitOrder: number;
  routeType?: RouteType;
  frequency?: VisitFrequency;
  branchCode?: string;
  businessType?: string;
  firstName?: string;
  secondName?: string;
  lastName?: string;
  secondLastName?: string;
  decisionMaker?: string;
  responsiblePerson?: string;
  vendorId?: string;
  paymentMethods?: string;
  minOrder?: number;
  longitude?: number;
  latitude?: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  basePrice: number;
  taxRate: number;
  stock: number;
  inventory: number;
  reorderPoint: number;
  unit: ProductUnit;
  presentation: string;
  status: ProductStatus;
}

export interface OrderItem {
  productId: string;
  productCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  sellerId: string;
  vendorName: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  totalAmount: number;
  totalTax: number;
  totalDiscount: number;
  total: number;
  deliveryDate: string;
  paymentMethod: PaymentMethod;
  evidenceUrl?: string;
  syncStatus: SyncStatus;
  comments?: string;
  type?: RouteType;
}

export interface Config {
  zones: string[];
  routes: string[];
  priceLists: string[];
  activityTypes: ActivityType[];
}

export type NoVentaReason = 'SIN_DINERO' | 'STOCK_LLENO' | 'CERRADO' | 'DUENO_AUSENTE' | 'COMPRA_COMPETENCIA';

export interface NoVentaRecord {
  id: string;
  clientId: string;
  clientName: string;
  vendorName: string;
  date: string;
  reason: string;
  observations: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  route: string;
  deliveryMan: string;
  status: 'Cargado' | 'Efectiva' | 'Devuelta';
  clientName: string;
  address: string;
  phone: string;
  totalCharged: number;
  totalDelivered: number;
  totalReturned: number;
  totalCollected: number;
  paymentMethod: PaymentMethod;
  comments?: string;
  weightKg?: number;
  evidence?: string[];
}

export interface ActivityType {
  id: string;
  name: string;
  icon: string;
  color: string;
  points: number;
}

export interface InventoryEntry {
  id: string;
  date: string;
  productCode: string;
  productName: string;
  quantity: number;
  supplier: string;
  batch?: string;
  notes?: string;
}

export interface PlannedActivity {
  id: string;
  date: string;
  clientName: string;
  type: string;
  status: string;
}

export interface Profile {
  id: string;
  name: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  businessId: string;
  establishmentId?: string;
  phone: string;
  email?: string;
  birthday?: string;
  notes?: string;
  isSyncedWithGoogle?: boolean;
}

export interface Business {
  id: string;
  legalName: string;
  nit: string;
  category: 'Distribuidor' | 'Productor' | 'Cooperativa';
  website?: string;
}

// Added missing interface for Prospect
export interface Prospect {
  id: string;
  name: string;
  businessName: string;
  interest: string;
  status: ProspectStatus;
  lastInteractionDate: string;
  estimatedPurchase: number;
  totalPurchased: number;
  repurchaseCount: number;
  source?: string;
  customFields: Record<string, any>;
}

// Added missing interface for Opportunity
export interface Opportunity {
  id: string;
  clientId: string;
  value: number;
  status: string;
}

// Added missing interface for TechnicalSample
export interface TechnicalSample {
  id: string;
  clientId: string;
  productId: string;
  date: string;
}

// Added missing interface for Task
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  clientId: string;
  createdById: string;
  createdAt: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
}

// Added missing interface for CarteraItem
export interface CarteraItem {
  clientId: string;
  clientName: string;
  docTypeCode: 'RC' | 'FV';
  docNumber: string;
  orderNumber: string;
  docDate: string;
  expiryDate: string;
  value: number;
  balance: number;
}

// Added missing interface for RouteAssignment
export interface RouteAssignment {
  routeId: string;
  clientId: string;
  day: string;
  order: number;
}
