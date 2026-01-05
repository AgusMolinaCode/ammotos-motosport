"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import { prisma } from "@/infrastructure/database/prisma";

// Tipo para filtros de productos
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  productName?: string;
}

export interface ProductsWithFiltersResult {
  data: ReturnType<typeof productsSyncService.getProductsByBrandPaginated> extends Promise<infer T>
    ? T extends { products: infer P } ? { products: P; filterData?: any }
    : never
    : never;
  meta: {
    total_pages: number;
    current_page: number;
    total_matches?: number;
    total_products?: number; // Total de productos en la marca (sin filtros)
  };
  filterData: {
    categories: { category: string; categoryEs: string }[];
    subcategories: { subcategory: string; subcategoryEs: string }[];
    productNames: { productName: string }[];
  };
}

/**
 * Obtener el total de productos de una marca (cacheados en DB)
 */
export async function getTotalProductsByBrand(brandId: number): Promise<number> {
  try {
    const count = await prisma.product.count({
      where: { brandId }
    });
    return count;
  } catch (error) {
    console.error(`Error counting products for brand ${brandId}:`, error);
    return 0;
  }
}

export async function getProductsByBrand(
  brandId: number,
  page: number = 1,
  filters: ProductFilters = {}
) {
  try {
    const hasFilters = !!(
      filters.category || filters.subcategory || filters.productName
    );

    // Obtener productos y total de productos en paralelo
    const [result, totalProducts] = await Promise.all([
      hasFilters
        ? productsSyncService.getProductsByBrandFiltered(brandId, page, filters)
        : productsSyncService.getProductsByBrandPaginated(brandId, page),
      getTotalProductsByBrand(brandId)
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalMatches = (result as any).totalMatches ?? result.products.length;

    return {
      data: result.products,
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
        total_matches: totalMatches,
        total_products: totalProducts,
      },
      filterData: result.filterData,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
