<script setup lang="ts">
import {
  useGetTeamQuery,
  useGetTeamRosterQuery,
  useGetTeamSkaterStatsQuery,
  useGetTeamGoalieStatsQuery,
  useGetTeamGamesQuery,
  useGetTeamStandingQuery,
} from '~/graphql/generated';

const route = useRoute();
const teamId = computed(() => Number(route.params.id));

const { result: teamResult, loading: teamLoading, error: teamError } = useGetTeamQuery({ id: teamId });
const { result: rosterResult } = useGetTeamRosterQuery({ teamId });
const { result: skaterStatsResult } = useGetTeamSkaterStatsQuery({ teamId });
const { result: goalieStatsResult } = useGetTeamGoalieStatsQuery({ teamId });
const { result: gamesResult } = useGetTeamGamesQuery({ teamId, limit: 20 });
const { result: standingResult } = useGetTeamStandingQuery({ teamId });

const team = computed(() => teamResult.value?.team);
const standing = computed(() => standingResult.value?.teamStanding);

const skaterStats = computed(() =>
  [...(skaterStatsResult.value?.teamSkaterStats ?? [])].sort((skaterA, skaterB) => skaterB.points - skaterA.points),
);

const goalieStats = computed(() =>
  [...(goalieStatsResult.value?.teamGoalieStats ?? [])].sort((goalieA, goalieB) => goalieB.wins - goalieA.wins),
);

type Tab = 'overview' | 'roster' | 'stats' | 'schedule';
const activeTab = ref<Tab>('overview');
</script>

<template>
  <div>
    <div v-if="teamLoading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="teamError" severity="error">{{ teamError.message }}</Message>

    <div v-else-if="!team" class="py-20 text-center text-gray-500">Team not found</div>

    <template v-else>
      <div class="flex items-center gap-5 mb-8">
        <img v-if="team.logo" :src="team.logo" :alt="team.fullName" class="w-16 h-16 object-contain" />
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-white tracking-tight leading-tight">{{ team.fullName }}</h1>
            <span class="text-sm text-gray-500 font-medium">{{ team.triCode }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="team.conferenceName" class="text-xs text-gray-600">{{ team.conferenceName }}</span>
            <span v-if="team.divisionName" class="text-xs text-gray-600">&middot; {{ team.divisionName }}</span>
          </div>
          <div v-if="standing" class="flex items-center gap-3 mt-1">
            <span v-if="standing.divisionRank" class="text-xs text-gray-400">{{ standing.divisionRank }}{{ ordinalSuffix(standing.divisionRank) }} in {{ standing.divisionName }}</span>
            <span v-if="standing.divisionRank" class="text-gray-700">|</span>
            <span class="text-sm text-white font-semibold tabular-nums">
              {{ standing.wins }}-{{ standing.losses }}-{{ standing.otLosses }}
            </span>
            <span class="text-sm text-gray-400 tabular-nums">{{ standing.points }} pts</span>
            <span v-if="standing.streakCode && standing.streakCount" class="text-xs tabular-nums" :class="standing.streakCode === 'W' ? 'text-result-win' : standing.streakCode === 'L' ? 'text-result-loss' : 'text-result-ot'">
              {{ standing.streakCode }}{{ standing.streakCount }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex border-b border-white/[0.08] mb-6">
        <button
          v-for="tab in (['overview', 'roster', 'stats', 'schedule'] as Tab[])"
          :key="tab"
          class="relative flex items-center gap-1.5 px-5 py-3 text-[0.8rem] font-medium capitalize bg-transparent border-0 cursor-pointer tracking-tight transition-colors"
          :class="activeTab === tab ? 'text-white after:absolute after:bottom-[-1px] after:left-3 after:right-3 after:h-0.5 after:bg-white after:rounded-t-sm' : 'text-gray-500 hover:text-gray-300'"
          @click="activeTab = tab"
        >
          {{ tab }}
          <span
            v-if="tab === 'roster'"
            class="text-[0.65rem] tabular-nums rounded-lg px-1.5 py-px"
            :class="activeTab === tab ? 'text-gray-400 bg-white/10' : 'text-gray-600 bg-white/[0.06]'"
          >{{ rosterResult?.teamRoster?.length ?? 0 }}</span>
        </button>
      </div>

      <TeamOverview v-if="activeTab === 'overview'" :skaters="skaterStats" :goalies="goalieStats" :games="gamesResult?.teamGames ?? []" :team-id="teamId" />
      <TeamRoster v-else-if="activeTab === 'roster'" :players="rosterResult?.teamRoster ?? []" />
      <TeamStats v-else-if="activeTab === 'stats'" :skaters="skaterStats" :goalies="goalieStats" />
      <TeamSchedule v-else-if="activeTab === 'schedule'" :games="gamesResult?.teamGames ?? []" :team-id="teamId" />
    </template>
  </div>
</template>
