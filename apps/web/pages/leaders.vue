<script setup lang="ts">
import { useGetSkaterLeadersQuery, useGetGoalieLeadersQuery } from '~/graphql/generated';

type LeaderLimit = 5 | 10;
const limit = ref<LeaderLimit>(5);
const limitOptions: LeaderLimit[] = [5, 10];

const { result: skaterResult, loading: skaterLoading, error: skaterError } = useGetSkaterLeadersQuery(() => ({
  limit: limit.value,
}));
const { result: goalieResult, loading: goalieLoading, error: goalieError } = useGetGoalieLeadersQuery(() => ({
  limit: limit.value,
}));

const loading = computed(() => skaterLoading.value || goalieLoading.value);
const error = computed(() => skaterError.value || goalieError.value);

const skaterCategories = computed(() => {
  const leaders = skaterResult.value?.skaterLeaders;
  if (!leaders) return [];
  return [
    { title: 'Goals', entries: leaders.goals },
    { title: 'Assists', entries: leaders.assists },
    { title: 'Points', entries: leaders.points },
  ];
});

const goalieCategories = computed(() => {
  const leaders = goalieResult.value?.goalieLeaders;
  if (!leaders) return [];
  return [
    { title: 'Wins', entries: leaders.wins },
    { title: 'Save %', entries: leaders.savePctg, format: (value: number) => (value * 100).toFixed(1) },
    { title: 'Shutouts', entries: leaders.shutouts },
  ];
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-white tracking-tight">Leaders</h1>
      <div class="flex gap-0.5 bg-gray-900 rounded-lg p-1 border border-gray-800">
        <button
          v-for="option in limitOptions"
          :key="option"
          class="px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer border-0"
          :class="limit === option
            ? 'bg-gray-700 text-white'
            : 'bg-transparent text-gray-500 hover:text-gray-300'"
          @click="limit = option"
        >
          Top {{ option }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">{{ error.message }}</Message>

    <template v-else>
      <section class="mb-8">
        <h2 class="section-label mb-4">Skaters</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LeaderCard
            v-for="category in skaterCategories"
            :key="category.title"
            :title="category.title"
            :entries="category.entries"
          />
        </div>
      </section>

      <section>
        <h2 class="section-label mb-4">Goalies</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LeaderCard
            v-for="category in goalieCategories"
            :key="category.title"
            :title="category.title"
            :entries="category.entries"
            :format="category.format"
          />
        </div>
      </section>
    </template>
  </div>
</template>
