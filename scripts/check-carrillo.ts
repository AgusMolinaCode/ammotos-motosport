import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Verificar Carrillo
  const carrillo = await prisma.brand.findFirst({
    where: { name: { contains: 'Carrillo' } },
    select: { id: true, name: true, slug: true }
  });
  console.log('Carrillo:', carrillo);

  // También buscar por similar
  const brands = await prisma.brand.findMany({
    where: { name: { mode: 'insensitive', contains: 'carrillo' } },
    select: { id: true, name: true, slug: true }
  });
  console.log('Marcas con "carrillo":', brands);
}

main().catch(console.error);
