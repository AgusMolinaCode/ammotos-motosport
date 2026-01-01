import { NextResponse } from "next/server";
import { inventorySyncService } from "@/infrastructure/services/InventorySyncService";

/**
 * API ENDPOINT: Get inventory cache statistics
 *
 * GET /api/inventory/stats
 *
 * Retorna estadísticas del sistema de caché de inventario:
 * - Total de marcas cacheadas
 * - Total de items de inventario
 * - Edad del caché más antiguo/nuevo (en días)
 * - TTL configurado (2 días)
 */
export async function GET() {
  try {
    const stats = await inventorySyncService.getInventoryCacheStats();

    return NextResponse.json({
      success: true,
      stats: {
        totalCachedBrands: stats.totalCachedBrands,
        totalInventoryItems: stats.totalInventoryItems,
        oldestCacheAgeDays: stats.oldestCacheAgeDays,
        newestCacheAgeDays: stats.newestCacheAgeDays,
        cacheTtlDays: 2, // Informativo: TTL configurado
      },
      message: "Inventory cache statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting inventory cache stats:", error);
    return NextResponse.json(
      {
        error: "Failed to get inventory cache stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
