<script setup lang="ts">
import type { GetGamesByDateQuery } from '~/graphql/generated';

type Game = GetGamesByDateQuery['gamesByDate'][number];

const props = defineProps<{ game: Game }>();

const isLive = computed(() => isLiveState(props.game.gameState));
const isFinal = computed(() => isFinalState(props.game.gameState));
const isUpcoming = computed(() => isUpcomingState(props.game.gameState));

const decided = computed(
  () => isFinal.value && props.game.homeScore != null && props.game.awayScore != null,
);

const sides = computed(() => {
  const homeWon = decided.value && props.game.homeScore! > props.game.awayScore!;
  const awayWon = decided.value && props.game.awayScore! > props.game.homeScore!;
  return [
    {
      kind: 'away',
      teamId: props.game.awayTeamId,
      name: props.game.awayTeamName,
      logo: props.game.awayTeamLogo,
      score: props.game.awayScore,
      won: awayWon,
    },
    {
      kind: 'home',
      teamId: props.game.homeTeamId,
      name: props.game.homeTeamName,
      logo: props.game.homeTeamLogo,
      score: props.game.homeScore,
      won: homeWon,
    },
  ];
});
</script>

<template>
  <div class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md overflow-hidden">
    <div class="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05]">
      <span
        v-if="isLive"
        class="flex items-center gap-1.5 text-[0.7rem] font-semibold text-result-loss uppercase tracking-wide"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-result-loss animate-pulse" />
        Live
      </span>
      <span v-else-if="isFinal" class="text-[0.7rem] font-semibold text-gray-500 uppercase tracking-wide">
        Final
      </span>
      <span v-else class="text-[0.7rem] font-medium text-gray-400 tabular-nums">
        {{ formatGameTime(game.startTimeUTC) }}
      </span>
      <span v-if="game.venue" class="text-[0.65rem] text-gray-600 truncate max-w-[55%]">
        {{ game.venue }}
      </span>
    </div>

    <NuxtLink :to="`/games/${game.id}`" class="flex flex-col no-underline">
      <div
        v-for="side in sides"
        :key="side.kind"
        class="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-white/[0.03]"
      >
        <img
          v-if="side.logo"
          :src="side.logo"
          :alt="side.name ?? ''"
          class="w-6 h-6 object-contain shrink-0"
        />
        <div v-else class="w-6 h-6 shrink-0" />
        <span
          class="flex-1 text-sm truncate"
          :class="side.won ? 'text-white font-semibold' : 'text-gray-300'"
        >
          {{ side.name }}
        </span>
        <span
          v-if="!isUpcoming && side.score != null"
          class="text-sm tabular-nums w-6 text-right"
          :class="side.won ? 'text-white font-bold' : 'text-gray-500'"
        >
          {{ side.score }}
        </span>
      </div>
    </NuxtLink>
  </div>
</template>
