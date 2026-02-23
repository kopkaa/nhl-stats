<script setup lang="ts">
import { useGetStandingsQuery } from '~/graphql/generated';
import { Conference, Division, PLAYOFF_SPOTS_PER_CONFERENCE } from '~/constants/nhl';

const { result, loading, error } = useGetStandingsQuery({});

type Tab = 'conference' | 'division' | 'league';
const activeTab = ref<Tab>('league');

const allStandings = computed(() =>
  (result.value?.standings ?? []).map((team) => ({
    ...team,
    diff: team.goalsFor - team.goalsAgainst,
    streak: team.streakCode && team.streakCount ? `${team.streakCode}${team.streakCount}` : '—',
  })),
);

const eastern = computed(() =>
  allStandings.value
    .filter((t) => t.conferenceName === Conference.Eastern)
    .sort((a, b) => b.points - a.points),
);

const western = computed(() =>
  allStandings.value
    .filter((t) => t.conferenceName === Conference.Western)
    .sort((a, b) => b.points - a.points),
);

const leagueRanked = computed(() =>
  [...allStandings.value].sort((a, b) => b.points - a.points),
);

const divisions = computed(() => {
  const order = [Division.Atlantic, Division.Metropolitan, Division.Central, Division.Pacific];
  return order.map((div) => ({
    name: div,
    conference: [Division.Atlantic, Division.Metropolitan].includes(div)
      ? Conference.Eastern
      : Conference.Western,
    teams: allStandings.value
      .filter((t) => t.divisionName === div)
      .sort((a, b) => b.points - a.points),
  }));
});

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-white tracking-tight">Standings</h1>
      <div class="flex gap-0.5 bg-gray-900 rounded-lg p-1 border border-gray-800">
        <button
          v-for="tab in (['conference', 'division', 'league'] as Tab[])"
          :key="tab"
          class="px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-colors cursor-pointer border-0"
          :class="activeTab === tab
            ? 'bg-gray-700 text-white'
            : 'bg-transparent text-gray-500 hover:text-gray-300'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">{{ error.message }}</Message>

    <template v-else>
      <!-- Conference view: two tables side by side -->
      <div v-if="activeTab === 'conference'" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StandingsTable
          v-for="(teams, i) in [eastern, western]"
          :key="i"
          :teams="teams"
          :title="i === 0 ? 'Eastern Conference' : 'Western Conference'"
          :playoff-cutoff="PLAYOFF_SPOTS_PER_CONFERENCE"
          show-rank
        />
      </div>

      <!-- Division view: 4 tables 2x2 -->
      <div v-else-if="activeTab === 'division'" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StandingsTable
          v-for="div in divisions"
          :key="div.name"
          :teams="div.teams"
          :title="div.name + ' Division'"
          :subtitle="div.conference"
          show-rank
        />
      </div>

      <!-- League view: single full table -->
      <div v-else>
        <StandingsTable
          :teams="leagueRanked"
          title="League"
          :playoff-cutoff="32"
          show-conference
          show-rank
        />
      </div>
    </template>
  </div>
</template>
