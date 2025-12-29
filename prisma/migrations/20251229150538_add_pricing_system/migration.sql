-- CreateTable
CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseCost" DOUBLE PRECISION NOT NULL,
    "hasMap" BOOLEAN NOT NULL,
    "canPurchase" BOOLEAN NOT NULL,
    "pricelists" JSONB NOT NULL,
    "mapPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_page_cache" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_page_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_prices_productId_key" ON "product_prices"("productId");

-- CreateIndex
CREATE INDEX "product_prices_productId_idx" ON "product_prices"("productId");

-- CreateIndex
CREATE INDEX "product_prices_hasMap_idx" ON "product_prices"("hasMap");

-- CreateIndex
CREATE INDEX "price_page_cache_brandId_idx" ON "price_page_cache"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "price_page_cache_brandId_page_key" ON "price_page_cache"("brandId", "page");
