import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { prisma } from "@/infrastructure/database/prisma";
import type { ProductsResponse, Product } from "@/domain/types/turn14/products";
import { traducirCategoria, traducirSubcategoria } from "@/constants/categorias";

export interface SyncResult {
  success: boolean;
  totalPages: number;
  syncedPages: number;
  totalProducts: number;
  errors: Array<{ page: number; error: string }>;
  duration: number; // en segundos
}

export interface UpdateResult {
  success: boolean;
  totalPages: number;
  syncedPages: number;
  newProducts: number;
  updatedProducts: number;
  errors: Array<{ page: number; error: string }>;
  duration: number;
}

export class GlobalProductsSyncService {
  private static readonly API_BASE_URL = process.env.TURN14_API_URL || "https://api.turn14.com/v1";
  private static readonly PAGE_SIZE = 100; // La API devuelve ~100 productos por página
  private static readonly DELAY_BETWEEN_REQUESTS_MS = 500; // Rate limiting friendly
  private static readonly MAX_CONSECUTIVE_FAILURES = 3;

  /**
   * Sync completo de todos los productos
   * Itera desde page=1 hasta obtener todas las páginas
   */
  async syncAllProductsFull(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: Array<{ page: number; error: string }> = [];
    let totalProducts = 0;
    let syncedPages = 0;
    let totalPages = 0;
    let consecutiveFailures = 0;

    console.log("🚀 INICIANDO SYNC COMPLETO DE PRODUCTOS");

    try {
      // 1. Obtener información de la primera página (para saber total de páginas)
      console.log("📊 Obteniendo metadata de páginas...");
      const firstPageResponse = await this.fetchItemsPage(1);
      totalPages = firstPageResponse.meta.total_pages;
      console.log(`   Total de páginas a procesar: ${totalPages}`);

      // 2. Guardar productos de la primera página
      const firstPageResult = await this.processPage(firstPageResponse.data, 1);
      totalProducts += firstPageResult.count;
      syncedPages = 1;

      // 3. Iterar por las páginas restantes
      for (let page = 2; page <= totalPages; page++) {
        // Verificar failures consecutivos
        if (consecutiveFailures >= GlobalProductsSyncService.MAX_CONSECUTIVE_FAILURES) {
          console.error(`❌ Demasiados errores consecutivos. Deteniendo en página ${page}`);
          errors.push({ page, error: "MAX_CONSECUTIVE_FAILURES" });
          break;
        }

        try {
          // Delay para rate limiting
          await this.delay(GlobalProductsSyncService.DELAY_BETWEEN_REQUESTS_MS);

          const response = await this.fetchItemsPage(page);
          const result = await this.processPage(response.data, page);

          totalProducts += result.count;
          syncedPages++;
          consecutiveFailures = 0; // Resetear counter

          // Progress update cada 10 páginas
          if (page % 10 === 0 || page === totalPages) {
            console.log(`   Progreso: ${page}/${totalPages} páginas (${((page / totalPages) * 100).toFixed(1)}%)`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push({ page, error: errorMessage });
          consecutiveFailures++;
          console.error(`   ❌ Error en página ${page}: ${errorMessage}`);
        }
      }

      // 4. Actualizar SyncControl
      await this.updateSyncControl("global_products_full");

      console.log(`✅ SYNC COMPLETO FINALIZADO`);
      console.log(`   Páginas procesadas: ${syncedPages}/${totalPages}`);
      console.log(`   Total productos: ${totalProducts}`);
      console.log(`   Errores: ${errors.length}`);

      return {
        success: errors.length === 0,
        totalPages,
        syncedPages,
        totalProducts,
        errors,
        duration: (Date.now() - startTime) / 1000,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Error fatal en sync completo: ${errorMessage}`);

      return {
        success: false,
        totalPages,
        syncedPages,
        totalProducts,
        errors: [{ page: 0, error: errorMessage }],
        duration: (Date.now() - startTime) / 1000,
      };
    }
  }

  /**
   * Sync de updates (productos nuevos/modificados en los últimos X días)
   */
  async syncUpdates(days: number = 3): Promise<UpdateResult> {
    const startTime = Date.now();
    const validatedDays = Math.max(1, Math.min(15, days)); // API limita a 1-15 días
    const errors: Array<{ page: number; error: string }> = [];
    let newProducts = 0;
    let updatedProducts = 0;
    let syncedPages = 0;
    let totalPages = 0;
    let consecutiveFailures = 0;

    console.log(`🚀 INICIANDO SYNC DE UPDATES (últimos ${validatedDays} días)`);

    try {
      // 1. Obtener primera página de updates
      const firstPageResponse = await this.fetchUpdatesPage(1, validatedDays);
      totalPages = firstPageResponse.meta.total_pages;
      console.log(`   Total páginas de updates: ${totalPages}`);

      // 2. Procesar primera página
      const firstPageResult = await this.processUpdatePage(firstPageResponse.data);
      newProducts += firstPageResult.newCount;
      updatedProducts += firstPageResult.updatedCount;
      syncedPages = 1;

      // 3. Iterar por páginas restantes
      for (let page = 2; page <= totalPages; page++) {
        if (consecutiveFailures >= GlobalProductsSyncService.MAX_CONSECUTIVE_FAILURES) {
          console.error(`❌ Demasiados errores consecutivos. Deteniendo en página ${page}`);
          errors.push({ page, error: "MAX_CONSECUTIVE_FAILURES" });
          break;
        }

        try {
          await this.delay(GlobalProductsSyncService.DELAY_BETWEEN_REQUESTS_MS);

          const response = await this.fetchUpdatesPage(page, validatedDays);
          const result = await this.processUpdatePage(response.data);

          newProducts += result.newCount;
          updatedProducts += result.updatedCount;
          syncedPages++;
          consecutiveFailures = 0;

          if (page % 10 === 0 || page === totalPages) {
            console.log(`   Progreso: ${page}/${totalPages} páginas`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push({ page, error: errorMessage });
          consecutiveFailures++;
          console.error(`   ❌ Error en página ${page}: ${errorMessage}`);
        }
      }

      // 4. Actualizar SyncControl
      await this.updateSyncControl("global_products_updates");

      console.log(`✅ SYNC DE UPDATES FINALIZADO`);
      console.log(`   Páginas procesadas: ${syncedPages}/${totalPages}`);
      console.log(`   Productos nuevos: ${newProducts}`);
      console.log(`   Productos actualizados: ${updatedProducts}`);

      return {
        success: errors.length === 0,
        totalPages,
        syncedPages,
        newProducts,
        updatedProducts,
        errors,
        duration: (Date.now() - startTime) / 1000,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Error fatal en sync de updates: ${errorMessage}`);

      return {
        success: false,
        totalPages,
        syncedPages,
        newProducts,
        updatedProducts,
        errors: [{ page: 0, error: errorMessage }],
        duration: (Date.now() - startTime) / 1000,
      };
    }
  }

  /**
   * Obtener días desde el último sync completo
   */
  async getDaysSinceLastFullSync(): Promise<number> {
    const lastSync = await prisma.syncControl.findUnique({
      where: { entity: "global_products_full" },
    });

    if (!lastSync) {
      return Infinity; // Nunca se ha hecho sync
    }

    const diffMs = Date.now() - lastSync.lastSync.getTime();
    return diffMs / (1000 * 60 * 60 * 24);
  }

  /**
   * Obtener estadísticas del sync
   */
  async getSyncStats(): Promise<{
    totalProducts: number;
    lastFullSync: Date | null;
    lastUpdateSync: Date | null;
    daysSinceFullSync: number;
  }> {
    const [productCount, fullSync, updateSync] = await Promise.all([
      prisma.product.count(),
      prisma.syncControl.findUnique({
        where: { entity: "global_products_full" },
      }),
      prisma.syncControl.findUnique({
        where: { entity: "global_products_updates" },
      }),
    ]);

    const daysSinceFullSync = fullSync
      ? (Date.now() - fullSync.lastSync.getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    return {
      totalProducts: productCount,
      lastFullSync: fullSync?.lastSync || null,
      lastUpdateSync: updateSync?.lastSync || null,
      daysSinceFullSync,
    };
  }

  // === Métodos privados ===

  /**
   * Fetch de página de /v1/items
   */
  private async fetchItemsPage(page: number): Promise<ProductsResponse> {
    const response = await fetch(`${GlobalProductsSyncService.API_BASE_URL}/items?page=${page}`, {
      headers: {
        Authorization: await authService.getAuthorizationHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch de página de /v1/items/updates
   */
  private async fetchUpdatesPage(page: number, days: number): Promise<ProductsResponse> {
    const response = await fetch(
      `${GlobalProductsSyncService.API_BASE_URL}/items/updates?page=${page}&days=${days}`,
      {
        headers: {
          Authorization: await authService.getAuthorizationHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Procesar página de productos (sync completo)
   */
  private async processPage(products: Product[], apiPage: number): Promise<{ count: number }> {
    const productData = products.map((p) => this.mapProductToDB(p, apiPage));

    // Usar upsert para cada producto
    const operations = productData.map((product) =>
      prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      })
    );

    // Ejecutar en batches de 50 para evitar sobrecarga
    const batchSize = 50;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await Promise.all(batch);
    }

    // Extraer y guardar categorías/subcategorías
    await this.saveCategoriesFromProducts(products);

    console.log(`   ✅ Página ${apiPage}: ${products.length} productos procesados`);
    return { count: products.length };
  }

  /**
   * Procesar página de updates (detectar nuevos vs actualizados)
   */
  private async processUpdatePage(
    products: Product[]
  ): Promise<{ newCount: number; updatedCount: number }> {
    let newCount = 0;
    let updatedCount = 0;

    for (const product of products) {
      const existing = await prisma.product.findUnique({
        where: { id: product.id },
        select: { id: true },
      });

      const productData = this.mapProductToDB(product, null);

      if (existing) {
        // Producto existente - actualizar
        await prisma.product.update({
          where: { id: product.id },
          data: { ...productData, lastApiUpdate: new Date() },
        });
        updatedCount++;
      } else {
        // Producto nuevo - insertar
        await prisma.product.create({
          data: { ...productData, lastApiUpdate: new Date() },
        });
        newCount++;
      }
    }

    // Guardar categorías
    await this.saveCategoriesFromProducts(products);

    console.log(`   📦 Updates: ${newCount} nuevos, ${updatedCount} actualizados`);
    return { newCount, updatedCount };
  }

  /**
   * Mapear producto de API a formato DB
   */
  private mapProductToDB(product: Product, apiPage: number | null): any {
    const attr = product.attributes;
    return {
      id: product.id,
      brandId: attr.brand_id,
      brandName: attr.brand,
      productName: attr.product_name,
      partNumber: attr.part_number,
      mfrPartNumber: attr.mfr_part_number,
      partDescription: attr.part_description || null,
      category: attr.category,
      subcategory: attr.subcategory,
      priceGroupId: attr.price_group_id,
      priceGroup: attr.price_group,
      active: attr.active,
      regularStock: attr.regular_stock,
      clearanceItem: attr.clearance_item,
      thumbnail: attr.thumbnail || null,
      dimensions: attr.dimensions as any,
      warehouseAvailability: attr.warehouse_availability as any,
      apiPage,
      // Campos adicionales
      barcode: attr.barcode || null,
      alternatePartNumber: attr.alternate_part_number || null,
      prop65: attr.prop_65,
      epa: attr.epa,
      unitsPerSku: attr.units_per_sku,
      powersportsIndicator: attr.powersports_indicator,
      dropshipControllerId: attr.dropship_controller_id,
      airFreightProhibited: attr.air_freight_prohibited,
      notCarbApproved: attr.not_carb_approved,
      carbAcknowledgementRequired: attr.carb_acknowledgement_required,
      carbEoNumber: attr.carb_eo_number || null,
      ltlFreightRequired: attr.ltl_freight_required,
      bornOnDate: attr.born_on_date ? new Date(attr.born_on_date) : null,
    };
  }

  /**
   * Extraer y guardar categorías/subcategorías únicas
   */
  private async saveCategoriesFromProducts(products: Product[]): Promise<void> {
    const categoryMap = new Map<string, string>();
    const subcategoryMap = new Map<string, string>();

    for (const product of products) {
      const attr = product.attributes;
      if (attr.category && !categoryMap.has(attr.category)) {
        categoryMap.set(attr.category, traducirCategoria(attr.category));
      }
      if (attr.subcategory && !subcategoryMap.has(attr.subcategory)) {
        subcategoryMap.set(attr.subcategory, traducirSubcategoria(attr.subcategory));
      }
    }

    // Guardar categorías
    for (const [category, categoryEs] of categoryMap) {
      await prisma.brandCategory.upsert({
        where: { brandId_category: { brandId: 0, category } }, // Nota: categoría global
        update: { categoryEs },
        create: { brandId: 0, category, categoryEs },
      });
    }

    // Guardar subcategorías
    for (const [subcategory, subcategoryEs] of subcategoryMap) {
      await prisma.brandSubcategory.upsert({
        where: { brandId_subcategory: { brandId: 0, subcategory } },
        update: { subcategoryEs },
        create: { brandId: 0, subcategory, subcategoryEs },
      });
    }
  }

  /**
   * Actualizar SyncControl
   */
  private async updateSyncControl(entity: string): Promise<void> {
    await prisma.syncControl.upsert({
      where: { entity },
      update: { lastSync: new Date() },
      create: { entity, lastSync: new Date() },
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const globalProductsSyncService = new GlobalProductsSyncService();
