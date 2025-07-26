/*
  Warnings:

  - A unique constraint covering the columns `[code,retailerName]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_retailerName_key" ON "Coupon"("code", "retailerName");
