<script setup lang="ts">
import { useGetTeamsQuery } from '~/graphql/generated';
import { Conference, Division } from '@nhl-app/shared';

const { result, loading, error } = useGetTeamsQuery();

const teams = computed(() => result.value?.teams ?? []);

const search = ref('');
const activeConference = ref<Conference | 'all'>('all');
const activeDivision = ref<Division | null>(null);

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
  let filtered = teams.value;

  const q = search.value.toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (team) => team.fullName.toLowerCase().includes(q) || team.triCode.toLowerCase().includes(q),
    );
  }

  if (activeConference.value !== 'all') {
    filtered = filtered.filter((team) => team.conferenceName === activeConference.value);
  }

  if (activeDivision.value) {
    filtered = filtered.filter((team) => team.divisionName === activeDivision.value);
  }

  return filtered;
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
        <TeamCard
          v-for="team in filteredTeams"
          :key="team.id"
          :id="team.id"
          :full-name="team.fullName"
          :tri-code="team.triCode"
          :logo="team.logo"
          :division-name="team.divisionName"
        />
      </div>

      <div v-if="filteredTeams.length === 0" class="py-16 text-center text-gray-500 text-sm">
        No teams match "{{ search }}"
      </div>
    </template>
  </div>
</template>
