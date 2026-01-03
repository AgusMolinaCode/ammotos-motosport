import { prisma } from "@/infrastructure/database/prisma";
import { traducirSubcategoria } from "@/constants/categorias";

async function main() {
  console.log("🔄 Actualizando traducciones de subcategorías...");

  // Obtener todas las subcategorías (sin filtro para evitar error de validación)
  const subcategories = await prisma.brandSubcategory.findMany();

  console.log(`📊 Encontradas ${subcategories.length} subcategorías`);

  // Actualizar cada una con su traducción
  let updated = 0;
  let unchanged = 0;

  for (const subcategory of subcategories) {
    const translation = traducirSubcategoria(subcategory.subcategory);

    // Solo actualizar si el campo existe y está vacío o es diferente
    await prisma.$executeRaw`
      UPDATE brand_subcategories
      SET "subcategoryEs" = ${translation}
      WHERE id = ${subcategory.id}
    `;

    if (translation !== subcategory.subcategory) {
      console.log(`✅ ${subcategory.subcategory} → ${translation}`);
      updated++;
    } else {
      console.log(`⚠️ Sin traducción: ${subcategory.subcategory}`);
      unchanged++;
    }
  }

  console.log(`\n✅ Proceso completado:`);
  console.log(`   - Traducidas: ${updated}`);
  console.log(`   - Sin traducción disponible: ${unchanged}`);
  console.log(`   - Total procesadas: ${updated + unchanged}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
