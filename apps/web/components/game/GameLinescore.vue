<script setup lang="ts">
import type { GetGameDetailQuery } from '~/graphql/generated';

type GameDetail = GetGameDetailQuery['gameDetail'];

const props = defineProps<{ game: GameDetail }>();

const rows = computed(() => {
  const { homeTeam, awayTeam, periods } = props.game;
  return [
    {
      kind: 'away',
      abbrev: awayTeam.abbrev,
      logo: awayTeam.logo,
      goals: periods.map((period) => period.awayGoals),
      shots: periods.map((period) => period.awayShots),
      total: awayTeam.score,
      totalShots: awayTeam.sog,
    },
    {
      kind: 'home',
      abbrev: homeTeam.abbrev,
      logo: homeTeam.logo,
      goals: periods.map((period) => period.homeGoals),
      shots: periods.map((period) => period.homeShots),
      total: homeTeam.score,
      totalShots: homeTeam.sog,
    },
  ];
});

const periodLabels = computed(() =>
  props.game.periods.map((period) =>
    period.periodType === 'REG' ? String(period.periodNumber) : period.periodType,
  ),
);
</script>

<template>
  <div v-if="game.periods.length" class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md overflow-x-auto mb-4">
    <table class="w-full text-sm border-collapse min-w-[22rem]">
      <thead>
        <tr class="border-b border-white/[0.06]">
          <th class="text-left font-medium text-gray-500 text-[0.7rem] uppercase tracking-wide px-3 py-2" />
          <th
            v-for="label in periodLabels"
            :key="label"
            class="w-10 font-medium text-gray-500 text-[0.7rem] uppercase tracking-wide px-2 py-2 text-center"
          >
            {{ label }}
          </th>
          <th class="w-12 font-semibold text-gray-300 text-[0.7rem] uppercase tracking-wide px-3 py-2 text-center">
            T
          </th>
          <th class="w-12 font-medium text-gray-600 text-[0.7rem] uppercase tracking-wide px-3 py-2 text-center">
            SOG
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.kind"
          class="border-b border-white/[0.04] last:border-b-0"
        >
          <td class="px-3 py-2">
            <div class="flex items-center gap-2">
              <img v-if="row.logo" :src="row.logo" :alt="row.abbrev" class="w-5 h-5 object-contain" />
              <span class="text-gray-300 font-medium text-[0.8rem]">{{ row.abbrev }}</span>
            </div>
          </td>
          <td
            v-for="(goals, index) in row.goals"
            :key="index"
            class="px-2 py-2 text-center tabular-nums text-gray-300"
          >
            {{ goals }}
            <span v-if="row.shots[index] != null" class="block text-[0.6rem] text-gray-600 leading-tight">
              {{ row.shots[index] }}
            </span>
          </td>
          <td class="px-3 py-2 text-center tabular-nums text-white font-bold">
            {{ row.total ?? '–' }}
          </td>
          <td class="px-3 py-2 text-center tabular-nums text-gray-500">
            {{ row.totalShots ?? '–' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
