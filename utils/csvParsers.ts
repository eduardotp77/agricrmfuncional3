
import { Client, Product, ClientStatus, RouteType, ProductStatus, ProductUnit } from '../types';

/**
 * Parsea datos de CSV de Clientes
 * Mapeo: CÓDIGO -> id, NOMBRE -> businessName, NIT -> nit, RUTAS -> routes
 */
export const parseClientsCSV = (data: any[]): { valid: Client[], errors: string[] } => {
  const valid: Client[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +1 header, +1 base 1
    const id = row['CÓDIGO'] || row['ID'] || row['CODIGO'];
    
    if (!id) {
      errors.push(`Fila ${rowNum}: Falta 'CÓDIGO' del cliente.`);
      return;
    }

    const businessName = row['NOMBRE'] || row['RAZÓN SOCIAL'] || row['NEGOCIO'] || 'Sin Nombre';
    const nit = row['NIT'] || row['DOCUMENTO'] || '0';
    const rawRoutes = row['RUTAS'] || row['RUTA'] || '';
    const routes = rawRoutes.toString().split(/[;,]/).map((r: string) => r.trim()).filter((r: string) => r !== '');

    // Fix: Added missing required properties 'name' and 'docNumber' to satisfy Client interface
    valid.push({
      id: id.toString(),
      name: businessName.toString(),
      businessName: businessName.toString(),
      nit: nit.toString(),
      docNumber: nit.toString(),
      contactName: row['CONTACTO'] || businessName,
      address: row['DIRECCIÓN'] || row['DIRECCION'] || 'No registrada',
      phone: row['TELÉFONO'] || row['CELULAR'] || '',
      email: row['EMAIL'] || '',
      zone: row['ZONA'] || row['POBLACIÓN'] || 'General',
      routes: routes,
      priceListId: row['LISTA PRECIO'] || 'PR001',
      type: (row['TIPO']?.toString().toLowerCase() === 'institucional') ? 'institucional' : 'tradicional',
      status: ClientStatus.ACTIVO, // Fixed: Use enum value instead of string "active"
      location: {
        lat: parseFloat(row['LATITUD'] || '7.1193'),
        lng: parseFloat(row['LONGITUD'] || '-73.1198'),
        address: row['DIRECCIÓN']
      },
      creditLimit: parseFloat(row['CUPO'] || '0'),
      discountRate: parseFloat(row['DESCUENTO'] || '0'),
      currentDebt: parseFloat(row['SALDO'] || '0'),
      lastVisit: row['ULT_VISITA'],
      city: row['CIUDAD'] || 'Bucaramanga',
      mobile: row['CELULAR'] || '',
      isActive: true,
      takeOrderWithDebt: false,
      visitOrder: 1,
      routeId: row['RUTA'] || 'GENERAL'
    });
  });

  return { valid, errors };
};

/**
 * Parsea datos de CSV de Productos
 * Mapeo: CÓDIGO -> id, DESCRIPCIÓN -> name, PRECIO BASE -> basePrice, SALDO -> stock
 */
export const parseProductsCSV = (data: any[]): { valid: Product[], errors: string[] } => {
  const valid: Product[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;
    const id = row['CÓDIGO'] || row['ID'] || row['PLU'];

    if (!id) {
      errors.push(`Fila ${rowNum}: Falta 'CÓDIGO' del producto.`);
      return;
    }

    const name = row['DESCRIPCIÓN'] || row['NOMBRE'] || row['DESCRIPCION'] || 'Producto sin nombre';
    const basePrice = parseFloat(row['PRECIO BASE'] || row['PRECIO'] || '0');
    const stock = parseFloat(row['SALDO'] || row['STOCK'] || row['EXISTENCIA'] || '0');

    // Added code and inventory properties to satisfy Product interface
    valid.push({
      id: id.toString(),
      code: id.toString(),
      name: name.toString(),
      category: row['CATEGORÍA'] || row['CATEGORIA'] || 'General',
      basePrice: basePrice,
      taxRate: parseFloat(row['IVA'] || '0.19'),
      stock: stock,
      inventory: stock,
      reorderPoint: parseFloat(row['PUNTO REORDEN'] || '10'),
      unit: (row['UNIDAD']?.toString() as ProductUnit) || 'UND',
      presentation: row['PRESENTACIÓN'] || 'Estándar',
      status: 'active'
    });
  });

  return { valid, errors };
};

/**
 * Parsea datos de Cartera para actualizar currentDebt
 * Mapeo: CÓDIGO CLIENTE -> id, SALDO -> currentDebt
 */
export const parsePortfolioCSV = (data: any[]): { updates: { id: string, debt: number }[], errors: string[] } => {
  const updates: { id: string, debt: number }[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;
    const clientId = row['CÓDIGO CLIENTE'] || row['CODIGO CLIENTE'] || row['ID CLIENTE'];
    const debt = parseFloat(row['SALDO'] || row['DEUDA'] || row['VALOR'] || '0');

    if (!clientId) {
      errors.push(`Fila ${rowNum}: Falta 'CÓDIGO CLIENTE' en cartera.`);
      return;
    }

    updates.push({ id: clientId.toString(), debt });
  });

  return { updates, errors };
};
