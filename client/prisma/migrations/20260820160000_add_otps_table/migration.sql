-- CreateTable
CREATE TABLE `otps` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `otp_hash` VARCHAR(255) NOT NULL,
    `expires_at` TIMESTAMP(6) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `used_at` TIMESTAMP(6) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `otps_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `otps` ADD CONSTRAINT `otps_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
