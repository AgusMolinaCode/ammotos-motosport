import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

/**
 * DELETE /api/cache/clear-brand?brandId=223
 * Endpoint para limpiar toda la caché de un brand específico
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandIdParam = searchParams.get("brandId");

    if (!brandIdParam) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    const brandId = parseInt(brandIdParam);
    console.log(`🧹 Clearing cache for brand ${brandId}...`);

    // Get product IDs first
    const products = await prisma.product.findMany({
      where: { brandId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);
    console.log(`Found ${productIds.length} products to clear`);

    // Clear product page cache
    const deletedProductCache = await prisma.productPageCache.deleteMany({
      where: { brandId },
    });
    console.log(`✅ Deleted ${deletedProductCache.count} product page cache entries`);

    // Clear products
    const deletedProducts = await prisma.product.deleteMany({
      where: { brandId },
    });
    console.log(`✅ Deleted ${deletedProducts.count} products`);

    // Clear price cache
    const deletedPriceCache = await prisma.pricePageCache.deleteMany({
      where: { brandId },
    });
    console.log(`✅ Deleted ${deletedPriceCache.count} price page cache entries`);

    // Clear prices
    const deletedPrices = await prisma.productPrice.deleteMany({
      where: { productId: { in: productIds } },
    });
    console.log(`✅ Deleted ${deletedPrices.count} prices`);

    // Clear inventory cache
    const deletedInventoryCache = await prisma.inventoryCache.deleteMany({
      where: { brandId },
    });
    console.log(`✅ Deleted ${deletedInventoryCache.count} inventory cache entries`);

    // Clear inventory
    const deletedInventory = await prisma.brandInventory.deleteMany({
      where: { brandId },
    });
    console.log(`✅ Deleted ${deletedInventory.count} inventory items`);

    console.log(`\n✅ Cache cleared successfully for brand ${brandId}!`);

    return NextResponse.json({
      success: true,
      message: `Cache cleared for brand ${brandId}`,
      deleted: {
        productCache: deletedProductCache.count,
        products: deletedProducts.count,
        priceCache: deletedPriceCache.count,
        prices: deletedPrices.count,
        inventoryCache: deletedInventoryCache.count,
        inventory: deletedInventory.count,
      },
    });
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache", details: error },
      { status: 500 }
    );
  }
}
