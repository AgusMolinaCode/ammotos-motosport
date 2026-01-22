"use server";

import { inventorySyncService } from "@/infrastructure/services/InventorySyncService";
import { prisma } from "@/infrastructure/database/prisma";

/**
 * SERVER ACTION: Obtener inventario por marca
 *
 * Obtiene el inventario completo de una marca desde Turn14 API
 * @param brandId - ID de la marca
 * @returns Map de item_id → información de stock
 */
export async function getInventoryByBrand(brandId: number) {
  try {
    const inventoryMap = await inventorySyncService.getInventoryByBrand(brandId);

    // Convertir Map a objeto plano para serialización
    const inventoryObject: Record<string, {
      totalStock: number;
      hasStock: boolean;
      inventory: Record<string, number>;
      manufacturer: {
        stock: number;
        esd: string;
      } | null;
    }> = {};

    inventoryMap.forEach((item, itemId) => {
      inventoryObject[itemId] = {
        totalStock: inventorySyncService.calculateTotalStock(item),
        hasStock: inventorySyncService.hasStock(item),
        inventory: item.attributes.inventory,
        manufacturer: item.attributes.manufacturer ?? null,
      };
    });

    return inventoryObject;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
}

/**
 * SERVER ACTION: Obtener inventario por IDs de productos
 *
 * Obtiene el inventario de productos específicos desde la base de datos
 * Útil para páginas de categorías donde hay productos de múltiples marcas
 * @param productIds - Array de IDs de productos
 * @returns Objeto con información de stock por producto
 */
export async function getInventoryByProductIds(productIds: string[]) {
  try {
    const inventoryItems = await prisma.brandInventory.findMany({
      where: {
        itemId: { in: productIds },
      },
    });

    const inventoryObject: Record<string, {
      totalStock: number;
      hasStock: boolean;
      inventory: Record<string, number>;
      manufacturer: {
        stock: number;
        esd: string;
      } | null;
    }> = {};

    inventoryItems.forEach((item) => {
      inventoryObject[item.itemId] = {
        totalStock: Number(item.totalStock),
        hasStock: Number(item.totalStock) > 0,
        inventory: item.inventory as Record<string, number>,
        manufacturer:
          item.manufacturerStock !== null && item.manufacturerEsd !== null
            ? {
                stock: item.manufacturerStock,
                esd: item.manufacturerEsd,
              }
            : null,
      };
    });

    console.log(
      `✅ Loaded ${inventoryItems.length} inventory items from database for ${productIds.length} products`
    );

    return inventoryObject;
  } catch (error) {
    console.error("Error fetching inventory by product IDs:", error);
    throw error;
  }
}
