<script setup lang="ts">
import type { GetGameDetailQuery } from '~/graphql/generated';

type GameDetail = GetGameDetailQuery['gameDetail'];

const props = defineProps<{ game: GameDetail }>();

const CATEGORY_LABELS: Record<string, string> = {
  sog: 'Shots on Goal',
  faceoffWinningPctg: 'Faceoff %',
  faceoffWins: 'Faceoffs Won',
  powerPlay: 'Power Play',
  powerPlayPctg: 'Power Play %',
  pim: 'Penalty Minutes',
  hits: 'Hits',
  blockedShots: 'Blocked Shots',
  giveaways: 'Giveaways',
  takeaways: 'Takeaways',
};

function displayValue(category: string, value: string): string {
  if (category.endsWith('Pctg')) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? `${(parsed * 100).toFixed(1)}%` : value;
  }
  return value;
}

function weight(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const rows = computed(() =>
  props.game.teamStats.map((stat) => {
    const awayWeight = weight(stat.awayValue);
    const homeWeight = weight(stat.homeValue);
    const total = awayWeight + homeWeight;

    return {
      category: stat.category,
      label: CATEGORY_LABELS[stat.category] ?? stat.category,
      awayText: displayValue(stat.category, stat.awayValue),
      homeText: displayValue(stat.category, stat.homeValue),
      awayPct: total > 0 ? (awayWeight / total) * 100 : 50,
      homePct: total > 0 ? (homeWeight / total) * 100 : 50,
      awayLeads: awayWeight > homeWeight,
      homeLeads: homeWeight > awayWeight,
    };
  }),
);
</script>

<template>
  <div v-if="!rows.length" class="py-16 text-center text-gray-500 text-sm">
    No team stats available
  </div>

  <div v-else class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md px-4 py-3">
    <div class="flex items-center justify-between pb-3 mb-1 border-b border-white/[0.06]">
      <span class="text-[0.75rem] font-semibold text-gray-300">{{ game.awayTeam.abbrev }}</span>
      <span class="text-[0.75rem] font-semibold text-gray-300">{{ game.homeTeam.abbrev }}</span>
    </div>

    <div v-for="row in rows" :key="row.category" class="py-2">
      <div class="flex items-center justify-between text-[0.8rem] tabular-nums mb-1">
        <span :class="row.awayLeads ? 'text-white font-semibold' : 'text-gray-400'">
          {{ row.awayText }}
        </span>
        <span class="text-[0.7rem] text-gray-500 uppercase tracking-wide">{{ row.label }}</span>
        <span :class="row.homeLeads ? 'text-white font-semibold' : 'text-gray-400'">
          {{ row.homeText }}
        </span>
      </div>
      <div class="flex gap-px h-1">
        <div class="flex-1 flex justify-end bg-white/[0.03]">
          <div
            class="h-full transition-all"
            :class="row.awayLeads ? 'bg-gray-300' : 'bg-gray-700'"
            :style="{ width: `${row.awayPct}%` }"
          />
        </div>
        <div class="flex-1 bg-white/[0.03]">
          <div
            class="h-full transition-all"
            :class="row.homeLeads ? 'bg-gray-300' : 'bg-gray-700'"
            :style="{ width: `${row.homePct}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
