/*
  Warnings:

  - A unique constraint covering the columns `[idea_id,type]` on the table `meetings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `meetings_idea_id_type_key` ON `meetings`(`idea_id`, `type`);
