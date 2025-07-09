/*
  Warnings:

  - Added the required column `retailerUrl` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "retailerUrl" TEXT NOT NULL;
