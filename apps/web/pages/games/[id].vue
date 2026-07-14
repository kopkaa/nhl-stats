<script setup lang="ts">
import { GameState, useGetGameDetailQuery } from '~/graphql/generated';

const LIVE_POLL_MS = 20000;

const route = useRoute();
const gameId = computed(() => Number(route.params.id));

const { result, loading, error } = useGetGameDetailQuery(
  () => ({ id: gameId.value }),
  () => ({ pollInterval: isLive.value ? LIVE_POLL_MS : 0 }),
);

const game = computed(() => result.value?.gameDetail);

const isLive = computed(() =>
  game.value ? [GameState.Live, GameState.Crit].includes(game.value.gameState) : false,
);

type Tab = 'summary' | 'stats';
const activeTab = ref<Tab>('summary');

const tabs: { key: Tab; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'stats', label: 'Team Stats' },
];

const headingDate = computed(() =>
  game.value ? formatGameDate(game.value.gameDate) : '',
);
</script>

<template>
  <div>
    <div v-if="loading && !game" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">{{ error.message }}</Message>

    <div v-else-if="!game" class="py-20 text-center text-gray-500 text-sm">Game not found</div>

    <template v-else>
      <div class="flex items-center justify-between mb-3">
        <NuxtLink
          to="/games"
          class="flex items-center gap-1 text-[0.75rem] text-gray-500 no-underline hover:text-gray-300 transition-colors"
        >
          <i class="pi pi-angle-left text-xs" />
          Games
        </NuxtLink>
        <span class="text-[0.75rem] text-gray-600">{{ headingDate }}</span>
      </div>

      <GameScoreboard :game="game" />
      <GameLinescore :game="game" />

      <div class="flex border-b border-white/[0.08] mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="relative flex items-center gap-1.5 px-5 py-3 text-[0.8rem] font-medium bg-transparent border-0 cursor-pointer tracking-tight transition-colors"
          :class="activeTab === tab.key ? 'text-white after:absolute after:bottom-[-1px] after:left-3 after:right-3 after:h-0.5 after:bg-white after:rounded-t-sm' : 'text-gray-500 hover:text-gray-300'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <GameSummary v-if="activeTab === 'summary'" :game="game" />
      <GameTeamStats v-else :game="game" />
    </template>
  </div>
</template>
