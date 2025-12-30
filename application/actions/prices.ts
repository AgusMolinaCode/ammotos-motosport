"use server";

import { pricingSyncService } from "@/infrastructure/services/PricingSyncService";

export async function getPricesByBrand(brandId: number, page: number = 1) {
  try {
    console.log(`🔍 [getPricesByBrand] Fetching prices for brand ${brandId}, page ${page}`);

    const result = await pricingSyncService.getPricesByBrandPaginated(
      brandId,
      page
    );

    console.log(`✅ [getPricesByBrand] Got ${result.prices.length} prices for brand ${brandId}`);

    return {
      data: result.prices.map((price) => ({
        productId: price.productId,
        mapPrice: price.mapPrice,
        retailPrice: price.retailPrice,
        purchaseCost: price.purchaseCost,
        hasMap: price.hasMap,
        canPurchase: price.canPurchase,
      })),
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
      },
    };
  } catch (error) {
    console.error(`❌ [getPricesByBrand] Error fetching prices for brand ${brandId}:`, error);
    console.error(`   Error name: ${(error as Error).name}`);
    console.error(`   Error message: ${(error as Error).message}`);
    if ((error as any).stack) {
      console.error(`   Stack trace: ${(error as any).stack.split('\n').slice(0, 3).join('\n')}`);
    }

    // Graceful degradation - return empty prices to allow products to display
    return {
      data: [],
      meta: {
        total_pages: 0,
        current_page: page,
      },
    };
  }
}
