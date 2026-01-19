
import { Client, Product, SystemConfig, PriceListDetail } from '../types';

/**
 * Calcula el precio unitario para un cliente específico basado en su lista de precios
 * y la configuración maestra del sistema.
 */
export const calculateB2BPrice = (
  client: Client, 
  product: Product, 
  systemConfig: SystemConfig
): { price: number; isSpecial: boolean; minQty: number } => {
  
  // Buscar en el detalle de listas de precios (Maestro Detalle)
  const specialPrice = systemConfig.priceListDetails.find(
    detail => detail.listId === client.priceListId && detail.productId === product.code
  );

  if (specialPrice) {
    return {
      price: specialPrice.price,
      isSpecial: true,
      minQty: specialPrice.minQty
    };
  }

  // Si no hay precio especial, retornar el base del producto
  return {
    price: product.basePrice,
    isSpecial: false,
    minQty: 1
  };
};
