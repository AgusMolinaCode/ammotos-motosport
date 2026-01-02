import { prisma } from "../infrastructure/database/prisma";

async function clearBrandCache(brandId: number) {
  console.log(`🧹 Clearing cache for brand ${brandId}...`);

  try {
    // Get product IDs first
    const products = await prisma.product.findMany({
      where: { brandId },
      select: { id: true },
    });

    const productIds = products.map(p => p.id);
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
    console.log("🔄 Next page load will fetch fresh data from Turn14 API");
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Clear cache for brand 223 (Advan)
clearBrandCache(223);
