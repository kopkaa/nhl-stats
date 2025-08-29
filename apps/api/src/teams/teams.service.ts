import { Injectable } from '@nestjs/common';
import { Team } from './team.model';

@Injectable()
export class TeamsService {
  private teams: Team[] = [
    { id: '1', name: 'New York Rangers' },
    { id: '2', name: 'Boston Bruins' },
  ];

  findAll(): Team[] {
    return this.teams;
  }

  findOne(id: string): Team | undefined {
    return this.teams.find((t) => t.id === id);
  }
}
