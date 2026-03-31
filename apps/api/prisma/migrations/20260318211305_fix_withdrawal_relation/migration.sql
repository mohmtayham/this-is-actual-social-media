-- AlterTable
ALTER TABLE `gantt_charts` ADD COLUMN `evaluation_comments` TEXT NULL;

-- CreateTable
CREATE TABLE `withdrawal_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ideaId` INTEGER NOT NULL,
    `requested_by` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `penalty_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `penalty_paid` BOOLEAN NOT NULL DEFAULT false,
    `reviewed_by` INTEGER NULL,
    `reviewed_at` DATETIME(3) NULL,
    `committee_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `launch_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idea_id` INTEGER NOT NULL,
    `version` INTEGER NULL,
    `execution_steps` TEXT NULL,
    `marketing_strategy` TEXT NULL,
    `risk_mitigation` TEXT NULL,
    `founder_commitment` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'LAUNCHED', 'HALTED') NOT NULL DEFAULT 'SUBMITTED',
    `committee_notes` TEXT NULL,
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `launch_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `ideas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `launch_requests` ADD CONSTRAINT `launch_requests_idea_id_fkey` FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `launch_requests` ADD CONSTRAINT `launch_requests_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
