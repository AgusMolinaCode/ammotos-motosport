import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET() {
  try {
    // Obtener todas las marcas que tienen productos cacheados
    const cachedBrands = await prisma.productPageCache.findMany({
      select: {
        brandId: true,
      },
      distinct: ["brandId"],
    });

    const brandsWithMissingCategories = [];

    // Para cada marca, verificar si tiene categorías guardadas
    for (const { brandId } of cachedBrands) {
      const categoriesCount = await prisma.brandCategory.count({
        where: { brandId },
      });

      if (categoriesCount === 0) {
        brandsWithMissingCategories.push(brandId);
      }
    }

    return NextResponse.json({
      totalCachedBrands: cachedBrands.length,
      brandsWithMissingCategories,
      count: brandsWithMissingCategories.length,
    });
  } catch (error) {
    console.error("❌ Error checking categories:", error);
    return NextResponse.json(
      { error: "Failed to check categories" },
      { status: 500 }
    );
  }
}
