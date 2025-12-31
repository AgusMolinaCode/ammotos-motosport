import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { prisma } from "@/infrastructure/database/prisma";
import type {
  PricingResponse,
  PricingItem,
  Pricelist,
  ProductPriceData,
  PricingServiceResult,
} from "@/domain/types/turn14/pricing";
import { env } from "@/infrastructure/config/env";

export class PricingSyncService {
  private static readonly CACHE_TTL_DAYS = 3; // Renovar caché cada 3 días

  /**
   * Obtener precios para una lista específica de product IDs
   * Este método es más eficiente que la paginación cuando ya tienes los IDs de productos
   */
  async getPricesByProductIds(
    productIds: string[]
  ): Promise<ProductPriceData[]> {
    if (productIds.length === 0) return [];

    // Buscar precios existentes en la DB
    const existingPrices = await prisma.productPrice.findMany({
      where: {
        productId: { in: productIds },
      },
    });

    const existingPriceIds = new Set(existingPrices.map((p) => p.productId));
    const missingPriceIds = productIds.filter((id) => !existingPriceIds.has(id));

    // Si hay IDs faltantes, obtenerlos de la API
    if (missingPriceIds.length > 0) {
      console.log(`🌐 Fetching ${missingPriceIds.length} missing prices from API`);
      await this.fetchMissingPrices(missingPriceIds);

      // Volver a obtener todos los precios ahora que están completos
      const allPrices = await prisma.productPrice.findMany({
        where: {
          productId: { in: productIds },
        },
      });

      return this.convertPricesToServiceFormat(allPrices);
    }

    return this.convertPricesToServiceFormat(existingPrices);
  }

  /**
   * Obtener precios individuales de la API para productos faltantes
   */
  private async fetchMissingPrices(productIds: string[]): Promise<void> {
    // Fetch en paralelo con límite de concurrencia
    const BATCH_SIZE = 10; // Procesar 10 a la vez para no sobrecargar la API

    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batch = productIds.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (productId) => {
          try {
            const url = `${env.turn14.apiUrl}/pricing/${productId}`;
            const response = await fetch(url, {
              headers: {
                Authorization: await authService.getAuthorizationHeader(),
              },
            });

            if (!response.ok) {
              console.error(`❌ Failed to fetch price for product ${productId}: ${response.status}`);
              return;
            }

            const data: { data: PricingItem } = await response.json();

            // Guardar en DB
            await prisma.productPrice.upsert({
              where: { productId },
              update: {
                purchaseCost: data.data.attributes.purchase_cost,
                hasMap: data.data.attributes.has_map,
                canPurchase: data.data.attributes.can_purchase,
                pricelists: data.data.attributes.pricelists as any,
                mapPrice: this.extractMapPrice(data.data.attributes.pricelists),
              },
              create: {
                productId,
                purchaseCost: data.data.attributes.purchase_cost,
                hasMap: data.data.attributes.has_map,
                canPurchase: data.data.attributes.can_purchase,
                pricelists: data.data.attributes.pricelists as any,
                mapPrice: this.extractMapPrice(data.data.attributes.pricelists),
              },
            });

            console.log(`✅ Fetched and saved price for product ${productId}`);
          } catch (error) {
            console.error(`❌ Error fetching price for product ${productId}:`, error);
          }
        })
      );
    }
  }

  /**
   * Convertir precios de DB a formato de servicio
   */
  private convertPricesToServiceFormat(prices: any[]): ProductPriceData[] {
    return prices.map((p) => ({
      productId: p.productId,
      purchaseCost: p.purchaseCost,
      hasMap: p.hasMap,
      canPurchase: p.canPurchase,
      pricelists: p.pricelists as unknown as Pricelist[],
      mapPrice: p.mapPrice,
      retailPrice: this.extractRetailPrice(p.pricelists as unknown as Pricelist[]),
    }));
  }

  /**
   * Obtener precios con sistema de caché lazy-loading + TTL
   * 1. Si la página está cacheada y < 3 días → leer desde DB
   * 2. Si la página está cacheada pero > 3 días → renovar desde API
   * 3. Si no está cacheada → llamar API y guardar en DB
   */
  async getPricesByBrandPaginated(
    brandId: number,
    page: number = 1
  ): Promise<PricingServiceResult> {
    // Verificar si esta página ya está cacheada
    const cachedPage = await prisma.pricePageCache.findUnique({
      where: {
        brandId_page: {
          brandId,
          page,
        },
      },
    });

    // Si está cacheada, verificar antigüedad
    if (cachedPage) {
      const daysSinceCache =
        (Date.now() - cachedPage.cachedAt.getTime()) / (1000 * 60 * 60 * 24);

      // Caché válido (< 3 días)
      if (daysSinceCache < PricingSyncService.CACHE_TTL_DAYS) {
        console.log(
          `📦 Price Cache HIT: Brand ${brandId}, Page ${page} (${daysSinceCache.toFixed(1)} días)`
        );
        return this.getPricesFromDatabase(brandId, page);
      }

      // Caché expirado (> 3 días) - Renovar
      console.log(
        `♻️  Price Cache STALE: Brand ${brandId}, Page ${page} (${daysSinceCache.toFixed(1)} días) - Renovando...`
      );
      await this.invalidateCache(brandId, page);
      return this.fetchAndCachePrices(brandId, page);
    }

    // Si no está cacheada, llamar API y guardar
    console.log(
      `🌐 Price Cache MISS: Fetching from API - Brand ${brandId}, Page ${page}`
    );
    return this.fetchAndCachePrices(brandId, page);
  }

  /**
   * Invalidar caché de una página específica
   */
  private async invalidateCache(brandId: number, page: number) {
    // Eliminar entrada de caché
    await prisma.pricePageCache.delete({
      where: {
        brandId_page: {
          brandId,
          page,
        },
      },
    });

    console.log(`🗑️  Price cache invalidated: Brand ${brandId}, Page ${page}`);
  }

  /**
   * Leer precios desde la base de datos (página ya cacheada)
   */
  private async getPricesFromDatabase(
    brandId: number,
    page: number
  ): Promise<PricingServiceResult> {
    // Calcular offset para la paginación (~100 precios por página)
    const pageSize = 100;
    const skip = (page - 1) * pageSize;

    // Obtener productos de este brand para filtrar precios
    const products = await prisma.product.findMany({
      where: { brandId },
      select: { id: true },
      skip,
      take: pageSize,
      orderBy: { id: "asc" },
    });

    const productIds = products.map((p) => p.id);

    // Obtener precios de esos productos
    const prices = await prisma.productPrice.findMany({
      where: {
        productId: { in: productIds },
      },
      orderBy: { productId: "asc" },
    });

    // Obtener total de páginas cacheadas para este brand
    const totalCachedPages = await prisma.pricePageCache.count({
      where: { brandId },
    });

    // Convertir de formato DB a formato de servicio
    const priceData: ProductPriceData[] = prices.map((p) => ({
      productId: p.productId,
      purchaseCost: p.purchaseCost,
      hasMap: p.hasMap,
      canPurchase: p.canPurchase,
      pricelists: p.pricelists as unknown as Pricelist[],
      mapPrice: p.mapPrice,
      retailPrice: this.extractRetailPrice(p.pricelists as unknown as Pricelist[]),
    }));

    return {
      prices: priceData,
      totalPages: totalCachedPages,
      currentPage: page,
      links: {
        self: "",
        first: "",
        last: "",
      },
    };
  }

  /**
   * Llamar API y guardar precios en DB
   */
  private async fetchAndCachePrices(
    brandId: number,
    page: number
  ): Promise<PricingServiceResult> {
    const url = `${env.turn14.apiUrl}/pricing/brand/${brandId}?page=${page}`;
    console.log(`🌐 [PricingSyncService] Calling Turn14 API: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: await authService.getAuthorizationHeader(),
      },
    });

    console.log(`📡 [PricingSyncService] API Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [PricingSyncService] API Error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch prices: ${response.status} - ${errorText}`);
    }

    const data: PricingResponse = await response.json();
    console.log(`📦 [PricingSyncService] Received ${data.data.length} pricing items, total pages: ${data.meta.total_pages}`);

    // Guardar precios en DB
    await this.savePricesToDatabase(data.data);

    // Marcar página como cacheada (usar upsert para evitar race conditions)
    await prisma.pricePageCache.upsert({
      where: {
        brandId_page: {
          brandId,
          page,
        },
      },
      update: {
        cachedAt: new Date(),
      },
      create: {
        brandId,
        page,
      },
    });

    // Convertir respuesta API a formato de servicio
    const priceData: ProductPriceData[] = data.data.map((item) => ({
      productId: item.id,
      purchaseCost: item.attributes.purchase_cost,
      hasMap: item.attributes.has_map,
      canPurchase: item.attributes.can_purchase,
      pricelists: item.attributes.pricelists,
      mapPrice: this.extractMapPrice(item.attributes.pricelists),
      retailPrice: this.extractRetailPrice(item.attributes.pricelists),
    }));

    return {
      prices: priceData,
      totalPages: data.meta.total_pages,
      currentPage: page,
      links: data.links,
    };
  }

  /**
   * Guardar precios en la base de datos
   */
  private async savePricesToDatabase(pricingItems: PricingItem[]) {
    const priceData = pricingItems.map((item) => ({
      productId: item.id,
      purchaseCost: item.attributes.purchase_cost,
      hasMap: item.attributes.has_map,
      canPurchase: item.attributes.can_purchase,
      pricelists: item.attributes.pricelists as any, // Cast to any for Prisma Json type
      mapPrice: this.extractMapPrice(item.attributes.pricelists),
    }));

    // Usar upsert para evitar duplicados
    await Promise.all(
      priceData.map((price) =>
        prisma.productPrice.upsert({
          where: { productId: price.productId },
          update: price,
          create: price,
        })
      )
    );

    console.log(`✅ Saved ${pricingItems.length} prices to database`);
  }

  /**
   * Extraer MAP price del array de pricelists
   */
  private extractMapPrice(pricelists: Pricelist[]): number | null {
    const mapEntry = pricelists.find(
      (pl) => pl.name.toLowerCase() === "map"
    );
    return mapEntry?.price ?? null;
  }

  /**
   * Extraer Retail price del array de pricelists
   */
  private extractRetailPrice(pricelists: Pricelist[]): number | null {
    const retailEntry = pricelists.find(
      (pl) => pl.name.toLowerCase() === "retail"
    );
    return retailEntry?.price ?? null;
  }

  /**
   * Forzar renovación de todas las páginas de precios de una marca
   * (útil para admin o debugging)
   */
  async forceRefreshBrandPrices(brandId: number): Promise<void> {
    // Eliminar todas las entradas de caché para esta marca
    await prisma.pricePageCache.deleteMany({
      where: { brandId },
    });

    console.log(`🔄 Force refresh initiated for brand ${brandId} prices`);
  }
}

export const pricingSyncService = new PricingSyncService();
