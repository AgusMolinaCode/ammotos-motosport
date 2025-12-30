-- CreateTable
CREATE TABLE "brand_categories" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "categoryEs" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brand_categories_brandId_idx" ON "brand_categories"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "brand_categories_brandId_category_key" ON "brand_categories"("brandId", "category");
