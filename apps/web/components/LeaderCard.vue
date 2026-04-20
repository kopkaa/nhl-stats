<script setup lang="ts">
import type { SkaterLeaderEntry, GoalieLeaderEntry } from '~/graphql/generated';

type LeaderEntry = SkaterLeaderEntry | GoalieLeaderEntry;

withDefaults(
  defineProps<{
    title: string;
    entries: LeaderEntry[];
    format?: (value: number) => string;
  }>(),
  {
    format: (value: number) => String(value),
  },
);

const positionOf = (entry: LeaderEntry) =>
  'positionCode' in entry ? entry.positionCode : null;
</script>

<template>
  <div class="leader-card">
    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pb-2 border-b border-white/[0.06]">
      {{ title }}
    </h3>
    <div class="flex flex-col">
      <div
        v-for="(entry, index) in entries"
        :key="entry.playerId"
        class="flex items-center gap-2.5 px-3 transition-colors hover:bg-white/[0.03]"
        :class="[
          index === 0 ? 'py-3 bg-white/[0.04]' : 'py-2',
          index < entries.length - 1 ? 'border-b border-white/[0.03]' : '',
        ]"
      >
        <span class="text-[0.65rem] text-gray-600 w-4 tabular-nums text-right shrink-0">{{ index + 1 }}</span>
        <img
          v-if="entry.headshot"
          :src="entry.headshot"
          :alt="`${entry.firstName} ${entry.lastName}`"
          class="object-cover bg-gray-800 border border-white/[0.08] shrink-0 rounded-full"
          :class="index === 0 ? 'w-10 h-10' : 'w-7 h-7'"
        />
        <div
          v-else
          class="bg-gray-800 border border-white/[0.06] rounded-full shrink-0"
          :class="index === 0 ? 'w-10 h-10' : 'w-7 h-7'"
        />
        <div class="flex-1 min-w-0">
          <div
            class="truncate"
            :class="index === 0 ? 'text-white text-sm font-semibold' : 'text-gray-300 text-xs font-medium'"
          >
            {{ entry.firstName }} {{ entry.lastName }}
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <img
              v-if="entry.teamLogo"
              :src="entry.teamLogo"
              :alt="entry.teamName"
              class="w-4 h-4 object-contain shrink-0"
            />
            <span class="text-gray-400 text-[0.7rem] truncate">{{ entry.teamName }}</span>
            <template v-if="positionOf(entry)">
              <span class="text-gray-600 text-[0.7rem]">&middot;</span>
              <span class="text-gray-500 text-[0.7rem]">{{ positionOf(entry) }}</span>
            </template>
          </div>
        </div>
        <span
          class="tabular-nums font-bold shrink-0"
          :class="index === 0 ? 'text-white text-lg' : 'text-gray-300 text-sm'"
        >
          {{ format(entry.value) }}
        </span>
      </div>
    </div>
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
