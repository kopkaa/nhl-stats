<script setup lang="ts">
import { useGetSkaterLeadersQuery, useGetGoalieLeadersQuery, type GetSkaterLeadersQuery, type GetGoalieLeadersQuery } from '~/graphql/generated';

type LeaderLimit = 5 | 10;
const limit = ref<LeaderLimit>(5);

const { result: skaterResult, loading: skaterLoading, error: skaterError } = useGetSkaterLeadersQuery(() => ({
  limit: limit.value,
}));
const { result: goalieResult, loading: goalieLoading, error: goalieError } = useGetGoalieLeadersQuery(() => ({
  limit: limit.value,
}));

const loading = computed(() => skaterLoading.value || goalieLoading.value);
const error = computed(() => skaterError.value || goalieError.value);

type SkaterEntry = GetSkaterLeadersQuery['skaterLeaders']['goals'][number];
type GoalieEntry = GetGoalieLeadersQuery['goalieLeaders']['wins'][number];

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
    { title: 'Wins', entries: leaders.wins, format: (val: number) => String(val) },
    { title: 'Save %', entries: leaders.savePctg, format: (val: number) => (val * 100).toFixed(1) },
    { title: 'Shutouts', entries: leaders.shutouts, format: (val: number) => String(val) },
  ];
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-white tracking-tight">Leaders</h1>
      <div class="flex gap-0.5 bg-gray-900 rounded-lg p-1 border border-gray-800">
        <button
          v-for="option in ([5, 10] as LeaderLimit[])"
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
      <!-- Skaters -->
      <div class="mb-8">
        <h2 class="text-[0.7rem] font-semibold text-gray-500 uppercase tracking-widest mb-4">Skaters</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            v-for="category in skaterCategories"
            :key="category.title"
            class="leader-card"
          >
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pb-2 border-b border-white/[0.06]">
              {{ category.title }}
            </h3>
            <div class="flex flex-col">
              <div
                v-for="(entry, index) in category.entries"
                :key="entry.playerId"
                class="flex items-center gap-2.5 px-3 transition-colors hover:bg-white/[0.03]"
                :class="[
                  index === 0 ? 'py-3' : 'py-2',
                  index === 0 ? 'bg-white/[0.04]' : '',
                  index < category.entries.length - 1 ? 'border-b border-white/[0.03]' : '',
                ]"
              >
                <span class="text-[0.65rem] text-gray-600 w-4 tabular-nums text-right shrink-0">{{ index + 1 }}</span>
                <img
                  v-if="entry.headshot"
                  :src="entry.headshot"
                  :alt="`${entry.firstName} ${entry.lastName}`"
                  class="object-cover bg-gray-800 border border-white/[0.08] shrink-0"
                  :class="index === 0 ? 'w-10 h-10 rounded-full' : 'w-7 h-7 rounded-full'"
                />
                <div v-else class="bg-gray-800 border border-white/[0.06] rounded-full shrink-0" :class="index === 0 ? 'w-10 h-10' : 'w-7 h-7'" />
                <div class="flex-1 min-w-0">
                  <div class="truncate" :class="index === 0 ? 'text-white text-sm font-semibold' : 'text-gray-300 text-xs font-medium'">
                    {{ entry.firstName }} {{ entry.lastName }}
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <img
                      v-if="entry.teamLogo"
                      :src="entry.teamLogo"
                      :alt="entry.teamName"
                      class="w-3 h-3 object-contain"
                    />
                    <span class="text-gray-600 text-[0.6rem]">{{ entry.teamName }}</span>
                    <span class="text-gray-700 text-[0.6rem]">&middot;</span>
                    <span class="text-gray-600 text-[0.6rem]">{{ entry.positionCode }}</span>
                  </div>
                </div>
                <span
                  class="tabular-nums font-bold shrink-0"
                  :class="index === 0 ? 'text-white text-lg' : 'text-gray-300 text-sm'"
                >
                  {{ entry.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Goalies -->
      <div>
        <h2 class="text-[0.7rem] font-semibold text-gray-500 uppercase tracking-widest mb-4">Goalies</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            v-for="category in goalieCategories"
            :key="category.title"
            class="leader-card"
          >
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pb-2 border-b border-white/[0.06]">
              {{ category.title }}
            </h3>
            <div class="flex flex-col">
              <div
                v-for="(entry, index) in category.entries"
                :key="entry.playerId"
                class="flex items-center gap-2.5 px-3 transition-colors hover:bg-white/[0.03]"
                :class="[
                  index === 0 ? 'py-3' : 'py-2',
                  index === 0 ? 'bg-white/[0.04]' : '',
                  index < category.entries.length - 1 ? 'border-b border-white/[0.03]' : '',
                ]"
              >
                <span class="text-[0.65rem] text-gray-600 w-4 tabular-nums text-right shrink-0">{{ index + 1 }}</span>
                <img
                  v-if="entry.headshot"
                  :src="entry.headshot"
                  :alt="`${entry.firstName} ${entry.lastName}`"
                  class="object-cover bg-gray-800 border border-white/[0.08] shrink-0"
                  :class="index === 0 ? 'w-10 h-10 rounded-full' : 'w-7 h-7 rounded-full'"
                />
                <div v-else class="bg-gray-800 border border-white/[0.06] rounded-full shrink-0" :class="index === 0 ? 'w-10 h-10' : 'w-7 h-7'" />
                <div class="flex-1 min-w-0">
                  <div class="truncate" :class="index === 0 ? 'text-white text-sm font-semibold' : 'text-gray-300 text-xs font-medium'">
                    {{ entry.firstName }} {{ entry.lastName }}
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <img
                      v-if="entry.teamLogo"
                      :src="entry.teamLogo"
                      :alt="entry.teamName"
                      class="w-3 h-3 object-contain"
                    />
                    <span class="text-gray-600 text-[0.6rem]">{{ entry.teamName }}</span>
                  </div>
                </div>
                <span
                  class="tabular-nums font-bold shrink-0"
                  :class="index === 0 ? 'text-white text-lg' : 'text-gray-300 text-sm'"
                >
                  {{ category.format(entry.value) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.leader-card {
  background: rgb(17 17 27);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 0.75rem 0 0.25rem;
  min-width: 0;
  overflow: hidden;
}
</style>
