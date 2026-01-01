"use server";

import { inventorySyncService } from "@/infrastructure/services/InventorySyncService";

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
