<script setup lang="ts">
import { PositionCode, useGetPlayerQuery } from '~/graphql/generated';

const route = useRoute();
const playerId = computed(() => Number(route.params.id));

const { result: playerResult, loading, error } = useGetPlayerQuery(() => ({ id: playerId.value }));

const player = computed(() => playerResult.value?.player);
const isGoalie = computed(() => player.value?.positionCode === PositionCode.G);

type Tab = 'stats' | 'games';
const activeTab = ref<Tab>('stats');

const tabs: { key: Tab; label: string }[] = [
  { key: 'stats', label: 'Season Stats' },
  { key: 'games', label: 'Game log' },
];
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">{{ error.message }}</Message>

    <div v-else-if="!player" class="py-20 text-center text-gray-500">Player not found</div>

    <template v-else>
      <PlayerHeader :player="player" :is-goalie="isGoalie" />

      <div class="flex border-b border-white/[0.08] mb-6">
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

      <PlayerSeasonStats v-if="activeTab === 'stats'" :player-id="playerId" :is-goalie="isGoalie" />
      <PlayerGameLog v-else :player-id="playerId" :is-goalie="isGoalie" />
    </template>
  </div>
</template>
