import { prisma } from "../infrastructure/database/prisma";

async function invalidateCache() {
  try {
    // Eliminar cache de productos para brand 536
    const deleted = await prisma.productPageCache.deleteMany({
      where: { brandId: 536 },
    });

    console.log(`✅ Deleted ${deleted.count} cache entries for brand 536`);
    console.log("🔄 Next time you load /brands/536, it will fetch from API and extract categories");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

invalidateCache();
