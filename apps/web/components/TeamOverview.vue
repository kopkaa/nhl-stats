<script setup lang="ts">
import type { GetTeamSkaterStatsQuery, GetTeamGoalieStatsQuery, GetTeamGamesQuery } from '~/graphql/generated';
import { GameState, PositionCode } from '~/graphql/generated';

type Skater = GetTeamSkaterStatsQuery['teamSkaterStats'][number];
type Goalie = GetTeamGoalieStatsQuery['teamGoalieStats'][number];
type Game = GetTeamGamesQuery['teamGames'][number];

const props = defineProps<{
  skaters: Skater[];
  goalies: Goalie[];
  games: Game[];
  teamId: number;
}>();

const topForwards = computed(() =>
  props.skaters
    .filter((skater) => [PositionCode.C, PositionCode.L, PositionCode.R].includes(skater.positionCode))
    .sort((skaterA, skaterB) => skaterB.points - skaterA.points)
    .slice(0, 5),
);

const topDefensemen = computed(() =>
  props.skaters
    .filter((skater) => skater.positionCode === PositionCode.D)
    .sort((skaterA, skaterB) => skaterB.points - skaterA.points)
    .slice(0, 3),
);

const topGoalie = computed(() =>
  [...props.goalies]
    .sort((goalieA, goalieB) => goalieB.wins - goalieA.wins)
    .at(0),
);

const recentGames = computed(() =>
  props.games
    .filter((game) => game.gameState === GameState.Final || game.gameState === GameState.Off)
    .slice(0, 5),
);

const upcomingGames = computed(() =>
  props.games
    .filter((game) => game.gameState === GameState.Fut || game.gameState === GameState.Pre)
    .slice(0, 3),
);

function gameResult(game: Game): { text: string; class: string } {
  const isHome = game.homeTeamId === props.teamId;
  const teamScore = isHome ? game.homeScore : game.awayScore;
  const oppScore = isHome ? game.awayScore : game.homeScore;
  if (teamScore == null || oppScore == null) return { text: '—', class: 'text-gray-500' };
  if (teamScore > oppScore) return { text: 'W', class: 'text-result-win' };
  return { text: 'L', class: 'text-result-loss' };
}

function opponentInfo(game: Game) {
  const isHome = game.homeTeamId === props.teamId;
  return {
    name: isHome ? game.awayTeamName : game.homeTeamName,
    logo: isHome ? game.awayTeamLogo : game.homeTeamLogo,
    prefix: isHome ? 'vs' : '@',
    teamScore: isHome ? game.homeScore : game.awayScore,
    oppScore: isHome ? game.awayScore : game.homeScore,
  };
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left column: Top Players -->
    <div class="lg:col-span-2 flex flex-col gap-5">
      <!-- Top Forwards -->
      <div v-if="topForwards.length">
        <h3 class="section-label mb-3">Top Forwards</h3>
        <div class="flex flex-col gap-1">
          <div
            v-for="(forward, index) in topForwards"
            :key="forward.playerId"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.03]"
            :class="index === 0 ? 'bg-white/[0.04]' : ''"
          >
            <span class="text-[0.7rem] text-gray-500 w-4 tabular-nums text-right">{{ index + 1 }}</span>
            <img
              v-if="forward.headshot"
              :src="forward.headshot"
              :alt="`${forward.firstName} ${forward.lastName}`"
              class="w-8 h-8 rounded-full object-cover bg-gray-800 border border-white/[0.08]"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-800 border border-white/[0.06]" />
            <div class="flex-1 min-w-0">
              <span class="text-white text-sm font-medium">{{ forward.firstName }} {{ forward.lastName }}</span>
              <span class="text-gray-500 text-xs ml-1.5">{{ forward.positionCode }}</span>
            </div>
            <div class="stat-group">
              <div class="stat-block">
                <span class="stat-value--primary">{{ forward.points }}</span>
                <span class="stat-label">PTS</span>
              </div>
              <div class="stat-block">
                <span class="stat-value">{{ forward.goals }}</span>
                <span class="stat-label">G</span>
              </div>
              <div class="stat-block">
                <span class="stat-value">{{ forward.assists }}</span>
                <span class="stat-label">A</span>
              </div>
              <div class="stat-block">
                <span class="stat-value--muted">{{ forward.gamesPlayed }}</span>
                <span class="stat-label">GP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Defensemen -->
      <div v-if="topDefensemen.length">
        <h3 class="section-label mb-3">Top Defensemen</h3>
        <div class="flex flex-col gap-1">
          <div
            v-for="(defenseman, index) in topDefensemen"
            :key="defenseman.playerId"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.03]"
            :class="index === 0 ? 'bg-white/[0.04]' : ''"
          >
            <span class="text-[0.7rem] text-gray-500 w-4 tabular-nums text-right">{{ index + 1 }}</span>
            <img
              v-if="defenseman.headshot"
              :src="defenseman.headshot"
              :alt="`${defenseman.firstName} ${defenseman.lastName}`"
              class="w-8 h-8 rounded-full object-cover bg-gray-800 border border-white/[0.08]"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-800 border border-white/[0.06]" />
            <div class="flex-1 min-w-0">
              <span class="text-white text-sm font-medium">{{ defenseman.firstName }} {{ defenseman.lastName }}</span>
              <span class="text-gray-500 text-xs ml-1.5">D</span>
            </div>
            <div class="stat-group">
              <div class="stat-block">
                <span class="stat-value--primary">{{ defenseman.points }}</span>
                <span class="stat-label">PTS</span>
              </div>
              <div class="stat-block">
                <span class="stat-value">{{ defenseman.goals }}</span>
                <span class="stat-label">G</span>
              </div>
              <div class="stat-block">
                <span class="stat-value">{{ defenseman.assists }}</span>
                <span class="stat-label">A</span>
              </div>
              <div class="stat-block">
                <span class="stat-value--muted">{{ defenseman.gamesPlayed }}</span>
                <span class="stat-label">GP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Goalie -->
      <div v-if="topGoalie">
        <h3 class="section-label mb-3">Starting Goalie</h3>
        <div class="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/[0.04]">
          <img
            v-if="topGoalie.headshot"
            :src="topGoalie.headshot"
            :alt="`${topGoalie.firstName} ${topGoalie.lastName}`"
            class="w-10 h-10 rounded-full object-cover bg-gray-800 border border-white/[0.08]"
          />
          <div v-else class="w-10 h-10 rounded-full bg-gray-800 border border-white/[0.06]" />
          <div class="flex-1 min-w-0">
            <div class="text-white text-sm font-medium">{{ topGoalie.firstName }} {{ topGoalie.lastName }}</div>
          </div>
          <div class="stat-group gap-5">
            <div class="stat-block">
              <span class="stat-value--primary">{{ topGoalie.savePctg ? `.${(topGoalie.savePctg * 1000).toFixed(0)}` : '—' }}</span>
              <span class="stat-label">SV%</span>
            </div>
            <div class="stat-block">
              <span class="stat-value">{{ topGoalie.goalsAgainstAvg?.toFixed(2) ?? '—' }}</span>
              <span class="stat-label">GAA</span>
            </div>
            <div class="stat-block">
              <span class="stat-value">{{ topGoalie.wins }}-{{ topGoalie.losses }}-{{ topGoalie.otLosses }}</span>
              <span class="stat-label">W-L-OTL</span>
            </div>
            <div class="stat-block">
              <span class="stat-value--muted">{{ topGoalie.shutouts }}</span>
              <span class="stat-label">SO</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right column: Games -->
    <div class="flex flex-col gap-5">
      <!-- Recent Results -->
      <div v-if="recentGames.length">
        <h3 class="section-label mb-3">Last {{ recentGames.length }}</h3>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="game in recentGames"
            :key="game.id"
            class="flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
          >
            <span class="text-[0.65rem] text-gray-600 w-12 shrink-0 tabular-nums">{{ formatGameDate(game.gameDate) }}</span>
            <span :class="gameResult(game).class" class="text-xs font-semibold w-4">{{ gameResult(game).text }}</span>
            <img
              v-if="opponentInfo(game).logo"
              :src="opponentInfo(game).logo!"
              :alt="opponentInfo(game).name ?? ''"
              class="w-4 h-4 object-contain shrink-0"
            />
            <span class="text-gray-400 text-xs truncate flex-1">{{ opponentInfo(game).name }}</span>
            <span class="text-xs tabular-nums text-gray-300 font-medium">
              {{ opponentInfo(game).teamScore }}–{{ opponentInfo(game).oppScore }}
            </span>
          </div>
        </div>
      </div>

      <!-- Upcoming -->
      <div v-if="upcomingGames.length">
        <h3 class="section-label mb-3">Next {{ upcomingGames.length }}</h3>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="game in upcomingGames"
            :key="game.id"
            class="flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
          >
            <span class="text-[0.65rem] text-gray-600 w-12 shrink-0 tabular-nums">{{ formatGameDate(game.gameDate) }}</span>
            <span class="text-gray-600 text-xs w-4">{{ opponentInfo(game).prefix }}</span>
            <img
              v-if="opponentInfo(game).logo"
              :src="opponentInfo(game).logo!"
              :alt="opponentInfo(game).name ?? ''"
              class="w-4 h-4 object-contain shrink-0"
            />
            <span class="text-gray-400 text-xs truncate flex-1">{{ opponentInfo(game).name }}</span>
          </div>
        </div>
      </div>

      <div v-if="!recentGames.length && !upcomingGames.length" class="py-8 text-center text-gray-600 text-xs">
        No games available
      </div>
    </div>
  </div>
</template>
