<script setup lang="ts">
import type { GetStandingsQuery } from '~/graphql/generated';

type StandingRow = GetStandingsQuery['standings'][number] & {
  diff: number;
  streak: string;
};

const props = defineProps<{
  teams: StandingRow[];
  title: string;
  subtitle?: string;
  playoffCutoff?: number;
  showConference?: boolean;
  showRank?: boolean;
}>();

const sortField = ref('points');
const sortOrder = ref<1 | -1>(-1);

const sortedTeams = ref<StandingRow[]>([]);
watch(() => props.teams, (teams) => { sortedTeams.value = [...teams]; }, { immediate: true });

function onSort(e: { sortField?: string | ((item: unknown) => string); sortOrder?: 0 | 1 | -1 | null }) {
  if (typeof e.sortField === 'string') sortField.value = e.sortField;
  if (e.sortOrder === 1 || e.sortOrder === -1) sortOrder.value = e.sortOrder;
}

function rowClass(data: StandingRow) {
  if (!props.playoffCutoff) return '';
  return sortedTeams.value.indexOf(data) === props.playoffCutoff - 1 ? 'playoff-cutoff' : '';
}

const streakColors: Record<string, string> = {
  W: 'text-result-win font-medium',
  L: 'text-result-loss font-medium',
  OT: 'text-result-ot font-medium',
};

const streakClass = (streak: string) => streakColors[streak[0]] ?? 'text-gray-400';
const diffClass = (diff: number) => diff > 0 ? 'text-result-win' : diff < 0 ? 'text-result-loss' : 'text-gray-500';
</script>

<template>
  <div class="standings-block">
    <div class="flex items-baseline gap-2 mb-3">
      <h2 class="text-sm font-semibold text-white uppercase tracking-wider">{{ title }}</h2>
      <span v-if="subtitle" class="text-xs text-gray-500">{{ subtitle }}</span>
    </div>

    <DataTable
      :value="teams"
      :sort-field="sortField"
      :sort-order="sortOrder"
      removable-sort
      size="small"
      :row-class="rowClass"
      class="standings-dt"
      @sort="onSort"
      @value-change="(sorted) => sortedTeams = sorted"
    >
      <Column v-if="showRank" header="#">
        <template #body="{ index }">
          <span class="text-gray-600 tabular-nums">{{ index + 1 }}</span>
        </template>
      </Column>

      <Column field="teamName" header="Team" sortable>
        <template #body="{ data }">
          <NuxtLink :to="`/teams/${data.teamId}`" class="flex items-center gap-2 hover:text-white transition-colors">
            <img
              v-if="data.teamLogo"
              :src="data.teamLogo"
              :alt="data.teamName"
              class="w-4 h-4 object-contain shrink-0"
            />
            <span class="text-white font-medium hover:underline">{{ data.teamName }}</span>
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="showConference" field="conferenceName" header="CONF" sortable>
        <template #body="{ data }">
          <span class="text-gray-400 text-xs">{{ data.conferenceName?.[0] ?? '—' }}</span>
        </template>
      </Column>

      <Column field="gamesPlayed" header="GP" sortable>
        <template #body="{ data }">
          <span class="text-gray-400 tabular-nums">{{ data.gamesPlayed }}</span>
        </template>
      </Column>

      <Column field="wins" header="W" sortable>
        <template #body="{ data }">
          <span class="text-gray-300 tabular-nums">{{ data.wins }}</span>
        </template>
      </Column>

      <Column field="losses" header="L" sortable>
        <template #body="{ data }">
          <span class="text-gray-400 tabular-nums">{{ data.losses }}</span>
        </template>
      </Column>

      <Column field="otLosses" header="OTL" sortable>
        <template #body="{ data }">
          <span class="text-gray-400 tabular-nums">{{ data.otLosses }}</span>
        </template>
      </Column>

      <Column field="points" header="PTS" sortable>
        <template #body="{ data }">
          <span class="text-white font-bold tabular-nums">{{ data.points }}</span>
        </template>
      </Column>

      <Column field="goalsFor" header="GF" sortable>
        <template #body="{ data }">
          <span class="text-gray-400 tabular-nums">{{ data.goalsFor }}</span>
        </template>
      </Column>

      <Column field="goalsAgainst" header="GA" sortable>
        <template #body="{ data }">
          <span class="text-gray-400 tabular-nums">{{ data.goalsAgainst }}</span>
        </template>
      </Column>

      <Column field="diff" header="DIFF" sortable>
        <template #body="{ data }">
          <span :class="diffClass(data.diff)" class="tabular-nums">
            {{ data.diff > 0 ? '+' : '' }}{{ data.diff }}
          </span>
        </template>
      </Column>

      <Column field="streak" header="STRK">
        <template #body="{ data }">
          <span :class="streakClass(data.streak)" class="tabular-nums">{{ data.streak }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.standings-block {
  background: rgb(17 17 27);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 1rem 0.75rem 0.5rem;
  min-width: 0;
  overflow: hidden;
}

.standings-dt :deep(.p-datatable-table-container) {
  overflow: hidden;
}

.standings-dt :deep(.p-datatable-table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

.standings-dt :deep(th),
.standings-dt :deep(td) {
  overflow: hidden;
  white-space: nowrap;
}

.standings-dt :deep(.p-datatable-thead > tr > th) {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgb(107 114 128);
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.4rem 0.3rem;
  text-align: center;
}

.standings-dt :deep(.p-datatable-thead > tr > th:nth-child(2)) {
  text-align: left;
  width: 35%;
}

.standings-dt :deep(.p-datatable-sort-icon) {
  width: 0.6rem !important;
  height: 0.6rem !important;
  margin-left: 2px;
}

.standings-dt :deep(.p-datatable-column-header-content) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.standings-dt :deep(.p-datatable-thead > tr > th:nth-child(2) .p-datatable-column-header-content) {
  justify-content: flex-start;
}

.standings-dt :deep(.p-datatable-thead > tr > th.p-datatable-sortable-column:hover) {
  background: transparent;
  color: rgb(209 213 219);
}

.standings-dt :deep(.p-datatable-thead > tr > th.p-datatable-column-sorted) {
  background: transparent;
  color: white;
}

.standings-dt :deep(.p-datatable-tbody > tr) {
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.12s;
}

.standings-dt :deep(.p-datatable-tbody > tr:last-child) {
  border-bottom: none;
}

.standings-dt :deep(.p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.03);
}

.standings-dt :deep(.p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.4rem 0.3rem;
  color: rgb(156 163 175);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.standings-dt :deep(.p-datatable-tbody > tr > td:nth-child(2)) {
  text-align: left;
}

.standings-dt :deep(.p-datatable-tbody > tr.playoff-cutoff) {
  border-bottom: 1px solid rgba(239, 68, 68, 0.45);
}

</style>
