"use server";

import { prisma } from "@/infrastructure/database/prisma";

export interface BrandCategoryData {
  category: string;
  categoryEs: string;
}

/**
 * Obtener categorías únicas para una marca específica
 * Estas categorías son extraídas de los productos de la marca y cacheadas en la DB
 */
export async function getBrandCategories(
  brandId: number
): Promise<BrandCategoryData[]> {
  try {
    const categories = await prisma.brandCategory.findMany({
      where: { brandId },
      orderBy: { categoryEs: "asc" },
      select: {
        category: true,
        categoryEs: true,
      },
    });

    return categories;
  } catch (error) {
    console.error(
      `❌ [getBrandCategories] Error fetching categories for brand ${brandId}:`,
      error
    );
    return [];
  }
}
