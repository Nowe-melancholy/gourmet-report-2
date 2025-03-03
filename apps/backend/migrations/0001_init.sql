CREATE TABLE `reports` (
  `id` text PRIMARY KEY NOT NULL,
  `item_name` text NOT NULL,
  `shop_name` text NOT NULL,
  `location` text NOT NULL,
  `rating` real NOT NULL,
  `image_url` text,
  `comment` text,
  `date` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
); 