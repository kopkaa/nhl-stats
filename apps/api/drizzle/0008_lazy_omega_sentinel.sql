CREATE TABLE "rosters" (
	"player_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"season" varchar(7) NOT NULL,
	"sweater_number" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rosters_player_id_team_id_season_pk" PRIMARY KEY("player_id","team_id","season")
);
--> statement-breakpoint
ALTER TABLE "players" DROP CONSTRAINT "players_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_season_seasons_id_fk" FOREIGN KEY ("season") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "team_id";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "sweater_number";