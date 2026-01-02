import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

/**
 * POST /api/cache/clear
 * Endpoint para limpiar el caché de productos, precios e inventario de una marca
 *
 * Body: { brandId: number }
 *
 * Esto forzará que la próxima petición vuelva a consultar la API de Turn14
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId } = body;

    if (!brandId || typeof brandId !== "number") {
      return NextResponse.json(
        { error: "brandId is required and must be a number" },
        { status: 400 }
      );
    }

    console.log(`🧹 Clearing cache for brand ${brandId}...`);

    // Primero obtener IDs de productos antes de borrarlos (para borrar precios asociados)
    const productIds = await prisma.product.findMany({
      where: { brandId },
      select: { id: true },
    });
    const productIdList = productIds.map((p) => p.id);

    // Limpiar caché de productos
    const deletedProductCache = await prisma.productPageCache.deleteMany({
      where: { brandId },
    });

    // Limpiar productos cacheados
    const deletedProducts = await prisma.product.deleteMany({
      where: { brandId },
    });

    // Limpiar caché de precios
    const deletedPriceCache = await prisma.pricePageCache.deleteMany({
      where: { brandId },
    });

    // Limpiar precios cacheados (basado en productos de esta marca)
    const deletedPrices = await prisma.productPrice.deleteMany({
      where: { productId: { in: productIdList } },
    });

    // Limpiar caché de inventario
    const deletedInventoryCache = await prisma.inventoryCache.deleteMany({
      where: { brandId },
    });

    // Limpiar inventario cacheado
    const deletedInventory = await prisma.brandInventory.deleteMany({
      where: { brandId },
    });

    console.log(`✅ Cache cleared for brand ${brandId}:`, {
      productPages: deletedProductCache.count,
      products: deletedProducts.count,
      pricePages: deletedPriceCache.count,
      prices: deletedPrices.count,
      inventoryCache: deletedInventoryCache.count,
      inventory: deletedInventory.count,
    });

    return NextResponse.json({
      success: true,
      message: `Cache cleared for brand ${brandId}`,
      deleted: {
        productPages: deletedProductCache.count,
        products: deletedProducts.count,
        pricePages: deletedPriceCache.count,
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

/**
 * DELETE /api/cache/clear?all=true
 * Endpoint para limpiar TODO el caché (usar con precaución)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";

    if (!clearAll) {
      return NextResponse.json(
        { error: "Add ?all=true query parameter to clear all cache" },
        { status: 400 }
      );
    }

    console.log("🧹🧹🧹 Clearing ALL cache...");

    // Limpiar TODO el caché
    const [
      deletedProductCache,
      deletedProducts,
      deletedPriceCache,
      deletedPrices,
      deletedInventoryCache,
      deletedInventory,
    ] = await Promise.all([
      prisma.productPageCache.deleteMany(),
      prisma.product.deleteMany(),
      prisma.pricePageCache.deleteMany(),
      prisma.productPrice.deleteMany(),
      prisma.inventoryCache.deleteMany(),
      prisma.brandInventory.deleteMany(),
    ]);

    console.log("✅ All cache cleared:", {
      productPages: deletedProductCache.count,
      products: deletedProducts.count,
      pricePages: deletedPriceCache.count,
      prices: deletedPrices.count,
      inventoryCache: deletedInventoryCache.count,
      inventory: deletedInventory.count,
    });

    return NextResponse.json({
      success: true,
      message: "All cache cleared successfully",
      deleted: {
        productPages: deletedProductCache.count,
        products: deletedProducts.count,
        pricePages: deletedPriceCache.count,
        prices: deletedPrices.count,
        inventoryCache: deletedInventoryCache.count,
        inventory: deletedInventory.count,
      },
    });
  } catch (error) {
    console.error("❌ Error clearing all cache:", error);
    return NextResponse.json(
      { error: "Failed to clear all cache", details: error },
      { status: 500 }
    );
  }
}
