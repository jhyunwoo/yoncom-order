PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`tableId` text NOT NULL,
	`menuId` integer NOT NULL,
	`customerToken` text NOT NULL,
	`quantity` integer NOT NULL,
	`isCompleted` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`tableId`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`menuId`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "tableId", "menuId", "customerToken", "quantity", "isCompleted", "createdAt", "updatedAt") SELECT "id", "tableId", "menuId", "customerToken", "quantity", "isCompleted", "createdAt", "updatedAt" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;