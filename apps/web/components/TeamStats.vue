<script setup lang="ts">
import type { GetTeamSkaterStatsQuery, GetTeamGoalieStatsQuery } from '~/graphql/generated';

type Skater = GetTeamSkaterStatsQuery['teamSkaterStats'][number];
type Goalie = GetTeamGoalieStatsQuery['teamGoalieStats'][number];

defineProps<{
  skaters: Skater[];
  goalies: Goalie[];
}>();
</script>

<template>
  <div>
    <!-- Skaters -->
    <h3 class="section-label mb-2">Skaters</h3>
    <div class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden mb-6">
      <DataTable :value="skaters" size="small" class="nhl-dt nhl-dt--name-col-1">
        <Column field="lastName" header="Player" sortable>
          <template #body="{ data: skater }">
            <div class="flex items-center gap-2">
              <img
                v-if="skater.headshot"
                :src="skater.headshot"
                :alt="`${skater.firstName} ${skater.lastName}`"
                class="w-6 h-6 rounded-full object-cover bg-gray-800"
              />
              <span class="text-white font-medium">{{ skater.firstName[0] }}. {{ skater.lastName }}</span>
            </div>
          </template>
        </Column>

        <Column field="positionCode" header="POS" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-500 text-xs">{{ skater.positionCode }}</span>
          </template>
        </Column>

        <Column field="gamesPlayed" header="GP" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.gamesPlayed }}</span>
          </template>
        </Column>

        <Column field="goals" header="G" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.goals }}</span>
          </template>
        </Column>

        <Column field="assists" header="A" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.assists }}</span>
          </template>
        </Column>

        <Column field="points" header="PTS" sortable>
          <template #body="{ data: skater }">
            <span class="text-white font-bold tabular-nums">{{ skater.points }}</span>
          </template>
        </Column>

        <Column field="plusMinus" header="+/-" sortable>
          <template #body="{ data: skater }">
            <span
              :class="skater.plusMinus > 0 ? 'text-result-win' : skater.plusMinus < 0 ? 'text-result-loss' : ''"
              class="tabular-nums"
            >
              {{ skater.plusMinus > 0 ? '+' : '' }}{{ skater.plusMinus }}
            </span>
          </template>
        </Column>

        <Column field="penaltyMinutes" header="PIM" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.penaltyMinutes }}</span>
          </template>
        </Column>

        <Column field="powerPlayGoals" header="PPG" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.powerPlayGoals }}</span>
          </template>
        </Column>

        <Column field="shorthandedGoals" header="SHG" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.shorthandedGoals }}</span>
          </template>
        </Column>

        <Column field="gameWinningGoals" header="GWG" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.gameWinningGoals }}</span>
          </template>
        </Column>

        <Column field="shots" header="S" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ skater.shots }}</span>
          </template>
        </Column>

        <Column field="shootingPctg" header="S%" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ formatPctg(skater.shootingPctg) }}</span>
          </template>
        </Column>

        <Column field="avgTimeOnIce" header="TOI" sortable>
          <template #body="{ data: skater }">
            <span class="text-gray-400 tabular-nums">{{ formatToi(skater.avgTimeOnIce) }}</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Goalies -->
    <h3 class="section-label mb-2">Goalies</h3>
    <div class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
      <DataTable :value="goalies" size="small" class="nhl-dt nhl-dt--name-col-1">
        <Column field="lastName" header="Player" sortable>
          <template #body="{ data: goalie }">
            <div class="flex items-center gap-2">
              <img
                v-if="goalie.headshot"
                :src="goalie.headshot"
                :alt="`${goalie.firstName} ${goalie.lastName}`"
                class="w-6 h-6 rounded-full object-cover bg-gray-800"
              />
              <span class="text-white font-medium">{{ goalie.firstName[0] }}. {{ goalie.lastName }}</span>
            </div>
          </template>
        </Column>

        <Column field="gamesPlayed" header="GP" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.gamesPlayed }}</span>
          </template>
        </Column>

        <Column field="gamesStarted" header="GS" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.gamesStarted }}</span>
          </template>
        </Column>

        <Column field="wins" header="W" sortable>
          <template #body="{ data: goalie }">
            <span class="text-white font-bold tabular-nums">{{ goalie.wins }}</span>
          </template>
        </Column>

        <Column field="losses" header="L" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.losses }}</span>
          </template>
        </Column>

        <Column field="otLosses" header="OTL" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.otLosses }}</span>
          </template>
        </Column>

        <Column field="goalsAgainstAvg" header="GAA" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.goalsAgainstAvg?.toFixed(2) ?? '—' }}</span>
          </template>
        </Column>

        <Column field="savePctg" header="SV%" sortable>
          <template #body="{ data: goalie }">
            <span class="text-white font-bold tabular-nums">{{ goalie.savePctg ? `.${(goalie.savePctg * 1000).toFixed(0)}` : '—' }}</span>
          </template>
        </Column>

        <Column field="shutouts" header="SO" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.shutouts }}</span>
          </template>
        </Column>

        <Column field="shotsAgainst" header="SA" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.shotsAgainst }}</span>
          </template>
        </Column>

        <Column field="saves" header="SV" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.saves }}</span>
          </template>
        </Column>

        <Column field="goalsAgainst" header="GA" sortable>
          <template #body="{ data: goalie }">
            <span class="text-gray-400 tabular-nums">{{ goalie.goalsAgainst }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
