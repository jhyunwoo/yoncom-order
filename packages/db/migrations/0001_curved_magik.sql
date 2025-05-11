ALTER TABLE `tableContext` RENAME TO `tableContexts`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tableContexts` (
	`id` text PRIMARY KEY NOT NULL,
	`tableId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer,
	FOREIGN KEY (`tableId`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tableContexts`("id", "tableId", "createdAt", "updatedAt", "deletedAt") SELECT "id", "tableId", "createdAt", "updatedAt", "deletedAt" FROM `tableContexts`;--> statement-breakpoint
DROP TABLE `tableContexts`;--> statement-breakpoint
ALTER TABLE `__new_tableContexts` RENAME TO `tableContexts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`tableContextId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer,
	FOREIGN KEY (`tableContextId`) REFERENCES `tableContexts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "tableContextId", "createdAt", "updatedAt", "deletedAt") SELECT "id", "tableContextId", "createdAt", "updatedAt", "deletedAt" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;