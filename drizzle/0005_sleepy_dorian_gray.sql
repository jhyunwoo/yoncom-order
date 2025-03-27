PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`customerToken` text,
	`tokenKey` text,
	`tokenIv` text
);
--> statement-breakpoint
INSERT INTO `__new_tables`("id", "name", "customerToken", "tokenKey", "tokenIv") SELECT "id", "name", "customerToken", "tokenKey", "tokenIv" FROM `tables`;--> statement-breakpoint
DROP TABLE `tables`;--> statement-breakpoint
ALTER TABLE `__new_tables` RENAME TO `tables`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `tables_name_unique` ON `tables` (`name`);