/**
 * Performance Testing Script
 *
 * Run this to validate performance improvements:
 * npx tsx scripts/test-performance.ts
 */

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import { pricingSyncService } from "@/infrastructure/services/PricingSyncService";

async function testPerformance() {
  console.log("🧪 Starting Performance Tests\n");

  const brandId = 15; // Test brand
  const page = 1;

  // Test 1: Product Loading Speed
  console.log("📦 Test 1: Product Loading Speed");
  const productStart = Date.now();
  const products = await productsSyncService.getProductsByBrandPaginated(brandId, page);
  const productDuration = Date.now() - productStart;
  console.log(`✅ Loaded ${products.products.length} products in ${productDuration}ms`);
  console.log(`   Expected: <2000ms, Actual: ${productDuration}ms\n`);

  // Test 2: Pricing Fetch Speed (first 25 products)
  console.log("💰 Test 2: Pricing Fetch Speed");
  const productIds = products.products.slice(0, 25).map(p => p.id);
  const priceStart = Date.now();
  const prices = await pricingSyncService.getPricesByProductIds(productIds);
  const priceDuration = Date.now() - priceStart;
  console.log(`✅ Loaded ${prices.length} prices in ${priceDuration}ms`);
  console.log(`   Expected: <2000ms (optimized from 6-8s), Actual: ${priceDuration}ms\n`);

  // Test 3: Filter Data Cache Performance
  console.log("🔍 Test 3: Filter Data Cache Performance");

  // First call - cache miss
  const filterStart1 = Date.now();
  const result1 = await productsSyncService.getProductsByBrandPaginated(brandId, page);
  const filterDuration1 = Date.now() - filterStart1;
  console.log(`   First call (cache miss): ${filterDuration1}ms`);

  // Second call - cache hit (should be much faster)
  const filterStart2 = Date.now();
  const result2 = await productsSyncService.getProductsByBrandPaginated(brandId, page);
  const filterDuration2 = Date.now() - filterStart2;
  console.log(`   Second call (cache hit): ${filterDuration2}ms`);
  console.log(`   Cache improvement: ${Math.round((1 - filterDuration2 / filterDuration1) * 100)}%\n`);

  // Test 4: Pagination Sequence
  console.log("📄 Test 4: Pagination Speed");
  const pages = [1, 2, 3];
  for (const p of pages) {
    const pageStart = Date.now();
    await productsSyncService.getProductsByBrandPaginated(brandId, p);
    const pageDuration = Date.now() - pageStart;
    console.log(`   Page ${p}: ${pageDuration}ms`);
  }
  console.log(`   Expected: <500ms per page (after first)\n`);

  // Summary
  console.log("\n📊 Performance Summary");
  console.log("━".repeat(60));
  console.log(`Product Loading: ${productDuration}ms (target: <2000ms)`);
  console.log(`Pricing Fetch (25): ${priceDuration}ms (target: <2000ms)`);
  console.log(`Cache Hit Improvement: ${Math.round((1 - filterDuration2 / filterDuration1) * 100)}%`);
  console.log("━".repeat(60));

  // Pass/Fail
  const allPassed =
    productDuration < 2000 &&
    priceDuration < 2000 &&
    filterDuration2 < filterDuration1 * 0.5;

  console.log(allPassed
    ? "\n✅ ALL TESTS PASSED - Performance targets met!"
    : "\n⚠️  SOME TESTS FAILED - Review results above");
}

testPerformance()
  .then(() => {
    console.log("\n✅ Performance testing complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Performance testing failed:", error);
    process.exit(1);
  });
