"use server";

import { brandsSyncService } from "@/infrastructure/services/BrandsSyncService";
import type { Brand } from "@/generated/prisma/client";
import type { PriceGroup } from "@/domain/types/turn14/brands";

/**
 * SERVER ACTION: Obtener todas las marcas
 *
 * Obtiene marcas SOLO de la base de datos local.
 * NO sincroniza durante render para evitar errores de hidratación.
 * La sincronización se maneja mediante el endpoint API /api/sync/brands
 */
export async function getBrands() {
  try {
    // Get brands from database ONLY - no sync during render
    const brands = await brandsSyncService.getBrands();

    // Transform to match original API response format
    return {
      data: brands.map((brand: Brand) => ({
        id: brand.id,
        type: "Brand" as const,
        attributes: {
          name: brand.name,
          slug: brand.slug,
          dropship: brand.dropship,
          logo: brand.logo || "",
          pricegroups: brand.pricegroups as unknown as PriceGroup[],
          AAIA: brand.aaia,
        },
      })),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * SERVER ACTION: Obtener marcas con logo para el slider
 *
 * Filtra solo las marcas que tienen logo disponible.
 */
export async function getBrandsWithLogo() {
  try {
    const brands = await brandsSyncService.getBrands();

    // Filtrar solo marcas con logo
    const brandsWithLogo = brands.filter((brand: Brand) => brand.logo && brand.logo.trim() !== "");

    return {
      data: brandsWithLogo.map((brand: Brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
      })),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * SERVER ACTION: Forzar sincronización de marcas
 *
 * Útil para sincronizar manualmente cuando se necesite.
 */
export async function forceSyncBrands() {
  try {
    const result = await brandsSyncService.forceSync();
    return {
      success: true,
      count: result.count,
      message: `Sincronizadas ${result.count} marcas exitosamente`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * SERVER ACTION: Obtener brand por ID con lazy-loading
 *
 * Primera visita: Fetch desde Turn14 API → Cache en DB
 * Visitas subsecuentes: Lectura directa desde DB (sin API call)
 */
export async function getBrandById(brandId: string) {
  try {
    const brand = await brandsSyncService.getBrandById(brandId);

    // Transform to match API response format
    return {
      data: {
        id: brand.id,
        type: "IndividualBrand" as const,
        attributes: {
          name: brand.name,
          dropship: brand.dropship,
          logo: brand.logo || "",
          pricegroups: brand.pricegroups as unknown as PriceGroup[],
          AAIA: brand.aaia,
        },
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get brand by slug (URL-friendly identifier)
 */
export async function getBrandBySlug(slug: string) {
  try {
    const brand = await brandsSyncService.getBrandBySlug(slug);

    if (!brand) {
      return { data: null };
    }

    // Transform to match API response format
    return {
      data: {
        id: brand.id,
        type: "IndividualBrand" as const,
        attributes: {
          name: brand.name,
          slug: brand.slug,
          dropship: brand.dropship,
          logo: brand.logo || "",
          pricegroups: brand.pricegroups as unknown as PriceGroup[],
          AAIA: brand.aaia,
        },
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get brand slug by brand ID
 * Returns the URL-friendly slug for a given brand ID
 */
export async function getBrandSlug(brandId: number): Promise<string> {
  try {
    const brand = await brandsSyncService.getBrandById(brandId.toString());
    // Generate slug from name if not exists
    if (brand.slug) {
      return brand.slug;
    }
    // Fallback: generate slug from name
    return brand.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  } catch (error) {
    // Fallback: generate slug from brandId (shouldn't happen in normal usage)
    return brandId.toString();
  }
}

/**
 * SERVER ACTION: Obtener estadísticas del cache
 */
export async function getBrandCacheStats() {
  try {
    return await brandsSyncService.getBrandCacheStats();
  } catch (error) {
    throw error;
  }
}
