import { Injectable } from '@nestjs/common';
import { desc, eq, lte } from 'drizzle-orm';
import { DatabaseService, seasons } from '../database';
import { Season, SeasonPhase } from './season.model';

type SeasonRow = typeof seasons.$inferSelect;

@Injectable()
export class SeasonsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Season[]> {
    const rows = await this.databaseService.db.select().from(seasons);
    return this.toSeasons(rows).sort((seasonA, seasonB) =>
      seasonB.id.localeCompare(seasonA.id),
    );
  }

  async findCurrent(): Promise<Season | undefined> {
    const rows = await this.databaseService.db.select().from(seasons);
    return this.toSeasons(rows).find((season) => season.isCurrent);
  }

  async findOne(id: string): Promise<Season | undefined> {
    const today = new Date().toISOString().slice(0, 10);
    const [row] = await this.databaseService.db
      .select()
      .from(seasons)
      .where(eq(seasons.id, id));
    if (!row) return undefined;
    const currentId = await this.resolveCurrentIdQuery(today);
    return this.toSeason(row, currentId, today);
  }

  private toSeasons(rows: SeasonRow[]): Season[] {
    const today = new Date().toISOString().slice(0, 10);
    const currentId = this.resolveCurrentId(rows, today);
    return rows.map((row) => this.toSeason(row, currentId, today));
  }

  private toSeason(row: SeasonRow, currentId: string | null, today: string): Season {
    return {
      id: row.id,
      nhlSeasonId: row.nhlSeasonId,
      startDate: row.startDate,
      regularEndDate: row.regularEndDate ?? undefined,
      endDate: row.endDate ?? undefined,
      phase: this.computePhase(row, today),
      numTeams: row.numTeams ?? undefined,
      championTeamId: row.championTeamId ?? undefined,
      isCurrent: row.id === currentId,
    };
  }

  private async resolveCurrentIdQuery(today: string): Promise<string | null> {
    const [latest] = await this.databaseService.db
      .select({ id: seasons.id })
      .from(seasons)
      .where(lte(seasons.startDate, today))
      .orderBy(desc(seasons.startDate))
      .limit(1);
    if (latest) return latest.id;
    const [next] = await this.databaseService.db
      .select({ id: seasons.id })
      .from(seasons)
      .orderBy(seasons.startDate)
      .limit(1);
    return next?.id ?? null;
  }

  private resolveCurrentId(rows: SeasonRow[], today: string): string | null {
    if (rows.length === 0) return null;
    const started = rows.filter((row) => row.startDate <= today);
    const pool = started.length > 0 ? started : rows;
    return pool.reduce((latest, row) =>
      row.startDate > latest.startDate ? row : latest,
    ).id;
  }

  private computePhase(row: SeasonRow, today: string): SeasonPhase {
    if (today < row.startDate) return SeasonPhase.PRE;
    if (!row.regularEndDate || today <= row.regularEndDate) {
      return SeasonPhase.REGULAR;
    }
    if (!row.endDate || today <= row.endDate) return SeasonPhase.PLAYOFFS;
    return SeasonPhase.OFFSEASON;
  }
}
