<script setup lang="ts">
import type { GetTeamGamesQuery } from '~/graphql/generated';
import { GameState } from '~/graphql/generated';

type Game = GetTeamGamesQuery['teamGames'][number];

const props = defineProps<{
  games: Game[];
  teamId: number;
}>();

const recentGames = computed(() =>
  props.games
    .filter((game) => game.gameState === GameState.Final || game.gameState === GameState.Off)
    .slice(0, 10),
);

const upcomingGames = computed(() =>
  props.games
    .filter((game) => game.gameState === GameState.Fut || game.gameState === GameState.Pre)
    .slice(0, 10),
);

function gameResult(game: Game): { text: string; class: string } {
  const isHome = game.homeTeamId === props.teamId;
  const teamScore = isHome ? game.homeScore : game.awayScore;
  const oppScore = isHome ? game.awayScore : game.homeScore;
  if (teamScore == null || oppScore == null) return { text: '—', class: 'text-gray-500' };
  if (teamScore > oppScore) return { text: 'W', class: 'text-green-400 font-semibold' };
  return { text: 'L', class: 'text-red-400 font-semibold' };
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
  <div>
    <!-- Recent Results -->
    <div v-if="recentGames.length" class="mb-8">
      <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Results</h3>
      <div class="flex flex-col gap-1.5">
        <div
          v-for="game in recentGames"
          :key="game.id"
          class="flex items-center gap-2 px-3 py-2 bg-[rgb(17_17_27)] border border-white/5 rounded-md transition-colors hover:bg-white/[0.03]"
        >
          <span class="text-xs text-gray-600 w-16 shrink-0 tabular-nums">{{ formatGameDate(game.gameDate) }}</span>
          <span :class="gameResult(game).class" class="w-5 text-center text-xs">{{ gameResult(game).text }}</span>
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="text-gray-600 text-xs w-4 text-right">{{ opponentInfo(game).prefix }}</span>
            <img
              v-if="opponentInfo(game).logo"
              :src="opponentInfo(game).logo!"
              :alt="opponentInfo(game).name ?? ''"
              class="w-5 h-5 object-contain shrink-0"
            />
            <span class="text-gray-300 text-sm truncate">{{ opponentInfo(game).name }}</span>
          </div>
          <span class="text-sm tabular-nums font-medium text-gray-300">
            {{ opponentInfo(game).teamScore }}–{{ opponentInfo(game).oppScore }}
          </span>
        </div>
      </div>
    </div>

    <!-- Upcoming -->
    <div v-if="upcomingGames.length">
      <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming</h3>
      <div class="flex flex-col gap-1.5">
        <div
          v-for="game in upcomingGames"
          :key="game.id"
          class="flex items-center gap-2 px-3 py-2 bg-[rgb(17_17_27)] border border-white/5 rounded-md transition-colors hover:bg-white/[0.03]"
        >
          <span class="text-xs text-gray-600 w-16 shrink-0 tabular-nums">{{ formatGameDate(game.gameDate) }}</span>
          <div class="flex items-center gap-2 flex-1 min-w-0 ml-5">
            <span class="text-gray-600 text-xs w-4 text-right">{{ opponentInfo(game).prefix }}</span>
            <img
              v-if="opponentInfo(game).logo"
              :src="opponentInfo(game).logo!"
              :alt="opponentInfo(game).name ?? ''"
              class="w-5 h-5 object-contain shrink-0"
            />
            <span class="text-gray-300 text-sm truncate">{{ opponentInfo(game).name }}</span>
          </div>
          <span v-if="game.venue" class="text-xs text-gray-600 hidden sm:block">{{ game.venue }}</span>
        </div>
      </div>
    </div>

    <div v-if="!recentGames.length && !upcomingGames.length" class="py-16 text-center text-gray-500 text-sm">
      No games available
    </div>
  </div>
</template>
