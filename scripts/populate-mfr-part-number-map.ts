/**
 * Script de populate inicial para la tabla mfr_part_number_map
 *
 * Este script itera por todas las páginas de la API de Turn14 y pobla
 * la tabla de mapeo mfrPartNumber -> datos de producto.
 *
 * IMPORTANTE: Ejecutar solo una vez para poblar la tabla completa.
 * Para updates incrementales, usar sync-mfr-part-number-map.ts
 *
 * Ejecución: npx tsx scripts/populate-mfr-part-number-map.ts
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
  };
}

async function fetchPage(page: number): Promise<Turn14Response> {
  const response = await fetch(`https://api.turn14.com/v1/items?page=${page}`, {
    headers: {
      Authorization: await authService.getAuthorizationHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${page}: ${response.status}`);
  }

  return response.json();
}

async function populate() {
  console.log("=== Populate MfrPartNumberMap ===\n");

  const startTime = Date.now();
  let totalProcessed = 0;
  let page = 1;

  try {
    // Obtener primera página para saber el total de páginas
    console.log("Obteniendo información de paginación...");
    const firstPage = await fetchPage(1);
    const totalPages = firstPage.meta.total_pages;

    console.log(`Total páginas a procesar: ${totalPages}\n`);

    // Procesar primera página
    const productsToInsert = extractProducts(firstPage.data);
    await upsertProducts(productsToInsert);
    totalProcessed += productsToInsert.length;
    console.log(`Página ${page}/${totalPages} - Insertados: ${productsToInsert.length}`);

    // Procesar páginas restantes
    for (page = 2; page <= totalPages; page++) {
      try {
        const response = await fetchPage(page);
        const products = extractProducts(response.data);
        await upsertProducts(products);
        totalProcessed += products.length;

        if (page % 50 === 0 || page === totalPages) {
          console.log(`Página ${page}/${totalPages} - Total insertados: ${totalProcessed}`);
        }

        // Rate limiting: esperar 100ms entre requests
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error en página ${page}:`, error);
        // Continuar con la siguiente página en caso de error
        continue;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n=== Completado en ${elapsed}s ===`);
    console.log(`Total productos procesados: ${totalProcessed}`);
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

  // Usar upsert en lote para mejor performance
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

// Ejecutar
populate();
