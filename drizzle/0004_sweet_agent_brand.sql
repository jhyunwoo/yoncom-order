ALTER TABLE `orders` ADD `customerId` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `userToken`;