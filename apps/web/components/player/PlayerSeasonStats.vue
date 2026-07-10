<script setup lang="ts">
import { useGetPlayerSkaterStatsQuery, useGetPlayerGoalieStatsQuery } from '~/graphql/generated';

const props = defineProps<{
  playerId: number;
  isGoalie: boolean;
}>();

const { result: skaterStatsResult } = useGetPlayerSkaterStatsQuery(
  () => ({ playerId: props.playerId }),
  { enabled: computed(() => !props.isGoalie) },
);

const { result: goalieStatsResult } = useGetPlayerGoalieStatsQuery(
  () => ({ playerId: props.playerId }),
  { enabled: computed(() => props.isGoalie) },
);

const skaterStats = computed(() => skaterStatsResult.value?.playerSkaterStats ?? []);
const goalieStats = computed(() => goalieStatsResult.value?.playerGoalieStats ?? []);
</script>

<template>
  <template v-if="!isGoalie">
    <div v-if="skaterStats.length" class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
      <DataTable :value="skaterStats" size="small" class="nhl-dt">
        <Column field="season" header="Season">
          <template #body="{ data: stat }">
            <span class="text-gray-300 font-medium tabular-nums">{{ stat.season }}</span>
          </template>
        </Column>
        <Column field="gamesPlayed" header="GP" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.gamesPlayed }}</span>
          </template>
        </Column>
        <Column field="goals" header="G" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.goals }}</span>
          </template>
        </Column>
        <Column field="assists" header="A" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.assists }}</span>
          </template>
        </Column>
        <Column field="points" header="PTS" sortable>
          <template #body="{ data: stat }">
            <span class="text-white font-bold tabular-nums">{{ stat.points }}</span>
          </template>
        </Column>
        <Column field="plusMinus" header="+/-" sortable>
          <template #body="{ data: stat }">
            <span
              class="tabular-nums"
              :class="stat.plusMinus > 0 ? 'text-result-win' : stat.plusMinus < 0 ? 'text-result-loss' : 'text-gray-400'"
            >{{ stat.plusMinus > 0 ? '+' : '' }}{{ stat.plusMinus }}</span>
          </template>
        </Column>
        <Column field="penaltyMinutes" header="PIM" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.penaltyMinutes }}</span>
          </template>
        </Column>
        <Column field="powerPlayGoals" header="PPG" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.powerPlayGoals }}</span>
          </template>
        </Column>
        <Column field="shorthandedGoals" header="SHG" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.shorthandedGoals }}</span>
          </template>
        </Column>
        <Column field="gameWinningGoals" header="GWG" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.gameWinningGoals }}</span>
          </template>
        </Column>
        <Column field="shots" header="S" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.shots }}</span>
          </template>
        </Column>
        <Column field="shootingPctg" header="S%" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ formatPctg(stat.shootingPctg) }}</span>
          </template>
        </Column>
        <Column field="avgTimeOnIce" header="TOI" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ formatToi(stat.avgTimeOnIce) }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="py-12 text-center text-gray-600 text-sm">No season stats available</div>
  </template>

  <template v-else>
    <div v-if="goalieStats.length" class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
      <DataTable :value="goalieStats" size="small" class="nhl-dt">
        <Column field="season" header="Season">
          <template #body="{ data: stat }">
            <span class="text-gray-300 font-medium tabular-nums">{{ stat.season }}</span>
          </template>
        </Column>
        <Column field="gamesPlayed" header="GP" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.gamesPlayed }}</span>
          </template>
        </Column>
        <Column field="gamesStarted" header="GS" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.gamesStarted }}</span>
          </template>
        </Column>
        <Column field="wins" header="W" sortable>
          <template #body="{ data: stat }">
            <span class="text-white font-bold tabular-nums">{{ stat.wins }}</span>
          </template>
        </Column>
        <Column field="losses" header="L" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.losses }}</span>
          </template>
        </Column>
        <Column field="otLosses" header="OTL" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.otLosses }}</span>
          </template>
        </Column>
        <Column field="goalsAgainstAvg" header="GAA" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.goalsAgainstAvg?.toFixed(2) ?? '—' }}</span>
          </template>
        </Column>
        <Column field="savePctg" header="SV%" sortable>
          <template #body="{ data: stat }">
            <span class="text-white font-bold tabular-nums">{{ stat.savePctg ? `.${(stat.savePctg * 1000).toFixed(0)}` : '—' }}</span>
          </template>
        </Column>
        <Column field="shutouts" header="SO" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.shutouts }}</span>
          </template>
        </Column>
        <Column field="shotsAgainst" header="SA" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.shotsAgainst }}</span>
          </template>
        </Column>
        <Column field="saves" header="SV" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.saves }}</span>
          </template>
        </Column>
        <Column field="goalsAgainst" header="GA" sortable>
          <template #body="{ data: stat }">
            <span class="text-gray-400 tabular-nums">{{ stat.goalsAgainst }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="py-12 text-center text-gray-600 text-sm">No season stats available</div>
  </template>
</template>
