/*
  Warnings:

  - You are about to drop the column `ideaId` on the `business_plans` table. All the data in the column will be lost.
  - Added the required column `idea_id` to the `business_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `business_plans` DROP FOREIGN KEY `business_plans_ideaId_fkey`;

-- DropIndex
DROP INDEX `business_plans_ideaId_fkey` ON `business_plans`;

-- AlterTable
ALTER TABLE `business_plans` DROP COLUMN `ideaId`,
    ADD COLUMN `idea_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `business_plans` ADD CONSTRAINT `business_plans_idea_id_fkey` FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
