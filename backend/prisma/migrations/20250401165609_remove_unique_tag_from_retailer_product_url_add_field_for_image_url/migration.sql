-- DropIndex
DROP INDEX "RetailerProduct_retailerProductUrl_key";

-- AlterTable
ALTER TABLE "RetailerProduct" ADD COLUMN     "imageUrl" TEXT;
