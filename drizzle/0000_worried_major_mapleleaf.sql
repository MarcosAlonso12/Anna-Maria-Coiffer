CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`kind` text NOT NULL,
	`amount` integer NOT NULL,
	`void` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "positive_amount" CHECK("expenses"."amount">0)
);
--> statement-breakpoint
CREATE INDEX `expenses_date` ON `expenses` (`date`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	`cost` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "quantity_positive" CHECK("items"."quantity">0)
);
--> statement-breakpoint
CREATE INDEX `items_order` ON `items` (`order_id`);--> statement-breakpoint
CREATE TABLE `movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`date` text NOT NULL,
	`delta` integer NOT NULL,
	`reason` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer,
	`guest_id` text,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`delivery` text NOT NULL,
	`created` text NOT NULL,
	`paid_at` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment` text NOT NULL,
	`total` integer NOT NULL,
	`cost` integer NOT NULL,
	`request_id` text NOT NULL,
	`invoice_key` text,
	`invoice_file` text,
	`invoice_cancelled` integer DEFAULT 0 NOT NULL,
	`cancel_file` text,
	`cancelled_at` text,
	`ip_hash` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_id_unique` ON `orders` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_invoice_key_unique` ON `orders` (`invoice_key`);--> statement-breakpoint
CREATE INDEX `orders_customer` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_guest` ON `orders` (`guest_id`);--> statement-breakpoint
CREATE INDEX `orders_paid` ON `orders` (`paid_at`);--> statement-breakpoint
CREATE INDEX `orders_created` ON `orders` (`created`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price` integer NOT NULL,
	`cost` integer NOT NULL,
	`stock` integer NOT NULL,
	`minimum` integer DEFAULT 3 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`photo` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	CONSTRAINT "nonnegative_stock" CHECK("products"."stock">=0),
	CONSTRAINT "positive_price" CHECK("products"."price">0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`csrf` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`pickup` text DEFAULT '' NOT NULL,
	`open` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`auth_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'customer' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth_id_unique` ON `users` (`auth_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);