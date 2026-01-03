"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";

export interface ProductsWithFiltersResult {
  data: ReturnType<typeof productsSyncService.getProductsByBrandPaginated> extends Promise<infer T>
    ? T extends { products: infer P } ? { products: P; filterData?: any }
    : never
    : never;
  meta: {
    total_pages: number;
    current_page: number;
  };
  filterData: {
    categories: { category: string; categoryEs: string }[];
    subcategories: { subcategory: string; subcategoryEs: string }[];
    productNames: { productName: string }[];
  };
}

export async function getProductsByBrand(brandId: number, page: number = 1) {
  try {
    // Obtener directamente de la API con paginación (sin sync a DB)
    const result = await productsSyncService.getProductsByBrandPaginated(
      brandId,
      page
    );

    return {
      data: result.products,
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
      },
      // Incluir filterData directamente desde el resultado del sync
      filterData: result.filterData,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
