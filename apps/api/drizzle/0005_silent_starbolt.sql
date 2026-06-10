CREATE TABLE "seasons" (
	"id" varchar(7) PRIMARY KEY NOT NULL,
	"nhl_season_id" integer NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"regular_end_date" varchar(10),
	"end_date" varchar(10),
	"num_teams" integer,
	"champion_team_id" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_champion_team_id_teams_id_fk" FOREIGN KEY ("champion_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;