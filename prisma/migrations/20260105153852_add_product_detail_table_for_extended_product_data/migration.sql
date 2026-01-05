-- AlterTable
ALTER TABLE "brand_subcategories" ALTER COLUMN "subcategoryEs" SET DEFAULT '';

-- CreateTable
CREATE TABLE "product_details" (
    "id" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "descriptions" JSONB NOT NULL,
    "vehicleFitments" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_details_id_idx" ON "product_details"("id");

-- CreateIndex
CREATE INDEX "products_brandId_category_idx" ON "products"("brandId", "category");

-- CreateIndex
CREATE INDEX "products_brandId_subcategory_idx" ON "products"("brandId", "subcategory");

-- CreateIndex
CREATE INDEX "products_brandId_productName_idx" ON "products"("brandId", "productName");

-- CreateIndex
CREATE INDEX "products_brandId_category_subcategory_idx" ON "products"("brandId", "category", "subcategory");

-- CreateIndex
CREATE INDEX "products_brandId_category_apiPage_idx" ON "products"("brandId", "category", "apiPage");
