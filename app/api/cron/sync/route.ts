import { globalProductsSyncService } from "@/infrastructure/services/GlobalProductsSyncService";
import { NextResponse } from "next/server";

/**
 * POST /api/cron/sync
 *
 * Job cron para sincronización automática de productos Turn14.
 *
 * Schedule recomendado (vercel.json):
 * - Cada 3 días para updates
 * - Cada 7 días para sync completo
 *
 * Este endpoint:
 * 1. Ejecuta sync de updates (productos nuevos/modificados últimos 3 días)
 * 2. Si pasaron más de 7 días desde el último sync completo, lo ejecuta
 */
export async function POST() {
  const startTime = Date.now();
  const results: any = {};

  console.log("⏰ CRON: Iniciando job de sync automático...");

  try {
    // 1. Sync de updates (últimos 3 días)
    console.log("📦 CRON: Sincronizando updates (últimos 3 días)...");
    const updateResult = await globalProductsSyncService.syncUpdates(3);

    results.updates = {
      success: updateResult.success,
      pages: `${updateResult.syncedPages}/${updateResult.totalPages}`,
      newProducts: updateResult.newProducts,
      updatedProducts: updateResult.updatedProducts,
      errors: updateResult.errors.length,
      duration: updateResult.duration.toFixed(2) + "s",
    };

    // 2. Verificar si necesitamos sync completo
    const daysSinceFullSync = await globalProductsSyncService.getDaysSinceLastFullSync();
    const FULL_SYNC_THRESHOLD_DAYS = 7;

    results.fullSyncNeeded = daysSinceFullSync >= FULL_SYNC_THRESHOLD_DAYS;

    if (daysSinceFullSync >= FULL_SYNC_THRESHOLD_DAYS) {
      console.log(`📦 CRON: Ejecutando sync completo (último hace ${daysSinceFullSync.toFixed(1)} días)...`);
      const fullResult = await globalProductsSyncService.syncAllProductsFull();

      results.fullSync = {
        triggered: true,
        success: fullResult.success,
        pages: `${fullResult.syncedPages}/${fullResult.totalPages}`,
        totalProducts: fullResult.totalProducts,
        errors: fullResult.errors.length,
        duration: fullResult.duration.toFixed(2) + "s",
      };
    } else {
      results.fullSync = {
        triggered: false,
        daysSinceLastSync: daysSinceFullSync.toFixed(1),
        thresholdDays: FULL_SYNC_THRESHOLD_DAYS,
      };
    }

    const totalDuration = (Date.now() - startTime) / 1000;
    results.totalDuration = totalDuration.toFixed(2) + "s";
    results.timestamp = new Date().toISOString();

    console.log("✅ CRON: Job completado");

    return NextResponse.json({
      success: true,
      message: "Cron sync job completed",
      results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ CRON Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        results,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/sync
 * Verificar estado del cron (sin ejecutar)
 */
export async function GET() {
  try {
    const stats = await globalProductsSyncService.getSyncStats();
    const daysSinceFullSync = stats.daysSinceFullSync;
    const FULL_SYNC_THRESHOLD_DAYS = 7;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: stats.totalProducts,
        lastFullSync: stats.lastFullSync,
        lastUpdateSync: stats.lastUpdateSync,
        daysSinceFullSync: daysSinceFullSync === Infinity ? null : daysSinceFullSync.toFixed(1),
        fullSyncNeeded: daysSinceFullSync >= FULL_SYNC_THRESHOLD_DAYS,
        nextCronRecommended: FULL_SYNC_THRESHOLD_DAYS - (daysSinceFullSync || 0),
      },
    });
  } catch (error) {
    console.error("❌ API Error en cron/sync GET:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
