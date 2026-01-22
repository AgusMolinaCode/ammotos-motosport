#!/usr/bin/env tsx
/**
 * Script para sincronizar productos actualizados/nuevos de Turn14.
 *
 * Usage:
 *   npx tsx scripts/sync-updates.ts           # Últimos 3 días
 *   npx tsx scripts/sync-updates.ts 7         # Últimos 7 días (max 15)
 *
 * Este script:
 * 1. Obtiene productos nuevos/modificados de /v1/items/updates?days=X
 * 2. Inserta productos nuevos o actualiza existentes
 */

import { globalProductsSyncService } from "@/infrastructure/services/GlobalProductsSyncService";

async function main() {
  // Obtener días del argumento o usar 3 por defecto
  const days = parseInt(process.argv[2]) || 3;
  const validatedDays = Math.max(1, Math.min(15, days));

  console.log("\n🔄 SYNC DE UPDATES - TURN14");
  console.log("============================\n");
  console.log(`📅 Período: últimos ${validatedDays} días\n`);

  try {
    console.log("🚀 Iniciando sync de updates...\n");

    const result = await globalProductsSyncService.syncUpdates(validatedDays);

    console.log("\n📋 RESULTADOS:");
    console.log(`   ✅ Éxito: ${result.success ? "Sí" : "No"}`);
    console.log(`   📄 Páginas procesadas: ${result.syncedPages}/${result.totalPages}`);
    console.log(`   🆕 Productos nuevos: ${result.newProducts}`);
    console.log(`   🔄 Productos actualizados: ${result.updatedProducts}`);
    console.log(`   ❌ Errores: ${result.errors.length}`);
    console.log(`   ⏱️  Duración: ${result.duration.toFixed(2)} segundos`);

    if (result.errors.length > 0) {
      console.log("\n⚠️  ERRORES DETALLADOS:");
      result.errors.forEach((e) => {
        console.log(`   - Página ${e.page}: ${e.error}`);
      });
    }

    console.log("\n✅ SCRIPT COMPLETADO\n");
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error("\n❌ ERROR FATAL:", error);
    process.exit(1);
  }
}

main();
