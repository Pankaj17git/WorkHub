/*
  Warnings:

  - You are about to drop the column `worker_id` on the `skills` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `skills` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `skills` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `skills` DROP FOREIGN KEY `skills_worker_id_fkey`;

-- DropIndex
DROP INDEX `skills_worker_id_name_key` ON `skills`;

-- AlterTable
ALTER TABLE `skills` DROP COLUMN `worker_id`,
    ADD COLUMN `created_by` BIGINT NULL,
    ADD COLUMN `is_custom` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `key` VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE `worker_skills` (
    `worker_id` BIGINT NOT NULL,
    `skill_id` BIGINT NOT NULL,

    INDEX `worker_skills_skill_id_idx`(`skill_id`),
    PRIMARY KEY (`worker_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `skills_key_key` ON `skills`(`key`);

-- AddForeignKey
ALTER TABLE `worker_skills` ADD CONSTRAINT `worker_skills_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_skills` ADD CONSTRAINT `worker_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
