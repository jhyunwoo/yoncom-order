PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_menus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`image` text,
	`canOrder` integer DEFAULT true,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_menus`("id", "name", "description", "price", "quantity", "image", "canOrder", "createdAt") SELECT "id", "name", "description", "price", "quantity", "image", "canOrder", "createdAt" FROM `menus`;--> statement-breakpoint
DROP TABLE `menus`;--> statement-breakpoint
ALTER TABLE `__new_menus` RENAME TO `menus`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tables` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`customerToken` text,
	`tokenKey` text,
	`tokenIv` text
);
--> statement-breakpoint
INSERT INTO `__new_tables`("id", "name", "customerToken", "tokenKey", "tokenIv") SELECT "id", "name", "customerToken", "tokenKey", "tokenIv" FROM `tables`;--> statement-breakpoint
DROP TABLE `tables`;--> statement-breakpoint
ALTER TABLE `__new_tables` RENAME TO `tables`;--> statement-breakpoint
CREATE UNIQUE INDEX `tables_name_unique` ON `tables` (`name`);