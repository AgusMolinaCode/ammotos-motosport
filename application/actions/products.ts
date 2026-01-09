"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import { prisma } from "@/infrastructure/database/prisma";
import type { ProductData, ProductsResponse, Product as Turn14Product, ProductFile } from "@/domain/types/turn14/products";
import type { BrandFilterData } from "@/infrastructure/services/ProductsSyncService";

// Tipo para filtros de productos
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  productName?: string;
}

// Tipo para productos en OfferItems
export interface OfferProduct {
  id: string;
  productName: string;
  partNumber: string;
  brandName: string;
  brandId: number;
  thumbnail: string | null;
  files: ProductFile[];
  price: number | null;
}

export interface ProductsWithFiltersResult {
  data: Turn14Product[];
  meta: {
    total_pages: number;
    current_page: number;
    total_matches?: number;
    total_products?: number;
  };
  filterData: BrandFilterData;
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
): Promise<ProductsWithFiltersResult> {
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

    const totalMatches = "totalMatches" in result ? result.totalMatches : result.products.length;

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

/**
 * Obtener datos de un producto específico por ID (con caché en DB)
 * 1. Primero busca en DB
 * 2. Si no está o tiene más de 7 días, fetch desde API y guarda en DB
 */
export async function getProductDataById(itemId: string): Promise<ProductData | null> {
  try {
    return await productsSyncService.getProductDataById(itemId);
  } catch (error) {
    console.error(`Error fetching product data for ${itemId}:`, error);
    throw error;
  }
}

/**
 * Obtener productos actualizados o añadidos en los últimos X días
 *
 * @param page - Número de página (required)
 * @param days - Número de días (1-15, default: 1)
 * @returns ProductsResponse con productos actualizados
 */
export async function getItemsUpdates(
  page: number = 1,
  days: number = 1
): Promise<ProductsResponse> {
  try {
    return await productsSyncService.getItemsUpdates(page, days);
  } catch (error) {
    console.error(`Error fetching items updates:`, error);
    throw error;
  }
}

/**
 * Obtener productos recomendados con stock (para sección de ofertas)
 * 1. Filtra productos con canPurchase = true (tienen stock)
 * 2. Ordena por clearanceItem para priorizar ofertas
 * 3. Toma 10 productos aleatorios
 */
export async function getRecommendedProducts(count: number = 10) {
  try {
    // Contar productos con stock
    const totalWithStock = await prisma.productPrice.count({
      where: { canPurchase: true }
    });

    if (totalWithStock === 0) {
      return [];
    }

    // Obtener skip aleatorio (asegurar que hay suficientes productos)
    const skip = Math.max(0, Math.floor(Math.random() * Math.min(totalWithStock - count, 1000)));

    // Obtener productos con stock
    const productsWithStock = await prisma.productPrice.findMany({
      where: { canPurchase: true },
      take: Math.min(count + skip, totalWithStock),
      skip: skip,
      select: { productId: true }
    });

    if (productsWithStock.length === 0) {
      return [];
    }

    // Obtener detalles de los productos
    const productIds = productsWithStock.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      take: count
    });

    // Shuffle para aleatoriedad
    return products.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return [];
  }
}

/**
 * Obtener productos de brands específicos (para sección de ofertas)
 * @param count - Cantidad de productos
 * @param brandIds - Array de IDs de brands
 */
export async function getProductsByBrandsForOffers(
  count: number = 12,
  brandIds: number[]
): Promise<OfferProduct[]> {
  try {
    return await productsSyncService.getProductsByBrands(count, brandIds) as OfferProduct[];
  } catch (error) {
    console.error("Error fetching products by brands:", error);
    return [];
  }
}
