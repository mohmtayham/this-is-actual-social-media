/*
  Warnings:

  - Added the required column `meeting_link` to the `meetings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `meetings` ADD COLUMN `meeting_link` VARCHAR(191) NOT NULL;
