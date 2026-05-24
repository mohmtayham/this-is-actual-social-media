/*
  Warnings:

  - You are about to drop the column `idea_id` on the `business_plans` table. All the data in the column will be lost.
  - Added the required column `ideaId` to the `business_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `business_plans` DROP FOREIGN KEY `business_plans_idea_id_fkey`;

-- DropIndex
DROP INDEX `business_plans_idea_id_fkey` ON `business_plans`;

-- AlterTable
ALTER TABLE `business_plans` DROP COLUMN `idea_id`,
    ADD COLUMN `ideaId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `business_plans` ADD CONSTRAINT `business_plans_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `ideas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
