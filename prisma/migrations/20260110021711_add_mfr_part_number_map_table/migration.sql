-- CreateTable
CREATE TABLE "mfr_part_number_map" (
    "mfrPartNumber" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "thumbnail" TEXT,
    "brandId" INTEGER NOT NULL,
    "brandName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfr_part_number_map_pkey" PRIMARY KEY ("mfrPartNumber")
);

-- CreateIndex
CREATE INDEX "mfr_part_number_map_mfrPartNumber_idx" ON "mfr_part_number_map"("mfrPartNumber");
