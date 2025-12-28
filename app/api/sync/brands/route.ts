import { NextResponse } from "next/server";
import { brandsSyncService } from "@/infrastructure/services/BrandsSyncService";

/**
 * API Route: Sync Brands
 *
 * GET /api/sync/brands
 * - Verifica si han pasado 7 días desde la última sincronización
 * - Si es necesario, sincroniza las marcas de Turn14 API
 * - Si no es necesario, devuelve información del estado actual
 *
 * Este endpoint debe ser llamado:
 * - Por un cron job (recomendado)
 * - Manualmente cuando se necesite verificar el estado
 * - Al iniciar la aplicación (opcional)
 */
export async function GET() {
  try {
    // Check if sync is needed
    const needsSync = await brandsSyncService.needsSync();

    if (!needsSync) {
      const brands = await brandsSyncService.getBrands();
      return NextResponse.json({
        success: true,
        synced: false,
        message: "La sincronización no es necesaria todavía (< 7 días)",
        count: brands.length,
      });
    }

    // Perform sync
    const result = await brandsSyncService.syncBrands();

    return NextResponse.json({
      success: true,
      synced: true,
      message: `Sincronizadas ${result.count} marcas exitosamente`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error syncing brands:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync/brands
 * Fuerza una sincronización manual inmediata
 */
export async function POST() {
  try {
    const result = await brandsSyncService.forceSync();

    return NextResponse.json({
      success: true,
      synced: true,
      message: `Sincronización forzada: ${result.count} marcas actualizadas`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error forcing sync:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
