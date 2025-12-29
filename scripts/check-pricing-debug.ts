import { prisma } from "../infrastructure/database/prisma";

async function debugPricing() {
  const brandId = 228;
  const page = 1;

  console.log("=== PRICING DEBUG for Brand 228 ===\n");

  // 1. Check if products exist
  const productCount = await prisma.product.count({
    where: { brandId },
  });
  console.log(`📦 Products in DB for brand ${brandId}: ${productCount}`);

  if (productCount > 0) {
    // Get first 5 products
    const products = await prisma.product.findMany({
      where: { brandId },
      take: 5,
      select: { id: true, productName: true, mfrPartNumber: true },
    });
    console.log("\n📋 Sample Products:");
    products.forEach((p) =>
      console.log(`  - ${p.id}: ${p.productName} (${p.mfrPartNumber})`)
    );
  }

  // 2. Check if price page cache exists
  const priceCache = await prisma.pricePageCache.findUnique({
    where: {
      brandId_page: { brandId, page },
    },
  });
  console.log(
    `\n💾 Price Cache for page ${page}: ${priceCache ? "EXISTS" : "NOT FOUND"}`
  );
  if (priceCache) {
    const daysSince =
      (Date.now() - priceCache.cachedAt.getTime()) / (1000 * 60 * 60 * 24);
    console.log(
      `   Cached at: ${priceCache.cachedAt.toISOString()} (${daysSince.toFixed(1)} days ago)`
    );
  }

  // 3. Check if prices exist
  const priceCount = await prisma.productPrice.count();
  console.log(`\n💰 Total prices in ProductPrice table: ${priceCount}`);

  // 4. Check if prices exist for this brand's products
  if (productCount > 0) {
    const products = await prisma.product.findMany({
      where: { brandId },
      take: 100,
      select: { id: true },
    });
    const productIds = products.map((p) => p.id);

    const pricesForBrand = await prisma.productPrice.findMany({
      where: {
        productId: { in: productIds },
      },
      take: 5,
    });

    console.log(
      `\n💵 Prices for brand ${brandId} products: ${pricesForBrand.length}`
    );
    if (pricesForBrand.length > 0) {
      console.log("\n📊 Sample Prices:");
      pricesForBrand.forEach((p) =>
        console.log(
          `  - Product ${p.productId}: MAP=${p.mapPrice}, hasMap=${p.hasMap}, cost=${p.purchaseCost}`
        )
      );
    } else {
      console.log("  ❌ No prices found for this brand's products!");
    }
  }

  // 5. Check product page cache
  const productPageCache = await prisma.productPageCache.findUnique({
    where: {
      brandId_page: { brandId, page },
    },
  });
  console.log(
    `\n📦 Product Cache for page ${page}: ${productPageCache ? "EXISTS" : "NOT FOUND"}`
  );

  await prisma.$disconnect();
}

debugPricing().catch(console.error);
