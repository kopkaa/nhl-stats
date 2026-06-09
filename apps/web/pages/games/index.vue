<script setup lang="ts">
import { useGetGamesByDateQuery } from '~/graphql/generated';

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const selectedDate = ref<Date | null>(null);
onMounted(() => {
  selectedDate.value = new Date();
});

const dateParam = computed(() => (selectedDate.value ? toIsoDate(selectedDate.value) : ''));

const { result, loading, error } = useGetGamesByDateQuery(
  () => ({ date: dateParam.value }),
  () => ({ enabled: dateParam.value !== '' }),
);

const games = computed(() =>
  [...(result.value?.gamesByDate ?? [])].sort((gameA, gameB) =>
    (gameA.startTimeUTC ?? '').localeCompare(gameB.startTimeUTC ?? ''),
  ),
);

function shiftDay(delta: number) {
  if (!selectedDate.value) return;
  const next = new Date(selectedDate.value);
  next.setDate(next.getDate() + delta);
  selectedDate.value = next;
}

const headingDate = computed(() =>
  selectedDate.value
    ? selectedDate.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '',
);
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-xl font-semibold text-white tracking-tight">Games</h1>
        <p class="text-sm text-gray-500 mt-0.5 h-5">{{ headingDate }}</p>
      </div>
      <div class="flex items-center gap-1">
        <button class="nav-day" aria-label="Previous day" @click="shiftDay(-1)">
          <i class="pi pi-angle-left text-sm" />
        </button>
        <DatePicker v-model="selectedDate" date-format="M d, yy" class="games-dp" />
        <button class="nav-day" aria-label="Next day" @click="shiftDay(1)">
          <i class="pi pi-angle-right text-sm" />
        </button>
      </div>
    </div>

    <div v-if="!selectedDate || loading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">{{ error.message }}</Message>

    <div v-else-if="!games.length" class="py-20 text-center text-gray-500 text-sm">
      No games scheduled
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <GameCard v-for="game in games" :key="game.id" :game="game" />
    </div>
  </div>
</template>

<style scoped>
.nav-day {
  @apply flex items-center justify-center w-8 h-8 rounded-md bg-gray-900 border border-gray-800 text-gray-400 cursor-pointer transition-colors hover:bg-gray-800 hover:text-white;
}

.games-dp :deep(.p-inputtext) {
  background: rgb(17 24 39);
  border: 1px solid rgb(31 41 55);
  border-radius: 0.375rem;
  color: rgb(229 231 235);
  font-size: 0.8rem;
  padding: 0.45rem 0.7rem;
  width: 8.5rem;
  text-align: center;
}

.games-dp :deep(.p-inputtext:enabled:focus) {
  border-color: rgb(75 85 99);
  box-shadow: none;
}
</style>
