-- CreateTable
CREATE TABLE `post_launch_followups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `launch_request_id` INTEGER NOT NULL,
    `followup_phase` ENUM('week_1', 'month_1', 'month_3', 'month_6') NOT NULL,
    `scheduled_date` DATETIME(3) NOT NULL,
    `status` ENUM('pending', 'done', 'issue_detected') NOT NULL DEFAULT 'pending',
    `active_users` INTEGER NULL,
    `revenue` DECIMAL(12, 2) NULL,
    `growth_rate` DECIMAL(5, 2) NULL,
    `performance_status` ENUM('excellent', 'stable', 'at_risk', 'failing') NULL,
    `risk_level` ENUM('low', 'medium', 'high') NULL,
    `risk_description` TEXT NULL,
    `committee_decision` ENUM('continue', 'extra_support', 'pivot_required', 'terminate', 'graduate') NULL,
    `owner_response` TEXT NULL,
    `owner_acknowledged` BOOLEAN NOT NULL DEFAULT false,
    `marketing_support_given` BOOLEAN NOT NULL DEFAULT false,
    `product_issue_detected` BOOLEAN NOT NULL DEFAULT false,
    `actions_taken` TEXT NULL,
    `committee_notes` TEXT NULL,
    `is_stable` BOOLEAN NOT NULL DEFAULT false,
    `profit_distributed` BOOLEAN NOT NULL DEFAULT false,
    `graduation_date` DATETIME(3) NULL,
    `reviewed_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `post_launch_followups` ADD CONSTRAINT `post_launch_followups_launch_request_id_fkey` FOREIGN KEY (`launch_request_id`) REFERENCES `launch_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_launch_followups` ADD CONSTRAINT `post_launch_followups_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
