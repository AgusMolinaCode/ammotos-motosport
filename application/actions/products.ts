"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";

export async function getProductsByBrand(brandId: number, page: number = 1) {
  try {
    // Obtener directamente de la API con paginación (sin sync a DB)
    const result = await productsSyncService.getProductsByBrandPaginated(
      brandId,
      page
    );

    return {
      data: result.products.map((product) => ({
        id: product.id,
        type: product.type,
        attributes: {
          product_name: product.attributes.product_name,
          mfr_part_number: product.attributes.mfr_part_number,
          thumbnail: product.attributes.thumbnail,
        },
      })),
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
