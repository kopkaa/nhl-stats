<script setup lang="ts">
import type { GetGameDetailQuery } from '~/graphql/generated';

type GameDetail = GetGameDetailQuery['gameDetail'];

const props = defineProps<{ game: GameDetail }>();

const isLive = computed(() => isLiveState(props.game.gameState));
const isFinal = computed(() => isFinalState(props.game.gameState));

const decided = computed(
  () => isFinal.value && props.game.homeTeam.score != null && props.game.awayTeam.score != null,
);

const sides = computed(() => {
  const { homeTeam, awayTeam } = props.game;
  const homeWon = decided.value && homeTeam.score! > awayTeam.score!;
  const awayWon = decided.value && awayTeam.score! > homeTeam.score!;
  return [
    { kind: 'away', team: awayTeam, won: awayWon },
    { kind: 'home', team: homeTeam, won: homeWon },
  ];
});

const statusLine = computed(() => {
  if (isLive.value) {
    if (props.game.inIntermission) return `Intermission — ${ordinalSuffix(props.game.currentPeriod ?? 0)}`;
    return `${ordinalSuffix(props.game.currentPeriod ?? 0)} — ${props.game.clockTimeRemaining ?? ''}`;
  }
  if (isFinal.value) {
    const last = props.game.periods.at(-1);
    if (last && last.periodType !== 'REG') return `Final / ${last.periodType}`;
    return 'Final';
  }
  return formatGameTime(props.game.startTimeUTC);
});
</script>

<template>
  <div class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md mb-4">
    <div class="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
      <span
        v-if="isLive"
        class="flex items-center gap-1.5 text-[0.7rem] font-semibold text-result-loss uppercase tracking-wide"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-result-loss animate-pulse" />
        {{ statusLine }}
      </span>
      <span v-else class="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-wide">
        {{ statusLine }}
      </span>
      <span class="text-[0.65rem] text-gray-600 truncate max-w-[50%]">
        {{ game.venue }}
      </span>
    </div>

    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5">
      <NuxtLink
        v-for="(side, index) in sides"
        :key="side.kind"
        :to="`/teams/${side.team.id}`"
        class="flex items-center gap-3 no-underline min-w-0"
        :class="index === 0 ? 'justify-start' : 'order-3 justify-end flex-row-reverse'"
      >
        <img
          v-if="side.team.logo"
          :src="side.team.logo"
          :alt="side.team.name"
          class="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
        />
        <div class="min-w-0" :class="index === 0 ? 'text-left' : 'text-right'">
          <div
            class="text-sm sm:text-base truncate"
            :class="side.won ? 'text-white font-semibold' : 'text-gray-300'"
          >
            {{ side.team.name }}
          </div>
          <div class="text-[0.7rem] text-gray-600 tabular-nums">
            {{ side.team.sog != null ? `${side.team.sog} SOG` : '' }}
          </div>
        </div>
      </NuxtLink>

      <div class="order-2 flex items-center gap-3 sm:gap-4 tabular-nums">
        <span
          class="text-3xl sm:text-4xl font-bold"
          :class="sides[0].won ? 'text-white' : 'text-gray-500'"
        >
          {{ game.awayTeam.score ?? '–' }}
        </span>
        <span class="text-gray-700 text-lg">:</span>
        <span
          class="text-3xl sm:text-4xl font-bold"
          :class="sides[1].won ? 'text-white' : 'text-gray-500'"
        >
          {{ game.homeTeam.score ?? '–' }}
        </span>
      </div>
    </div>
  </div>
</template>
