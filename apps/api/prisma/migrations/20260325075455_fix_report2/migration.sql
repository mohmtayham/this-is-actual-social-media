/*
  Warnings:

  - A unique constraint covering the columns `[idea_id,report_type]` on the table `reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `reports_idea_id_report_type_key` ON `reports`(`idea_id`, `report_type`);
