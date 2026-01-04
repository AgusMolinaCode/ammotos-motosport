"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";

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
  };
  filterData: {
    categories: { category: string; categoryEs: string }[];
    subcategories: { subcategory: string; subcategoryEs: string }[];
    productNames: { productName: string }[];
  };
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

    const result = hasFilters
      ? await productsSyncService.getProductsByBrandFiltered(brandId, page, filters)
      : await productsSyncService.getProductsByBrandPaginated(brandId, page);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalMatches = (result as any).totalMatches ?? result.products.length;

    return {
      data: result.products,
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
        total_matches: totalMatches,
      },
      filterData: result.filterData,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
