"use server";

import { brandsSyncService } from "@/infrastructure/services/BrandsSyncService";
import type { Brand } from "@/app/generated/prisma";

/**
 * SERVER ACTION: Obtener todas las marcas
 *
 * Obtiene marcas de la base de datos local.
 * Sincroniza con Turn14 API automáticamente una vez por semana.
 */
export async function getBrands() {
  try {
    // Sync brands if needed (checks if 7 days have passed)
    await brandsSyncService.syncBrands();

    // Get brands from database
    const brands = await brandsSyncService.getBrands();

    // Transform to match original API response format
    return {
      data: brands.map((brand: Brand) => ({
        id: brand.id,
        type: "Brand" as const,
        attributes: {
          name: brand.name,
          dropship: brand.dropship,
          logo: brand.logo || "",
          pricegroups: brand.pricegroups as any,
          AAIA: brand.aaia,
        },
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
