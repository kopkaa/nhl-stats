CREATE TYPE "public"."game_state" AS ENUM('FUT', 'PRE', 'LIVE', 'FINAL', 'OFF', 'CRIT');--> statement-breakpoint
CREATE TYPE "public"."position_code" AS ENUM('C', 'L', 'R', 'D', 'G');--> statement-breakpoint
CREATE TABLE "games" (
	"id" integer PRIMARY KEY NOT NULL,
	"season" varchar(7) NOT NULL,
	"game_type" integer NOT NULL,
	"game_date" varchar(10) NOT NULL,
	"start_time_utc" varchar(30),
	"game_state" "game_state" NOT NULL,
	"venue" varchar(255),
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goalie_season_stats" (
	"player_id" integer NOT NULL,
	"season" varchar(7) NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"games_started" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"ot_losses" integer DEFAULT 0 NOT NULL,
	"goals_against_avg" real DEFAULT 0,
	"save_pctg" real DEFAULT 0,
	"shutouts" integer DEFAULT 0 NOT NULL,
	"shots_against" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"goals_against" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goalie_season_stats_player_id_season_pk" PRIMARY KEY("player_id","season")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" integer PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"position_code" "position_code" NOT NULL,
	"sweater_number" integer,
	"headshot" varchar(512),
	"shoots_catches" varchar(2),
	"height_cm" integer,
	"weight_kg" integer,
	"birth_date" varchar(10),
	"birth_country" varchar(5),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skater_season_stats" (
	"player_id" integer NOT NULL,
	"season" varchar(7) NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"plus_minus" integer DEFAULT 0 NOT NULL,
	"penalty_minutes" integer DEFAULT 0 NOT NULL,
	"power_play_goals" integer DEFAULT 0 NOT NULL,
	"shorthanded_goals" integer DEFAULT 0 NOT NULL,
	"game_winning_goals" integer DEFAULT 0 NOT NULL,
	"shots" integer DEFAULT 0 NOT NULL,
	"shooting_pctg" real DEFAULT 0,
	"avg_time_on_ice" real DEFAULT 0,
	"faceoff_win_pctg" real DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skater_season_stats_player_id_season_pk" PRIMARY KEY("player_id","season")
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalie_season_stats" ADD CONSTRAINT "goalie_season_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skater_season_stats" ADD CONSTRAINT "skater_season_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;