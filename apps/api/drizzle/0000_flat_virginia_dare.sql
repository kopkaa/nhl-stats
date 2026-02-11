CREATE TABLE "teams" (
	"id" integer PRIMARY KEY NOT NULL,
	"franchise_id" integer,
	"full_name" varchar(255) NOT NULL,
	"tri_code" varchar(10) NOT NULL,
	"logo" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
