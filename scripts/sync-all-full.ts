#!/usr/bin/env tsx
/**
 * Script para sincronizar TODOS los productos desde Turn14 API a la DB local.
 *
 * Usage:
 *   npx tsx scripts/sync-all-full.ts
 *
 * Este script:
 * 1. Crea la tabla si no existe (via Prisma)
 * 2. Obtiene todas las páginas de /v1/items
 * 3. Guarda/actualiza cada producto en la DB
 */

import { globalProductsSyncService } from "@/infrastructure/services/GlobalProductsSyncService";

async function main() {
  console.log("\n🔄 SYNC COMPLETO DE PRODUCTOS - TURN14");
  console.log("========================================\n");

  try {
    console.log("🚀 Iniciando sync completo de todos los productos...\n");

    const result = await globalProductsSyncService.syncAllProductsFull();

    console.log("\n📋 RESULTADOS:");
    console.log(`   ✅ Éxito: ${result.success ? "Sí" : "No"}`);
    console.log(`   📄 Páginas procesadas: ${result.syncedPages}/${result.totalPages}`);
    console.log(`   📦 Total productos guardados: ${result.totalProducts}`);
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
