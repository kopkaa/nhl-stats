<script setup lang="ts">
import { useGetStandingsQuery } from '~/graphql/generated';

const { result, loading, error } = useGetStandingsQuery({});

const standings = computed(() => {
  return (result.value?.standings ?? []).map((row) => {
    const diff = row.goalsFor - row.goalsAgainst;
    const streak = `${row.streakCode}${row.streakCount}`;
    return { ...row, diff, streak };
  });
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Standings</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">
      {{ error.message }}
    </Message>

    <DataTable
      v-else
      :value="standings"
      sort-field="points"
      :sort-order="-1"
      removable-sort
      size="small"
    >
      <Column header="#" style="width: 2.5rem">
        <template #body="{ index }">
          <span class="text-gray-500">{{ index + 1 }}</span>
        </template>
      </Column>

      <Column header="Team" field="teamName" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <img
              v-if="data.teamLogo"
              :src="data.teamLogo"
              :alt="data.teamName"
              class="w-6 h-6 object-contain"
            />
            <span class="font-medium">{{ data.teamName }}</span>
          </div>
        </template>
      </Column>

      <Column field="gamesPlayed" header="GP" sortable />
      <Column field="wins" header="W" sortable />
      <Column field="losses" header="L" sortable />
      <Column field="otLosses" header="OTL" sortable />

      <Column field="points" header="PTS" sortable>
        <template #body="{ data }">
          <span class="font-bold">{{ data.points }}</span>
        </template>
      </Column>

      <Column field="goalsFor" header="GF" sortable />
      <Column field="goalsAgainst" header="GA" sortable />

      <Column field="diff" header="DIFF" sortable>
        <template #body="{ data }">
          <span :class="data.diff > 0 ? 'text-green-400' : data.diff < 0 ? 'text-red-400' : ''">
            {{ data.diff > 0 ? '+' : '' }}{{ data.diff }}
          </span>
        </template>
      </Column>

      <Column field="streak" header="STRK" />
    </DataTable>
  </div>
</template>
