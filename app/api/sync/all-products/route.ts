import { globalProductsSyncService } from "@/infrastructure/services/GlobalProductsSyncService";
import { NextResponse } from "next/server";

/**
 * POST /api/sync/all-products
 * Trigger sync completo de todos los productos desde Turn14 API
 *
 * Body (opcional):
 * - force: boolean - Forzar sync incluso si fue reciente
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    // Verificar si el sync fue reciente (últimas 6 horas)
    if (!force) {
      const daysSinceSync = await globalProductsSyncService.getDaysSinceLastFullSync();
      if (daysSinceSync < 0.25) {
        // Menos de 6 horas desde último sync
        return NextResponse.json(
          {
            success: false,
            message: "Sync reciente. Usa force=true para forzar.",
            hoursSinceSync: (daysSinceSync * 24).toFixed(1),
          },
          { status: 429 }
        );
      }
    }

    console.log("📡 API: Iniciando sync completo de productos...");

    const result = await globalProductsSyncService.syncAllProductsFull();

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Sync completado" : "Sync completado con errores",
      data: {
        totalPages: result.totalPages,
        syncedPages: result.syncedPages,
        totalProducts: result.totalProducts,
        errorsCount: result.errors.length,
        duration: result.duration,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("❌ API Error en sync/all-products:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/all-products
 * Obtener estadísticas del sync
 */
export async function GET() {
  try {
    const stats = await globalProductsSyncService.getSyncStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ API Error en sync/all-products GET:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
