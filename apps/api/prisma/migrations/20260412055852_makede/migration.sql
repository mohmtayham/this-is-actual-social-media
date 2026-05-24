/*
  Warnings:

  - You are about to alter the column `evaluation_score` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Double`.

*/
-- AlterTable
ALTER TABLE `reports` MODIFY `evaluation_score` DOUBLE NULL;
