<script setup lang="ts">
import { useGetTeamsQuery, useGetStandingsQuery } from '~/graphql/generated';
import { Conference, Division } from '~/constants/nhl';

const { result, loading, error } = useGetTeamsQuery();
const { result: standingsResult } = useGetStandingsQuery();

const search = ref('');
const activeConference = ref<Conference | 'all'>('all');
const activeDivision = ref<Division | null>(null);

const enrichedTeams = computed(() => {
  const standings = standingsResult.value?.standings ?? [];
  const byTeamId = Object.fromEntries(
    standings.map((s) => [s.teamId, { divisionName: s.divisionName, conferenceName: s.conferenceName }]),
  );
  return (result.value?.teams ?? []).map((team) => ({ ...team, ...byTeamId[team.id] }));
});

const conferences = [
  { label: 'All', value: 'all' as const },
  { label: 'Eastern', value: Conference.Eastern },
  { label: 'Western', value: Conference.Western },
];

const divisionsByConference: Record<Conference, Division[]> = {
  [Conference.Eastern]: [Division.Atlantic, Division.Metropolitan],
  [Conference.Western]: [Division.Central, Division.Pacific],
};

function selectConference(conf: Conference | 'all') {
  activeConference.value = conf;
  activeDivision.value = null;
}

function selectDivision(div: Division) {
  activeDivision.value = activeDivision.value === div ? null : div;
}

const filteredTeams = computed(() => {
  let teams = enrichedTeams.value;

  const q = search.value.toLowerCase();
  if (q) {
    teams = teams.filter(
      (t) => t.fullName.toLowerCase().includes(q) || t.triCode.toLowerCase().includes(q),
    );
  }

  if (activeConference.value !== 'all') {
    teams = teams.filter((t) => t.conferenceName === activeConference.value);
  }

  if (activeDivision.value) {
    teams = teams.filter((t) => t.divisionName === activeDivision.value);
  }

  return teams;
});
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div class="relative flex-1 max-w-xs">
        <input
          v-model="search"
          type="text"
          placeholder="Search teams..."
          class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
        />
      </div>

      <div class="flex gap-1">
        <button
          v-for="conf in conferences"
          :key="conf.value"
          class="px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
          :class="activeConference === conf.value
            ? 'bg-white text-gray-900'
            : 'text-gray-400 hover:text-white'"
          @click="selectConference(conf.value)"
        >
          {{ conf.label }}
        </button>
      </div>

      <div v-if="activeConference !== 'all'" class="flex gap-1">
        <button
          v-for="div in divisionsByConference[activeConference as Conference]"
          :key="div"
          class="px-3 py-1.5 text-xs rounded-md font-medium transition-colors border"
          :class="activeDivision === div
            ? 'border-gray-400 text-white'
            : 'border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'"
          @click="selectDivision(div)"
        >
          {{ div }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">
      {{ error.message }}
    </Message>

    <template v-else>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="team in filteredTeams"
          :key="team.id"
          class="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-800 bg-gray-900 transition-all hover:border-gray-600 cursor-pointer"
        >
          <img
            v-if="team.logo"
            :src="team.logo"
            :alt="team.fullName"
            class="w-20 h-20 object-contain"
          />
          <div class="text-center">
            <div class="font-semibold">{{ team.fullName }}</div>
            <div class="text-sm text-gray-400">{{ team.triCode }}</div>
            <div v-if="team.divisionName" class="text-xs text-gray-600 mt-0.5">
              {{ team.divisionName }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredTeams.length === 0" class="py-16 text-center text-gray-500 text-sm">
        No teams match "{{ search }}"
      </div>
    </template>
  </div>
</template>
