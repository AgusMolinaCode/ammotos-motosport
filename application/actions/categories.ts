"use server";

import { prisma } from "@/infrastructure/database/prisma";

export interface BrandCategoryData {
  category: string;
  categoryEs: string;
}

export interface BrandSubcategoryData {
  subcategory: string;
  subcategoryEs: string;
}

export interface BrandProductNameData {
  productName: string;
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

/**
 * Obtener subcategorías únicas para una marca específica
 * Estas subcategorías son extraídas de los productos de la marca y cacheadas en la DB
 */
export async function getBrandSubcategories(
  brandId: number
): Promise<BrandSubcategoryData[]> {
  try {
    const subcategories = await prisma.brandSubcategory.findMany({
      where: { brandId },
      orderBy: { subcategoryEs: "asc" },
      select: {
        subcategory: true,
        subcategoryEs: true,
      },
    });

    return subcategories;
  } catch (error) {
    console.error(
      `❌ [getBrandSubcategories] Error fetching subcategories for brand ${brandId}:`,
      error
    );
    return [];
  }
}

/**
 * Obtener product names únicos para una marca específica
 * Estos product names son extraídos de los productos de la marca y cacheados en la DB
 */
export async function getBrandProductNames(
  brandId: number
): Promise<BrandProductNameData[]> {
  try {
    const productNames = await prisma.brandProductName.findMany({
      where: { brandId },
      orderBy: { productName: "asc" },
      select: {
        productName: true,
      },
    });

    return productNames;
  } catch (error) {
    console.error(
      `❌ [getBrandProductNames] Error fetching product names for brand ${brandId}:`,
      error
    );
    return [];
  }
}
