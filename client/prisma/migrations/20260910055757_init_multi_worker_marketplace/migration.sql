/*
  Warnings:

  - You are about to drop the column `assigned_to` on the `jobs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `jobs` DROP FOREIGN KEY `jobs_assigned_to_fkey`;

-- DropForeignKey
ALTER TABLE `jobs` DROP FOREIGN KEY `jobs_created_by_fkey`;

-- DropIndex
DROP INDEX `jobs_assigned_to_fkey` ON `jobs`;

-- AlterTable
ALTER TABLE `jobs` DROP COLUMN `assigned_to`,
    ADD COLUMN `application_deadline` TIMESTAMP(6) NULL,
    ADD COLUMN `assigned_worker_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `maximum_workers` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `minimum_workers` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `preferred_date` DATE NULL,
    ADD COLUMN `preferred_end_time` VARCHAR(10) NULL,
    ADD COLUMN `preferred_start_time` VARCHAR(10) NULL,
    ADD COLUMN `required_workers` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `service_name` VARCHAR(100) NULL,
    ADD COLUMN `staffing_status` ENUM('OPEN', 'PARTIALLY_ASSIGNED', 'FULLY_ASSIGNED', 'ADDITIONAL_WORKERS_REQUIRED') NOT NULL DEFAULT 'OPEN',
    ADD COLUMN `worker_req_type` ENUM('CUSTOMER_DEFINED', 'PLATFORM_RECOMMENDED', 'UNKNOWN') NOT NULL DEFAULT 'CUSTOMER_DEFINED',
    MODIFY `currency` VARCHAR(10) NULL DEFAULT 'INR';

-- AlterTable
ALTER TABLE `workers` ADD COLUMN `hourly_rate` DECIMAL(10, 2) NULL,
    ADD COLUMN `is_verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT NULL,
    `direct_hire_request_id` BIGINT NULL,
    `customer_id` BIGINT NOT NULL,
    `worker_id` BIGINT NOT NULL,
    `role` ENUM('LEAD', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `scheduled_date` DATE NOT NULL,
    `start_time` VARCHAR(10) NOT NULL,
    `end_time` VARCHAR(10) NOT NULL,
    `start_otp` VARCHAR(6) NULL,
    `otp_expires_at` TIMESTAMP(6) NULL,
    `status` ENUM('ASSIGNED', 'CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ASSIGNED',
    `confirmed_at` TIMESTAMP(6) NULL,
    `on_the_way_at` TIMESTAMP(6) NULL,
    `arrived_at` TIMESTAMP(6) NULL,
    `started_at` TIMESTAMP(6) NULL,
    `completed_at` TIMESTAMP(6) NULL,
    `cancelled_at` TIMESTAMP(6) NULL,
    `cancellation_reason` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    UNIQUE INDEX `assignments_direct_hire_request_id_key`(`direct_hire_request_id`),
    INDEX `assignments_worker_id_scheduled_date_idx`(`worker_id`, `scheduled_date`),
    INDEX `assignments_worker_id_status_idx`(`worker_id`, `status`),
    INDEX `assignments_job_id_idx`(`job_id`),
    INDEX `assignments_customer_id_idx`(`customer_id`),
    INDEX `assignments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `actor_id` BIGINT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` BIGINT NOT NULL,
    `previous_state` JSON NULL,
    `new_state` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_actor_id_idx`(`actor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` ENUM('DIRECT', 'JOB_GROUP') NOT NULL DEFAULT 'DIRECT',
    `customer_id` BIGINT NULL,
    `worker_id` BIGINT NULL,
    `job_id` BIGINT NULL,
    `direct_hire_request_id` BIGINT NULL,
    `assignment_id` BIGINT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `conversations_job_id_idx`(`job_id`),
    INDEX `conversations_customer_id_idx`(`customer_id`),
    INDEX `conversations_worker_id_idx`(`worker_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation_members` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `joined_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `conversation_members_user_id_idx`(`user_id`),
    UNIQUE INDEX `conversation_members_conversation_id_user_id_key`(`conversation_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `direct_hire_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT NOT NULL,
    `worker_id` BIGINT NOT NULL,
    `service_name` VARCHAR(100) NULL,
    `address_id` BIGINT NULL,
    `requested_date` DATE NOT NULL,
    `requested_start_time` VARCHAR(10) NOT NULL,
    `requested_end_time` VARCHAR(10) NOT NULL,
    `customer_message` TEXT NULL,
    `proposed_price` DECIMAL(10, 2) NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `expires_at` TIMESTAMP(6) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `direct_hire_requests_worker_id_status_idx`(`worker_id`, `status`),
    INDEX `direct_hire_requests_customer_id_idx`(`customer_id`),
    INDEX `direct_hire_requests_requested_date_idx`(`requested_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_applications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT NOT NULL,
    `worker_id` BIGINT NOT NULL,
    `message` TEXT NULL,
    `proposed_price` DECIMAL(10, 2) NULL,
    `status` ENUM('SUBMITTED', 'WITHDRAWN', 'SHORTLISTED', 'SELECTED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `job_applications_job_id_status_idx`(`job_id`, `status`),
    INDEX `job_applications_worker_id_idx`(`worker_id`),
    UNIQUE INDEX `job_applications_job_id_worker_id_key`(`job_id`, `worker_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT NOT NULL,
    `sender_id` BIGINT NOT NULL,
    `message` TEXT NOT NULL,
    `message_type` ENUM('TEXT', 'SYSTEM', 'IMAGE', 'FILE', 'LOCATION') NOT NULL DEFAULT 'TEXT',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `messages_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `messages_sender_id_idx`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `type` ENUM('JOB_APPLICATION_SUBMITTED', 'JOB_APPLICATION_SELECTED', 'JOB_APPLICATION_REJECTED', 'DIRECT_HIRE_REQUESTED', 'DIRECT_HIRE_ACCEPTED', 'DIRECT_HIRE_DECLINED', 'TEAM_INVITATION_RECEIVED', 'TEAM_INVITATION_ACCEPTED', 'TEAM_INVITATION_DECLINED', 'STAFFING_REQUEST_CREATED', 'STAFFING_REQUEST_APPROVED', 'STAFFING_REQUEST_REJECTED', 'ASSIGNMENT_CONFIRMED', 'ASSIGNMENT_ON_THE_WAY', 'ASSIGNMENT_ARRIVED', 'ASSIGNMENT_STARTED', 'ASSIGNMENT_COMPLETED', 'ASSIGNMENT_CANCELLED', 'NEW_MESSAGE', 'NEW_REVIEW') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `reference_type` VARCHAR(50) NULL,
    `reference_id` BIGINT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `assignment_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `worker_id` BIGINT NOT NULL,
    `rating` TINYINT NOT NULL,
    `comment` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    UNIQUE INDEX `reviews_assignment_id_key`(`assignment_id`),
    INDEX `reviews_worker_id_idx`(`worker_id`),
    INDEX `reviews_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staffing_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT NOT NULL,
    `requested_by_worker_id` BIGINT NULL,
    `additional_workers` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `staffing_requests_job_id_idx`(`job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_invitations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT NOT NULL,
    `inviter_worker_id` BIGINT NOT NULL,
    `invited_worker_id` BIGINT NOT NULL,
    `assignment_id` BIGINT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `expires_at` TIMESTAMP(6) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `team_invitations_job_id_idx`(`job_id`),
    INDEX `team_invitations_invited_worker_id_status_idx`(`invited_worker_id`, `status`),
    UNIQUE INDEX `team_invitations_job_id_invited_worker_id_key`(`job_id`, `invited_worker_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_availabilities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `worker_id` BIGINT NOT NULL,
    `day_of_week` INTEGER NOT NULL,
    `start_time` VARCHAR(10) NOT NULL,
    `end_time` VARCHAR(10) NOT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `worker_availabilities_worker_id_idx`(`worker_id`),
    UNIQUE INDEX `worker_availabilities_worker_id_day_of_week_key`(`worker_id`, `day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_availability_exceptions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `worker_id` BIGINT NOT NULL,
    `exception_date` DATE NOT NULL,
    `start_time` VARCHAR(10) NULL,
    `end_time` VARCHAR(10) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT false,
    `reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `worker_availability_exceptions_worker_id_idx`(`worker_id`),
    UNIQUE INDEX `worker_availability_exceptions_worker_id_exception_date_key`(`worker_id`, `exception_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_connections` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `worker_id` BIGINT NOT NULL,
    `connected_worker_id` BIGINT NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `worker_connections_worker_id_idx`(`worker_id`),
    INDEX `worker_connections_connected_worker_id_idx`(`connected_worker_id`),
    UNIQUE INDEX `worker_connections_worker_id_connected_worker_id_key`(`worker_id`, `connected_worker_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_services` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `worker_id` BIGINT NOT NULL,
    `service_name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `pricing_type` ENUM('HOURLY', 'FIXED') NOT NULL DEFAULT 'HOURLY',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `emergency_available` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `worker_services_service_name_idx`(`service_name`),
    INDEX `worker_services_worker_id_idx`(`worker_id`),
    UNIQUE INDEX `worker_services_worker_id_service_name_key`(`worker_id`, `service_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `jobs_staffing_status_idx` ON `jobs`(`staffing_status`);

-- CreateIndex
CREATE INDEX `jobs_preferred_date_idx` ON `jobs`(`preferred_date`);

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_direct_hire_request_id_fkey` FOREIGN KEY (`direct_hire_request_id`) REFERENCES `direct_hire_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_direct_hire_request_id_fkey` FOREIGN KEY (`direct_hire_request_id`) REFERENCES `direct_hire_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_members` ADD CONSTRAINT `conversation_members_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_members` ADD CONSTRAINT `conversation_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `direct_hire_requests` ADD CONSTRAINT `direct_hire_requests_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `direct_hire_requests` ADD CONSTRAINT `direct_hire_requests_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `direct_hire_requests` ADD CONSTRAINT `direct_hire_requests_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffing_requests` ADD CONSTRAINT `staffing_requests_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffing_requests` ADD CONSTRAINT `staffing_requests_requested_by_worker_id_fkey` FOREIGN KEY (`requested_by_worker_id`) REFERENCES `workers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_inviter_worker_id_fkey` FOREIGN KEY (`inviter_worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_invited_worker_id_fkey` FOREIGN KEY (`invited_worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_availabilities` ADD CONSTRAINT `worker_availabilities_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_availability_exceptions` ADD CONSTRAINT `worker_availability_exceptions_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_connections` ADD CONSTRAINT `worker_connections_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_connections` ADD CONSTRAINT `worker_connections_connected_worker_id_fkey` FOREIGN KEY (`connected_worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_services` ADD CONSTRAINT `worker_services_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `jobs` RENAME INDEX `jobs_created_by_fkey` TO `jobs_created_by_idx`;
