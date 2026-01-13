"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import { pricingSyncService } from "@/infrastructure/services/PricingSyncService";
import type { ProductFilters } from "@/infrastructure/services/ProductsSyncService";

/**
 * Prefetch inteligente de páginas adyacentes en background
 * Mejora la navegación haciendo que cambiar de página sea instantáneo
 *
 * Estrategia CONSERVADORA (respeta rate limits):
 * - SOLO página siguiente (prioridad alta): 90% de usuarios navegan hacia adelante
 * - NO prefetch de precios para evitar saturar la API
 * - Delay inicial para no competir con carga principal
 */
export async function prefetchAdjacentPages(
  brandId: number,
  currentPage: number,
  totalPages: number,
  filters: ProductFilters = {}
) {
  const pagesToPrefetch: Array<{ page: number; priority: 'high' }> = [];

  // SOLO página siguiente - PRIORIDAD ALTA
  // No prefetch de páginas anteriores ni +2 para respetar rate limits
  if (currentPage < totalPages) {
    pagesToPrefetch.push({ page: currentPage + 1, priority: 'high' });
  }

  console.log(`🔮 Prefetching ${pagesToPrefetch.length} pages for brand ${brandId}, current page ${currentPage}`);

  // Ejecutar prefetch en background sin bloquear (fire-and-forget)
  // Delay inicial de 2s para no competir con carga principal
  Promise.all(
    pagesToPrefetch.map(async ({ page, priority }) => {
      try {
        // Esperar 2 segundos antes de empezar prefetch para evitar saturar API
        await new Promise(resolve => setTimeout(resolve, 2000));

        const startTime = Date.now();

        // SOLO prefetch productos - NO precios (para respetar rate limits)
        const hasFilters = !!(filters.category || filters.subcategory || filters.productName);
        const result = hasFilters
          ? await productsSyncService.getProductsByBrandFiltered(brandId, page, filters)
          : await productsSyncService.getProductsByBrandPaginated(brandId, page);

        // ❌ NO prefetch de precios - se cargan cuando usuario navega
        // Esto evita saturar la API con requests paralelos

        const duration = Date.now() - startTime;
        console.log(`✅ Prefetched page ${page} (products only) for brand ${brandId} in ${duration}ms`);
      } catch (error) {
        console.error(`❌ Prefetch failed for page ${page}:`, error);
        // Silenciar error para no afectar UX principal
      }
    })
  ).catch(() => {
    // Catch global para garantizar que errores de prefetch nunca bloqueen
  });
}

/**
 * Warmup de caché para las primeras N páginas al entrar a una marca
 * Se ejecuta solo si detectamos que es la primera vez que se accede
 *
 * Útil para:
 * - Primera visita a una marca (sin caché)
 * - Marcas con pocos productos donde podemos cachear todo rápidamente
 */
export async function warmupBrandCache(
  brandId: number,
  maxPagesToWarmup: number = 3
) {
  try {
    console.log(`🔥 Starting cache warmup for brand ${brandId} (max ${maxPagesToWarmup} pages)`);
    const startTime = Date.now();

    // Fetch primeras N páginas en paralelo
    const warmupPages = Array.from({ length: maxPagesToWarmup }, (_, i) => i + 1);

    await Promise.all(
      warmupPages.map(async (page) => {
        try {
          const result = await productsSyncService.getProductsByBrandPaginated(
            brandId,
            page
          );

          const productIds = result.products.map(p => p.id);

          if (productIds.length > 0) {
            // Precargar precios también
            await pricingSyncService.getPricesByProductIds(productIds);
          }

          console.log(`✅ Warmed up page ${page} for brand ${brandId}`);
        } catch (error) {
          console.error(`❌ Warmup failed for page ${page}:`, error);
        }
      })
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Cache warmup complete for brand ${brandId} in ${duration}ms`);
  } catch (error) {
    console.error(`❌ Cache warmup failed for brand ${brandId}:`, error);
  }
}
