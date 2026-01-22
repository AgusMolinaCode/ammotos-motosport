import { globalProductsSyncService } from "@/infrastructure/services/GlobalProductsSyncService";
import { NextResponse } from "next/server";

/**
 * POST /api/sync/updates
 * Sincronizar productos actualizados/nuevos de los últimos X días
 *
 * Body:
 * - days: number (1-15, default: 3)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let days = parseInt(body.days) || 3;

    // Validar rango (1-15 según documentación de Turn14)
    days = Math.max(1, Math.min(15, days));

    console.log(`📡 API: Iniciando sync de updates (últimos ${days} días)...`);

    const result = await globalProductsSyncService.syncUpdates(days);

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Sync de updates completado" : "Sync completado con errores",
      data: {
        days,
        totalPages: result.totalPages,
        syncedPages: result.syncedPages,
        newProducts: result.newProducts,
        updatedProducts: result.updatedProducts,
        errorsCount: result.errors.length,
        duration: result.duration,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("❌ API Error en sync/updates:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/updates
 * Verificar estado del último sync de updates
 */
export async function GET() {
  try {
    const stats = await globalProductsSyncService.getSyncStats();

    return NextResponse.json({
      success: true,
      data: {
        lastUpdateSync: stats.lastUpdateSync,
        totalProducts: stats.totalProducts,
      },
    });
  } catch (error) {
    console.error("❌ API Error en sync/updates GET:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
