/*
  Warnings:

  - Added the required column `subcategoryEs` to the `brand_subcategories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "brand_subcategories" ADD COLUMN     "subcategoryEs" TEXT NOT NULL;
