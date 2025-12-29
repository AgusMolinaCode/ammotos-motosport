-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dropship" BOOLEAN NOT NULL,
    "logo" TEXT,
    "aaia" TEXT[],
    "pricegroups" JSONB NOT NULL,
    "detailsFetched" BOOLEAN NOT NULL DEFAULT false,
    "detailsFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_control" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "lastSync" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "brandName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "mfrPartNumber" TEXT NOT NULL,
    "partDescription" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "priceGroupId" INTEGER NOT NULL,
    "priceGroup" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "regularStock" BOOLEAN NOT NULL,
    "thumbnail" TEXT,
    "dimensions" JSONB NOT NULL,
    "warehouseAvailability" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_page_cache" (
    "id" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_page_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brands_name_idx" ON "brands"("name");

-- CreateIndex
CREATE INDEX "brands_detailsFetched_idx" ON "brands"("detailsFetched");

-- CreateIndex
CREATE UNIQUE INDEX "sync_control_entity_key" ON "sync_control"("entity");

-- CreateIndex
CREATE INDEX "products_brandId_idx" ON "products"("brandId");

-- CreateIndex
CREATE INDEX "products_partNumber_idx" ON "products"("partNumber");

-- CreateIndex
CREATE INDEX "products_mfrPartNumber_idx" ON "products"("mfrPartNumber");

-- CreateIndex
CREATE INDEX "product_page_cache_brandId_idx" ON "product_page_cache"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "product_page_cache_brandId_page_key" ON "product_page_cache"("brandId", "page");
