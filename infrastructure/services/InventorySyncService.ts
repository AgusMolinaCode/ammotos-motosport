import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { prisma } from "@/infrastructure/database/prisma";
import type {
  BrandInventoryResponse,
  InventoryItem,
} from "@/domain/types/turn14/inventory";

/**
 * INFRASTRUCTURE SERVICE: Inventory Sync Service with Cache
 *
 * Implementa sistema de caché lazy-loading + TTL para inventarios:
 * 1. Primera llamada: Fetch desde Turn14 API → Cache en DB
 * 2. Llamadas subsecuentes: Lectura desde DB (si caché < 2 días)
 * 3. Caché expirado: Re-fetch desde API y actualizar DB
 *
 * El inventario cambia periódicamente, por lo que usamos TTL de 2 días
 */
export class InventorySyncService {
  private static readonly CACHE_TTL_DAYS = 2; // Renovar caché cada 2 días

  /**
   * Obtener inventario de una marca con sistema de caché
   * @param brandId - ID de la marca
   * @returns Map de item_id → información de inventario
   */
  async getInventoryByBrand(
    brandId: number
  ): Promise<Map<string, InventoryItem>> {
    try {
      // Verificar si el caché existe y es válido
      const cacheControl = await prisma.inventoryCache.findUnique({
        where: { brandId },
      });

      if (cacheControl) {
        const daysSinceCache =
          (Date.now() - cacheControl.cachedAt.getTime()) / (1000 * 60 * 60 * 24);

        // Caché válido (< 2 días)
        if (daysSinceCache < InventorySyncService.CACHE_TTL_DAYS) {
          console.log(
            `📦 Inventory Cache HIT: Brand ${brandId} (${daysSinceCache.toFixed(1)} días old)`
          );
          return this.getInventoryFromDatabase(brandId);
        }

        // Caché expirado (> 2 días) - Renovar
        console.log(
          `♻️  Inventory Cache STALE: Brand ${brandId} (${daysSinceCache.toFixed(1)} días old) - Refreshing...`
        );
        await this.invalidateCache(brandId);
      } else {
        console.log(
          `🌐 Inventory Cache MISS: Fetching from API - Brand ${brandId}`
        );
      }

      // Fetch desde API y guardar en DB
      return this.fetchAndCacheInventory(brandId);
    } catch (error) {
      console.error(`❌ Error fetching inventory for brand ${brandId}:`, error);

      // Si hay error con la API pero tenemos caché (aunque esté expirado), usarlo
      const cacheControl = await prisma.inventoryCache.findUnique({
        where: { brandId },
      });

      if (cacheControl) {
        console.log(
          `⚠️  Using stale cache for brand ${brandId} due to API error`
        );
        return this.getInventoryFromDatabase(brandId);
      }

      throw error;
    }
  }

  /**
   * Leer inventario desde la base de datos
   */
  private async getInventoryFromDatabase(
    brandId: number
  ): Promise<Map<string, InventoryItem>> {
    const inventoryItems = await prisma.brandInventory.findMany({
      where: { brandId },
    });

    const inventoryMap = new Map<string, InventoryItem>();

    inventoryItems.forEach((item) => {
      const inventoryItem: InventoryItem = {
        type: "InventoryItem",
        id: item.itemId,
        attributes: {
          inventory: item.inventory as Record<string, number>,
          // Solo incluir manufacturer si existe
          ...(item.manufacturerStock !== null && item.manufacturerEsd !== null
            ? {
                manufacturer: {
                  stock: item.manufacturerStock,
                  esd: item.manufacturerEsd,
                },
              }
            : {}),
        },
        relationships: {
          item: {
            links: `/v1/items/${item.itemId}`,
          },
        },
      };

      inventoryMap.set(item.itemId, inventoryItem);
    });

    console.log(
      `✅ Loaded ${inventoryItems.length} inventory items from database for brand ${brandId}`
    );

    return inventoryMap;
  }

  /**
   * Fetch desde API y guardar en DB
   */
  private async fetchAndCacheInventory(
    brandId: number
  ): Promise<Map<string, InventoryItem>> {
    const inventoryMap = new Map<string, InventoryItem>();

    // Primera llamada para obtener total_pages
    const firstPageResponse = await this.fetchInventoryPage(brandId, 1);
    const totalPages = firstPageResponse.meta.total_pages;

    // Guardar items de la primera página
    firstPageResponse.data.forEach((item) => {
      inventoryMap.set(item.id, item);
    });

    console.log(
      `📦 Inventory: Brand ${brandId}, Page 1/${totalPages} fetched (${firstPageResponse.data.length} items)`
    );

    // Si hay más páginas, fetch en paralelo
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(this.fetchInventoryPage(brandId, page));
      }

      const remainingPages = await Promise.all(pagePromises);

      // Agregar items de las páginas restantes
      remainingPages.forEach((pageData, index) => {
        pageData.data.forEach((item) => {
          inventoryMap.set(item.id, item);
        });
        console.log(
          `📦 Inventory: Brand ${brandId}, Page ${index + 2}/${totalPages} fetched (${pageData.data.length} items)`
        );
      });
    }

    // Guardar en base de datos
    await this.saveInventoryToDatabase(brandId, Array.from(inventoryMap.values()));

    // Marcar como cacheado
    await prisma.inventoryCache.upsert({
      where: { brandId },
      update: {
        cachedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        brandId,
      },
    });

    console.log(
      `✅ Inventory cached: Brand ${brandId}, ${inventoryMap.size} items saved to database`
    );

    return inventoryMap;
  }

  /**
   * Guardar inventario en la base de datos
   */
  private async saveInventoryToDatabase(
    brandId: number,
    items: InventoryItem[]
  ) {
    const inventoryData = items.map((item) => ({
      brandId,
      itemId: item.id,
      totalStock: this.calculateTotalStock(item),
      inventory: item.attributes.inventory as any,
      manufacturerStock: item.attributes.manufacturer?.stock,
      manufacturerEsd: item.attributes.manufacturer?.esd,
    }));

    // Usar upsert para evitar duplicados
    await Promise.all(
      inventoryData.map((inventory) =>
        prisma.brandInventory.upsert({
          where: {
            brandId_itemId: {
              brandId: inventory.brandId,
              itemId: inventory.itemId,
            },
          },
          update: {
            totalStock: inventory.totalStock,
            inventory: inventory.inventory,
            manufacturerStock: inventory.manufacturerStock,
            manufacturerEsd: inventory.manufacturerEsd,
            updatedAt: new Date(),
          },
          create: inventory,
        })
      )
    );

    console.log(`✅ Saved ${items.length} inventory items to database`);
  }

  /**
   * Invalidar caché de inventario de una marca
   */
  private async invalidateCache(brandId: number) {
    // Eliminar el control de caché
    await prisma.inventoryCache.delete({
      where: { brandId },
    });

    // Eliminar todos los items de inventario de esta marca
    await prisma.brandInventory.deleteMany({
      where: { brandId },
    });

    console.log(`🗑️  Inventory cache invalidated for brand ${brandId}`);
  }

  /**
   * Fetch de una página de inventario desde Turn14 API
   */
  private async fetchInventoryPage(
    brandId: number,
    page: number
  ): Promise<BrandInventoryResponse> {
    const response = await fetch(
      `https://api.turn14.com/v1/inventory/brand/${brandId}?page=${page}`,
      {
        headers: {
          Authorization: await authService.getAuthorizationHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch inventory for brand ${brandId}, page ${page}: ${response.status}`
      );
    }

    return await response.json();
  }

  /**
   * Calcular stock total de un item sumando todos los warehouses
   */
  calculateTotalStock(item: InventoryItem): number {
    return Object.values(item.attributes.inventory).reduce(
      (sum, qty) => sum + qty,
      0
    );
  }

  /**
   * Verificar si un item tiene stock disponible
   */
  hasStock(item: InventoryItem): boolean {
    return this.calculateTotalStock(item) > 0;
  }

  /**
   * Forzar refresh del caché de inventario de una marca
   * Útil para endpoints API que permitan actualización manual
   */
  async forceRefreshInventory(brandId: number) {
    console.log(`🔄 Force refresh inventory for brand ${brandId}`);
    await this.invalidateCache(brandId);
    return this.fetchAndCacheInventory(brandId);
  }

  /**
   * Obtener estadísticas del caché de inventario
   */
  async getInventoryCacheStats() {
    const totalCachedBrands = await prisma.inventoryCache.count();
    const totalInventoryItems = await prisma.brandInventory.count();

    const oldestCache = await prisma.inventoryCache.findFirst({
      orderBy: { cachedAt: "asc" },
    });

    const newestCache = await prisma.inventoryCache.findFirst({
      orderBy: { cachedAt: "desc" },
    });

    return {
      totalCachedBrands,
      totalInventoryItems,
      oldestCacheAgeDays: oldestCache
        ? Math.floor((Date.now() - oldestCache.cachedAt.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      newestCacheAgeDays: newestCache
        ? Math.floor((Date.now() - newestCache.cachedAt.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    };
  }
}

export const inventorySyncService = new InventorySyncService();
