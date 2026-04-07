-- AlterTable
ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(20) NULL;

-- CreateEnum (MySQL no soporta ENUM directamente con ALTER, se crea con CHECK constraint)
-- Pero Prisma lo maneja internamente como VARCHAR, así que creamos la tabla directamente

-- CreateTable
CREATE TABLE `CustomOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    INDEX `CustomOrder_userId_idx`(`userId`),
    INDEX `CustomOrder_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CustomOrder` ADD CONSTRAINT `CustomOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
