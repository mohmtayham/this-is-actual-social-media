/*
  Warnings:

  - You are about to drop the column `content` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `reports` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reports` DROP COLUMN `content`,
    DROP COLUMN `title`,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `evaluation_score` DECIMAL(5, 2) NULL,
    ADD COLUMN `meeting_id` INTEGER NULL,
    ADD COLUMN `recommendations` TEXT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `strengths` TEXT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `weaknesses` TEXT NULL;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
