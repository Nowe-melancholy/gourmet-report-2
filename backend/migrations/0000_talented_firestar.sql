CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`item_name` text NOT NULL,
	`rating` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
