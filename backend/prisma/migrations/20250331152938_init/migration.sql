-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "objectId" TEXT NOT NULL,
    "description" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerProduct" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "retailerName" TEXT NOT NULL,
    "retailerProductId" TEXT NOT NULL,
    "retailerProductUrl" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetailerProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_objectId_key" ON "Product"("objectId");

-- CreateIndex
CREATE UNIQUE INDEX "RetailerProduct_retailerProductUrl_key" ON "RetailerProduct"("retailerProductUrl");

-- AddForeignKey
ALTER TABLE "RetailerProduct" ADD CONSTRAINT "RetailerProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
