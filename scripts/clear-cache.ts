import { prisma } from "../infrastructure/database/prisma";

async function clearCache() {
  console.log("🧹 Clearing all cache...");

  try {
    // Limpiar caché de productos
    const deletedProductCache = await prisma.productPageCache.deleteMany();
    console.log(`✅ Deleted ${deletedProductCache.count} product page cache entries`);

    // Limpiar productos
    const deletedProducts = await prisma.product.deleteMany();
    console.log(`✅ Deleted ${deletedProducts.count} products`);

    // Limpiar caché de precios
    const deletedPriceCache = await prisma.pricePageCache.deleteMany();
    console.log(`✅ Deleted ${deletedPriceCache.count} price page cache entries`);

    // Limpiar precios
    const deletedPrices = await prisma.productPrice.deleteMany();
    console.log(`✅ Deleted ${deletedPrices.count} prices`);

    // Limpiar inventario
    const deletedInventoryCache = await prisma.inventoryCache.deleteMany();
    console.log(`✅ Deleted ${deletedInventoryCache.count} inventory cache entries`);

    const deletedInventory = await prisma.brandInventory.deleteMany();
    console.log(`✅ Deleted ${deletedInventory.count} inventory items`);

    console.log("\n✅ All cache cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCache();
