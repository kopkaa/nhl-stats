<script setup lang="ts">
import { useGetStandingsQuery } from '~/graphql/generated';
import { Conference, PLAYOFF_SPOTS_PER_CONFERENCE, PLAYOFF_SPOTS_TOTAL } from '~/constants/nhl';

const { result, loading, error } = useGetStandingsQuery({});

const activeTab = ref<'league' | 'eastern' | 'western'>('league');

const allStandings = computed(() => {
  return (result.value?.standings ?? []).map((team) => ({
    ...team,
    diff: team.goalsFor - team.goalsAgainst,
    streak: `${team.streakCode}${team.streakCount}`,
  }));
});

const eastern = computed(() =>
  allStandings.value.filter((t) => t.conferenceName === Conference.Eastern),
);

const western = computed(() =>
  allStandings.value.filter((t) => t.conferenceName === Conference.Western),
);

const tableData = computed(() => {
  if (activeTab.value === 'eastern') return eastern.value;
  if (activeTab.value === 'western') return western.value;
  return allStandings.value;
});

const playoffCutoff = computed(() =>
  activeTab.value === 'league' ? PLAYOFF_SPOTS_TOTAL : PLAYOFF_SPOTS_PER_CONFERENCE,
);

function rowClass(team: (typeof tableData.value)[number]) {
  const index = tableData.value.indexOf(team);
  return index === playoffCutoff.value - 1 ? 'playoff-cutoff' : '';
}

function streakClass(streak: string) {
  if (streak.startsWith('W')) return 'text-green-400';
  if (streak.startsWith('L')) return 'text-red-400';
  return 'text-gray-400';
}
</script>

<template>
  <div v-if="loading" class="flex justify-center py-16">
    <ProgressSpinner />
  </div>

  <Message v-else-if="error" severity="error">{{ error.message }}</Message>

  <div v-else class="standings-table">
    <div class="flex gap-6 mb-5 border-b border-white/10 text-sm font-medium">
      <button
        v-for="tab in (['league', 'eastern', 'western'] as const)"
        :key="tab"
        class="pb-2.5 capitalize cursor-pointer bg-transparent border-0 transition-colors"
        :class="activeTab === tab
          ? 'text-white border-b-2 border-white -mb-px'
          : 'text-gray-500 hover:text-gray-300'"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <DataTable
      :value="tableData"
      sort-field="points"
      :sort-order="-1"
      removable-sort
      size="small"
      :row-class="rowClass"
    >
      <Column header="#" style="width: 2rem">
        <template #body="{ index }">
          <span class="text-gray-500 tabular-nums">{{ index + 1 }}</span>
        </template>
      </Column>

      <Column field="teamName" header="Team" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2.5">
            <img
              v-if="data.teamLogo"
              :src="data.teamLogo"
              :alt="data.teamName"
              class="w-5 h-5 object-contain"
            />
            <span class="font-medium text-white">{{ data.teamName }}</span>
          </div>
        </template>
      </Column>

      <Column field="gamesPlayed" header="GP" sortable class="text-right" />
      <Column field="wins" header="W" sortable />
      <Column field="losses" header="L" sortable />
      <Column field="otLosses" header="OTL" sortable />

      <Column field="points" header="PTS" sortable>
        <template #body="{ data }">
          <span class="font-bold text-white">{{ data.points }}</span>
        </template>
      </Column>

      <Column field="goalsFor" header="GF" sortable />
      <Column field="goalsAgainst" header="GA" sortable />

      <Column field="diff" header="DIFF" sortable>
        <template #body="{ data }">
          <span :class="data.diff > 0 ? 'text-green-400' : data.diff < 0 ? 'text-red-400' : 'text-gray-400'">
            {{ data.diff > 0 ? '+' : '' }}{{ data.diff }}
          </span>
        </template>
      </Column>

      <Column field="streak" header="STRK">
        <template #body="{ data }">
          <span :class="streakClass(data.streak)">{{ data.streak }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>

.standings-table :deep(.p-datatable-table) {
  border-collapse: collapse;
}

.standings-table :deep(.p-datatable-thead > tr > th) {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgb(107 114 128);
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0.75rem;
}

.standings-table :deep(.p-datatable-thead > tr > th.p-datatable-sortable-column:hover) {
  background: transparent;
  color: rgb(209 213 219);
}

.standings-table :deep(.p-datatable-thead > tr > th.p-datatable-column-sorted) {
  background: transparent;
  color: white;
}

.standings-table :deep(.p-datatable-tbody > tr) {
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s;
}

.standings-table :deep(.p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.03);
}

.standings-table :deep(.p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.625rem 0.75rem;
  color: rgb(156 163 175);
  font-variant-numeric: tabular-nums;
}

.standings-table :deep(.p-datatable-tbody > tr.playoff-cutoff) {
  border-bottom: 1px solid rgba(239, 68, 68, 0.5);
}

</style>
