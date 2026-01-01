-- CreateTable
CREATE TABLE "brand_inventory" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "itemId" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL,
    "inventory" JSONB NOT NULL,
    "manufacturerStock" INTEGER NOT NULL,
    "manufacturerEsd" TEXT NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_cache" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brand_inventory_brandId_idx" ON "brand_inventory"("brandId");

-- CreateIndex
CREATE INDEX "brand_inventory_itemId_idx" ON "brand_inventory"("itemId");

-- CreateIndex
CREATE INDEX "brand_inventory_cachedAt_idx" ON "brand_inventory"("cachedAt");

-- CreateIndex
CREATE UNIQUE INDEX "brand_inventory_brandId_itemId_key" ON "brand_inventory"("brandId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_cache_brandId_key" ON "inventory_cache"("brandId");

-- CreateIndex
CREATE INDEX "inventory_cache_brandId_idx" ON "inventory_cache"("brandId");

-- CreateIndex
CREATE INDEX "inventory_cache_cachedAt_idx" ON "inventory_cache"("cachedAt");
