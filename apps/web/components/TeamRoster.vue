<script setup lang="ts">
import type { GetTeamRosterQuery } from '~/graphql/generated';
import { PositionCode } from '~/graphql/generated';

type Player = GetTeamRosterQuery['teamRoster'][number];

const props = defineProps<{
  players: Player[];
}>();

const positionGroups = [
  { label: 'Forwards', codes: [PositionCode.C, PositionCode.L, PositionCode.R] },
  { label: 'Defensemen', codes: [PositionCode.D] },
  { label: 'Goalies', codes: [PositionCode.G] },
];

const rosterByPosition = computed(() =>
  positionGroups.map((group) => ({
    ...group,
    players: (props.players ?? [])
      .filter((player) => group.codes.includes(player.positionCode))
      .sort((playerA, playerB) => (playerA.sweaterNumber ?? 99) - (playerB.sweaterNumber ?? 99)),
  })),
);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-for="group in rosterByPosition" :key="group.label">
      <div class="flex items-center gap-2 mb-2">
        <h3 class="text-[0.7rem] font-semibold text-gray-500 uppercase tracking-widest m-0">{{ group.label }}</h3>
        <span class="text-[0.6rem] text-gray-600 bg-white/5 px-1.5 py-px rounded tabular-nums">{{ group.players.length }}</span>
      </div>
      <div class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
        <DataTable :value="group.players" size="small" class="nhl-dt nhl-dt--name-col-2">
          <Column field="sweaterNumber" header="#" sortable>
            <template #body="{ data: player }">
              <span class="text-gray-500 font-semibold tabular-nums text-xs">{{ player.sweaterNumber ?? '—' }}</span>
            </template>
          </Column>

          <Column field="lastName" header="Player" sortable>
            <template #body="{ data: player }">
              <div class="flex items-center gap-2">
                <img
                  v-if="player.headshot"
                  :src="player.headshot"
                  :alt="`${player.firstName} ${player.lastName}`"
                  class="w-7 h-7 rounded-full object-cover bg-[rgb(31_31_46)] border border-white/[0.08]"
                />
                <div v-else class="w-7 h-7 rounded-full bg-[rgb(31_31_46)] border border-white/[0.06]" />
                <span class="text-white font-medium">{{ player.firstName }} {{ player.lastName }}</span>
              </div>
            </template>
          </Column>

          <Column field="positionCode" header="POS" sortable>
            <template #body="{ data: player }">
              <span class="inline-block text-[0.65rem] font-medium text-gray-400 bg-white/5 px-1.5 py-px rounded-sm tracking-tight">{{ player.positionCode }}</span>
            </template>
          </Column>

          <Column field="shootsCatches" header="S/C">
            <template #body="{ data: player }">
              <span class="text-gray-400">{{ player.shootsCatches ?? '—' }}</span>
            </template>
          </Column>

          <Column field="heightCm" header="HT" sortable>
            <template #body="{ data: player }">
              <span class="text-gray-400">{{ formatHeight(player.heightCm) }}</span>
            </template>
          </Column>

          <Column field="weightKg" header="WT" sortable>
            <template #body="{ data: player }">
              <span class="text-gray-400">{{ player.weightKg ? `${player.weightKg} kg` : '—' }}</span>
            </template>
          </Column>

          <Column field="birthCountry" header="BORN">
            <template #body="{ data: player }">
              <span class="text-gray-500 text-xs">{{ player.birthCountry ?? '' }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
