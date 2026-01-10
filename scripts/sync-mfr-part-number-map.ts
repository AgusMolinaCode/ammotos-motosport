/**
 * Script de sync incremental para la tabla mfr_part_number_map
 *
 * Este script usa el endpoint getItemsUpdates de Turn14 API para
 * obtener solo los productos nuevos o modificados en los últimos X días
 * y actualizar la tabla de mapeo.
 *
 * Para ejecutar periódicamente (cron job) o manualmente.
 *
 * Ejecución: npx tsx scripts/sync-mfr-part-number-map.ts [dias]
 * Ejemplo: npx tsx scripts/sync-mfr-part-number-map.ts 7
 */

import { authService } from "../infrastructure/providers/AuthProviderFactory";
import { prisma } from "../infrastructure/database/prisma";

interface Turn14Product {
  id: string;
  attributes: {
    product_name: string;
    part_number: string;
    mfr_part_number: string;
    brand_id: number;
    brand: string;
    thumbnail: string;
  };
}

interface Turn14Response {
  data: Turn14Product[];
  meta: {
    total_pages: number;
    current_page: number;
    total_products?: number;
  };
}

async function fetchUpdates(page: number, days: number): Promise<Turn14Response> {
  const response = await fetch(
    `https://api.turn14.com/v1/items/updates?page=${page}&days=${days}`,
    {
      headers: {
        Authorization: await authService.getAuthorizationHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch updates page ${page}: ${response.status}`);
  }

  return response.json();
}

async function sync(days: number = 7) {
  console.log(`=== Sync MfrPartNumberMap (últimos ${days} días) ===\n`);

  const startTime = Date.now();
  let totalProcessed = 0;
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      try {
        const response = await fetchUpdates(page, days);
        const products = extractProducts(response.data);

        if (products.length > 0) {
          await upsertProducts(products);
          totalProcessed += products.length;
          console.log(`Página ${page} - Actualizados: ${products.length}`);
        }

        // Verificar si hay más páginas
        hasMore = response.data.length > 0;

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
        page++;
      } catch (error) {
        console.error(`Error en página ${page}:`, error);
        hasMore = false;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n=== Sync completado en ${elapsed}s ===`);
    console.log(`Total productos actualizados: ${totalProcessed}`);

    if (totalProcessed === 0) {
      console.log("\nNo hay productos nuevos o modificados.");
    }
  } catch (error) {
    console.error("Error fatal:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function extractProducts(data: Turn14Product[]) {
  return data
    .filter((p) => p.attributes.mfr_part_number)
    .map((p) => ({
      mfrPartNumber: p.attributes.mfr_part_number,
      productId: p.id,
      productName: p.attributes.product_name,
      thumbnail: p.attributes.thumbnail || null,
      brandId: p.attributes.brand_id,
      brandName: p.attributes.brand,
    }));
}

async function upsertProducts(products: ReturnType<typeof extractProducts>) {
  if (products.length === 0) return;

  await Promise.all(
    products.map((product) =>
      prisma.mfrPartNumberMap.upsert({
        where: { mfrPartNumber: product.mfrPartNumber },
        update: {
          productName: product.productName,
          thumbnail: product.thumbnail,
          brandName: product.brandName,
        },
        create: product,
      })
    )
  );
}

// Obtener días del argumento o usar 7 por defecto
const days = parseInt(process.argv[2]) || 7;
sync(days);
