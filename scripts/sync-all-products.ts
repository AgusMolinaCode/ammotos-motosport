#!/usr/bin/env tsx
/**
 * Script CLI para sincronizar productos de Turn14
 *
 * Usage:
 *   npx tsx scripts/sync-all-products.ts              # Sync completo
 *   npx tsx scripts/sync-all-products.ts --updates    # Solo updates
 *   npx tsx scripts/sync-all-products.ts --stats      # Ver estadísticas
 */

import { globalProductsSyncService } from "@/infrastructure/services/GlobalProductsSyncService";

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] === "--updates" ? "updates" : args[0] === "--stats" ? "stats" : "full";

  console.log("\n🔄 Turn14 Global Products Sync");
  console.log("================================\n");

  try {
    if (mode === "stats") {
      // Mostrar estadísticas
      const stats = await globalProductsSyncService.getSyncStats();

      console.log("📊 Estadísticas de Sync:");
      console.log(`   Total productos en DB: ${stats.totalProducts}`);
      console.log(`   Último sync completo: ${stats.lastFullSync?.toLocaleString() || "Nunca"}`);
      console.log(`   Último sync updates: ${stats.lastUpdateSync?.toLocaleString() || "Nunca"}`);
      console.log(`   Días desde último sync completo: ${stats.daysSinceFullSync === Infinity ? "Nunca" : stats.daysSinceFullSync.toFixed(1)}`);
    } else if (mode === "updates") {
      // Sync de updates (últimos 3 días por defecto)
      const days = 3;
      console.log(`🚀 Ejecutando sync de updates (últimos ${days} días)...\n`);

      const result = await globalProductsSyncService.syncUpdates(days);

      console.log("\n📋 Resultados del Sync de Updates:");
      console.log(`   ✅ Éxito: ${result.success ? "Sí" : "No"}`);
      console.log(`   📄 Páginas procesadas: ${result.syncedPages}/${result.totalPages}`);
      console.log(`   🆕 Productos nuevos: ${result.newProducts}`);
      console.log(`   🔄 Productos actualizados: ${result.updatedProducts}`);
      console.log(`   ❌ Errores: ${result.errors.length}`);
      console.log(`   ⏱️  Duración: ${result.duration.toFixed(2)} segundos`);

      if (result.errors.length > 0) {
        console.log("\n⚠️  Errores detallados:");
        result.errors.forEach((e) => console.log(`   - Página ${e.page}: ${e.error}`));
      }
    } else {
      // Sync completo
      console.log("🚀 Ejecutando sync completo de todos los productos...\n");

      const result = await globalProductsSyncService.syncAllProductsFull();

      console.log("\n📋 Resultados del Sync Completo:");
      console.log(`   ✅ Éxito: ${result.success ? "Sí" : "No"}`);
      console.log(`   📄 Páginas procesadas: ${result.syncedPages}/${result.totalPages}`);
      console.log(`   📦 Total productos: ${result.totalProducts}`);
      console.log(`   ❌ Errores: ${result.errors.length}`);
      console.log(`   ⏱️  Duración: ${result.duration.toFixed(2)} segundos`);

      if (result.errors.length > 0) {
        console.log("\n⚠️  Errores detallados:");
        result.errors.forEach((e) => console.log(`   - Página ${e.page}: ${e.error}`));
      }
    }

    console.log("\n✅ Script completado\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fatal:", error);
    process.exit(1);
  }
}

main();
