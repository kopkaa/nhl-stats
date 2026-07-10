<script setup lang="ts">
import type { SelectPassThroughOptions } from 'primevue/select';
import { useGetPlayerGameLogQuery } from '~/graphql/generated';

const props = defineProps<{
  playerId: number;
  isGoalie: boolean;
}>();

const rangeOptions = [
  { label: 'Last 5 games', value: 5 },
  { label: 'Last 10 games', value: 10 },
  { label: 'Last 15 games', value: 15 },
];
const maxRange = Math.max(...rangeOptions.map((option) => option.value));
const range = ref(10);

const { result } = useGetPlayerGameLogQuery(() => ({ playerId: props.playerId, limit: maxRange }));

const allGames = computed(() => result.value?.playerGameLog ?? []);
const gameLog = computed(() => allGames.value.slice(0, range.value));

const selectPt: SelectPassThroughOptions = {
  root: 'inline-flex items-center bg-[rgb(17_17_27)] border border-white/[0.1] rounded-md hover:border-white/20 transition-colors',
  label: 'text-xs font-medium text-gray-300 tabular-nums tracking-tight pl-3 pr-2 py-1.5',
  dropdown: 'text-gray-500 pr-2',
  overlay: 'bg-[rgb(17_17_27)] border border-white/[0.1] rounded-md mt-1 overflow-hidden shadow-xl shadow-black/40',
  list: 'p-1',
  option: ({ context }) => ({
    class: [
      'text-xs px-3 py-1.5 rounded cursor-pointer tabular-nums tracking-tight transition-colors',
      context.selected ? 'text-white bg-white/10' : 'text-gray-400',
      !context.selected && context.focused ? 'bg-white/[0.06]' : '',
    ],
  }),
};
</script>

<template>
  <div v-if="allGames.length">
    <div class="flex justify-end mb-4">
      <Select
        v-model="range"
        :options="rangeOptions"
        option-label="label"
        option-value="value"
        :pt="selectPt"
      />
    </div>

    <div class="mb-6">
      <PlayerGameChart :entries="gameLog" :is-goalie="isGoalie" />
    </div>

    <div class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
      <DataTable :value="gameLog" size="small" class="nhl-dt">
        <Column field="gameDate" header="Date">
          <template #body="{ data: entry }">
            <span class="text-gray-400 tabular-nums text-xs">{{ formatGameDate(entry.gameDate) }}</span>
          </template>
        </Column>
        <Column field="opponentAbbrev" header="Opp">
          <template #body="{ data: entry }">
            <span class="text-gray-300 font-medium tracking-tight">
              <span class="text-gray-600 text-xs mr-0.5">{{ entry.homeRoadFlag === 'H' ? 'vs' : '@' }}</span>
              {{ entry.opponentAbbrev }}
            </span>
          </template>
        </Column>

        <template v-if="!isGoalie">
          <Column field="goals" header="G">
            <template #body="{ data: entry }">
              <span :class="(entry.goals ?? 0) > 0 ? 'text-white font-bold' : 'text-gray-500'" class="tabular-nums">{{ entry.goals ?? 0 }}</span>
            </template>
          </Column>
          <Column field="assists" header="A">
            <template #body="{ data: entry }">
              <span :class="(entry.assists ?? 0) > 0 ? 'text-white font-bold' : 'text-gray-500'" class="tabular-nums">{{ entry.assists ?? 0 }}</span>
            </template>
          </Column>
          <Column field="points" header="PTS">
            <template #body="{ data: entry }">
              <span :class="(entry.points ?? 0) > 0 ? 'text-white font-bold' : 'text-gray-500'" class="tabular-nums">{{ entry.points ?? 0 }}</span>
            </template>
          </Column>
          <Column field="plusMinus" header="+/-">
            <template #body="{ data: entry }">
              <span
                class="tabular-nums"
                :class="(entry.plusMinus ?? 0) > 0 ? 'text-result-win' : (entry.plusMinus ?? 0) < 0 ? 'text-result-loss' : 'text-gray-500'"
              >{{ (entry.plusMinus ?? 0) > 0 ? '+' : '' }}{{ entry.plusMinus ?? 0 }}</span>
            </template>
          </Column>
          <Column field="shots" header="S">
            <template #body="{ data: entry }">
              <span class="text-gray-400 tabular-nums">{{ entry.shots ?? 0 }}</span>
            </template>
          </Column>
          <Column field="pim" header="PIM">
            <template #body="{ data: entry }">
              <span class="text-gray-500 tabular-nums">{{ entry.pim ?? 0 }}</span>
            </template>
          </Column>
        </template>

        <template v-else>
          <Column field="decision" header="DEC">
            <template #body="{ data: entry }">
              <span
                class="text-xs font-bold tabular-nums"
                :class="entry.decision === 'W' ? 'text-result-win' : entry.decision === 'L' ? 'text-result-loss' : 'text-result-ot'"
              >{{ entry.decision ?? '—' }}</span>
            </template>
          </Column>
          <Column field="shotsAgainst" header="SA">
            <template #body="{ data: entry }">
              <span class="text-gray-400 tabular-nums">{{ entry.shotsAgainst ?? '—' }}</span>
            </template>
          </Column>
          <Column field="saves" header="SV">
            <template #body="{ data: entry }">
              <span class="text-gray-400 tabular-nums">{{ entry.saves ?? '—' }}</span>
            </template>
          </Column>
          <Column field="goalsAgainst" header="GA">
            <template #body="{ data: entry }">
              <span class="text-gray-400 tabular-nums">{{ entry.goalsAgainst ?? '—' }}</span>
            </template>
          </Column>
          <Column field="savePctg" header="SV%">
            <template #body="{ data: entry }">
              <span class="text-white font-bold tabular-nums">{{ entry.savePctg ? `.${(entry.savePctg * 1000).toFixed(0)}` : '—' }}</span>
            </template>
          </Column>
        </template>

        <Column field="toi" header="TOI">
          <template #body="{ data: entry }">
            <span class="text-gray-400 tabular-nums">{{ entry.toi ?? '—' }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <div v-else class="py-12 text-center text-gray-600 text-sm">No game log available</div>
</template>
