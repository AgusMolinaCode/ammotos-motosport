import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(name: string): string {
  // Convert to lowercase, replace spaces and special chars with hyphens
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

async function populateBrandSlugs() {
  console.log("🏷️  Populating brand slugs...\n");

  // Get all brands
  const brands = await prisma.brand.findMany({
    where: {
      slug: "", // Only brands without slug
    },
  });

  console.log(`Found ${brands.length} brands without slug\n`);

  const slugCounts: Record<string, number> = {};

  for (const brand of brands) {
    const baseSlug = generateSlug(brand.name);

    // Handle duplicates
    let slug = baseSlug;
    if (slugCounts[baseSlug]) {
      slugCounts[baseSlug]++;
      slug = `${baseSlug}-${slugCounts[baseSlug]}`;
    } else {
      slugCounts[baseSlug] = 1;
    }

    // Check if slug already exists (from another brand with same name)
    const existingBrand = await prisma.brand.findFirst({
      where: { slug },
    });

    if (existingBrand) {
      slugCounts[baseSlug]++;
      slug = `${baseSlug}-${slugCounts[baseSlug]}`;
    }

    await prisma.brand.update({
      where: { id: brand.id },
      data: { slug },
    });

    console.log(`  ✅ ${brand.name} → ${slug}`);
  }

  console.log("\n🎉 Done! All brands now have slugs.");
}

populateBrandSlugs()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
