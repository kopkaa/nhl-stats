import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NhlApiClient } from './nhl-api.client';

@Global()
@Module({
  imports: [HttpModule],
  providers: [NhlApiClient],
  exports: [NhlApiClient, HttpModule],
})
export class CommonModule {}
