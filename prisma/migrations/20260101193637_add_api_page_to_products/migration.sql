-- AlterTable
ALTER TABLE "products" ADD COLUMN     "apiPage" INTEGER;

-- CreateIndex
CREATE INDEX "products_brandId_apiPage_idx" ON "products"("brandId", "apiPage");
