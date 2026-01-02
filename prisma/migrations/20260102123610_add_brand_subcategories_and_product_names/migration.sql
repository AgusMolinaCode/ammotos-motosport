-- CreateTable
CREATE TABLE "brand_subcategories" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "subcategory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_product_names" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_product_names_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brand_subcategories_brandId_idx" ON "brand_subcategories"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "brand_subcategories_brandId_subcategory_key" ON "brand_subcategories"("brandId", "subcategory");

-- CreateIndex
CREATE INDEX "brand_product_names_brandId_idx" ON "brand_product_names"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "brand_product_names_brandId_productName_key" ON "brand_product_names"("brandId", "productName");
