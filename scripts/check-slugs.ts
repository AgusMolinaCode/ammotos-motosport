import { PrismaClient } from './generated/prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  // Verificar Carrilo
  const carrillo = await prisma.brand.findFirst({
    where: { name: { contains: 'Carrillo' } },
    select: { id: true, name: true, slug: true }
  });
  console.log('Carrillo:', carrillo);

  // Contar marcas sin slug
  const totalWithoutSlug = await prisma.brand.count({
    where: { slug: { equals: '' } }
  });
  console.log('Total sin slug:', totalWithoutSlug);

  // Contar marcas con slug
  const totalWithSlug = await prisma.brand.count({
    where: { slug: { not: '' } }
  });
  console.log('Total con slug:', totalWithSlug);

  // Muestra algunas sin slug
  const brandsWithoutSlug = await prisma.brand.findMany({
    where: { slug: { equals: '' } },
    select: { id: true, name: true, slug: true },
    take: 10
  });
  console.log('\nMarcas sin slug:', brandsWithoutSlug);
}

main().catch(console.error);
