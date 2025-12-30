import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function POST() {
  try {
    // Obtener todas las marcas que tienen productos cacheados
    const cachedBrands = await prisma.productPageCache.findMany({
      select: {
        brandId: true,
      },
      distinct: ["brandId"],
    });

    const invalidatedBrands = [];

    // Para cada marca, verificar si tiene categorías guardadas
    for (const { brandId } of cachedBrands) {
      const categoriesCount = await prisma.brandCategory.count({
        where: { brandId },
      });

      // Si no tiene categorías, invalidar cache
      if (categoriesCount === 0) {
        // Eliminar cache de productos
        const deletedProducts = await prisma.productPageCache.deleteMany({
          where: { brandId },
        });

        // Eliminar cache de precios
        const deletedPrices = await prisma.pricePageCache.deleteMany({
          where: { brandId },
        });

        invalidatedBrands.push({
          brandId,
          deletedProducts: deletedProducts.count,
          deletedPrices: deletedPrices.count,
        });

        console.log(
          `✅ Invalidated cache for brand ${brandId}: ${deletedProducts.count} product pages, ${deletedPrices.count} price pages`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for ${invalidatedBrands.length} brands`,
      invalidatedBrands,
    });
  } catch (error) {
    console.error("❌ Error invalidating cache:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
