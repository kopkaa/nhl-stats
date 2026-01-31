import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db: PostgresJsDatabase;
  private readonly client: postgres.Sql;

  constructor(private readonly configService: ConfigService) {
    const connectionString =
      this.configService.getOrThrow<string>('DATABASE_URL');

    this.client = postgres(connectionString);
    this.db = drizzle({ client: this.client });
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
