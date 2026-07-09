<script setup lang="ts">
import { PositionCode, type GetPlayerQuery } from '~/graphql/generated';

type PlayerDetail = NonNullable<GetPlayerQuery['player']>;

const props = defineProps<{
  player: PlayerDetail;
  isGoalie: boolean;
}>();

const age = computed(() => {
  if (!props.player.birthDate) return null;
  const birth = new Date(props.player.birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years--;
  return years;
});

function positionLabel(code: PositionCode): string {
  const labels: Record<PositionCode, string> = {
    [PositionCode.C]: 'Center',
    [PositionCode.L]: 'Left Wing',
    [PositionCode.R]: 'Right Wing',
    [PositionCode.D]: 'Defenseman',
    [PositionCode.G]: 'Goalie',
  };
  return labels[code] ?? code;
}
</script>

<template>
  <div class="flex items-start gap-5 mb-8">
    <div class="relative shrink-0">
      <img
        v-if="player.headshot"
        :src="player.headshot"
        :alt="`${player.firstName} ${player.lastName}`"
        class="w-20 h-20 rounded-lg object-cover bg-[rgb(17_17_27)] border border-white/[0.08]"
      />
      <div v-else class="w-20 h-20 rounded-lg bg-[rgb(17_17_27)] border border-white/[0.06]" />
      <span
        v-if="player.sweaterNumber"
        class="absolute -bottom-2 -right-2 text-[0.65rem] font-bold tabular-nums bg-[rgb(17_17_27)] border border-white/[0.1] text-gray-400 px-1.5 py-px rounded"
      >#{{ player.sweaterNumber }}</span>
    </div>

    <div class="min-w-0">
      <h1 class="text-2xl font-bold text-white tracking-tight leading-tight">
        {{ player.firstName }} {{ player.lastName }}
      </h1>

      <div class="flex items-center gap-2 mt-1">
        <img v-if="player.teamLogo" :src="player.teamLogo" :alt="player.teamName ?? ''" class="w-4 h-4 object-contain opacity-90" />
        <NuxtLink
          v-if="player.teamId"
          :to="`/teams/${player.teamId}`"
          class="text-sm text-gray-400 hover:text-white transition-colors"
        >{{ player.teamName }}</NuxtLink>
        <span class="text-gray-700">·</span>
        <span class="text-[0.65rem] font-medium text-gray-400 bg-white/5 px-1.5 py-px rounded-sm tracking-tight">
          {{ positionLabel(player.positionCode) }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
        <span v-if="player.birthCountry" class="text-xs text-gray-500">{{ player.birthCountry }}</span>
        <span v-if="age" class="text-xs text-gray-500">{{ age }} yrs</span>
        <span v-if="player.heightCm" class="text-xs text-gray-500">{{ formatHeight(player.heightCm) }}</span>
        <span v-if="player.weightKg" class="text-xs text-gray-500">{{ player.weightKg }} kg</span>
        <span v-if="player.shootsCatches" class="text-xs text-gray-500">
          {{ isGoalie ? 'Catches' : 'Shoots' }}: {{ player.shootsCatches }}
        </span>
      </div>
    </div>
  </div>
</template>
