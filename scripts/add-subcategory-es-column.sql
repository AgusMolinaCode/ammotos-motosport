-- Agregar columna subcategoryEs si no existe
ALTER TABLE brand_subcategories
ADD COLUMN IF NOT EXISTS "subcategoryEs" TEXT NOT NULL DEFAULT '';
