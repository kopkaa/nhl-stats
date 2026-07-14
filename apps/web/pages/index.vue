<script setup lang="ts">
import {
  Conference,
  GameState,
  useGetGamesTodayQuery,
  useGetSkaterLeadersQuery,
  useGetStandingsQuery,
} from '~/graphql/generated';

const LIVE_POLL_MS = 20000;
const MINI_STANDINGS_SPOTS = 5;
const LEADER_COUNT = 5;

const pollInterval = ref(0);

const { result: gamesResult, loading: gamesLoading } = useGetGamesTodayQuery(
  {},
  () => ({ pollInterval: pollInterval.value }),
);

const games = computed(() => gamesResult.value?.gamesToday ?? []);

const hasLiveGame = computed(() =>
  games.value.some((game) => [GameState.Live, GameState.Crit].includes(game.gameState)),
);

watchEffect(() => {
  pollInterval.value = hasLiveGame.value ? LIVE_POLL_MS : 0;
});

const { result: leadersResult } = useGetSkaterLeadersQuery({ limit: LEADER_COUNT });
const pointLeaders = computed(() => leadersResult.value?.skaterLeaders.points ?? []);

const { result: standingsResult } = useGetStandingsQuery({});

const conferenceTables = computed(() => {
  const standings = standingsResult.value?.standings ?? [];

  return [Conference.Eastern, Conference.Western].map((conference) => ({
    conference,
    teams: standings
      .filter((standing) => standing.conferenceName === conference)
      .sort((teamA, teamB) => teamA.conferenceRank - teamB.conferenceRank)
      .slice(0, MINI_STANDINGS_SPOTS),
  }));
});
</script>

<template>
  <div class="flex flex-col gap-8">
    <section>
      <div class="flex items-baseline justify-between mb-3">
        <h1 class="text-sm font-semibold text-white uppercase tracking-wide">Today</h1>
        <NuxtLink
          to="/games"
          class="text-[0.75rem] text-gray-500 no-underline hover:text-gray-300 transition-colors"
        >
          All games
        </NuxtLink>
      </div>

      <div v-if="gamesLoading && !games.length" class="flex justify-center py-12">
        <ProgressSpinner />
      </div>

      <div
        v-else-if="!games.length"
        class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md py-12 text-center"
      >
        <p class="text-sm text-gray-400">No games today</p>
        <p class="text-[0.75rem] text-gray-600 mt-1">The season is over — see you in October.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <GameCard v-for="game in games" :key="game.id" :game="game" />
      </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-sm font-semibold text-white uppercase tracking-wide">Points</h2>
          <NuxtLink
            to="/leaders"
            class="text-[0.75rem] text-gray-500 no-underline hover:text-gray-300 transition-colors"
          >
            All leaders
          </NuxtLink>
        </div>

        <div class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md">
          <NuxtLink
            v-for="(leader, index) in pointLeaders"
            :key="leader.playerId"
            :to="`/players/${leader.playerId}`"
            class="flex items-center gap-3 px-3 py-2 no-underline border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.03]"
          >
            <span class="text-[0.7rem] text-gray-600 tabular-nums w-4">{{ index + 1 }}</span>
            <img
              v-if="leader.headshot"
              :src="leader.headshot"
              :alt="`${leader.firstName} ${leader.lastName}`"
              class="w-8 h-8 rounded-full object-cover bg-gray-800 shrink-0"
            />
            <div class="min-w-0 flex-1">
              <div class="text-sm text-gray-200 truncate">
                {{ leader.firstName }} {{ leader.lastName }}
              </div>
              <div class="text-[0.7rem] text-gray-600 truncate">
                {{ leader.positionCode }} · {{ leader.teamName }}
              </div>
            </div>
            <img
              v-if="leader.teamLogo"
              :src="leader.teamLogo"
              :alt="leader.teamName ?? ''"
              class="w-5 h-5 object-contain shrink-0"
            />
            <span class="text-sm font-bold text-white tabular-nums w-8 text-right">
              {{ leader.value }}
            </span>
          </NuxtLink>
        </div>
      </section>

      <section>
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-sm font-semibold text-white uppercase tracking-wide">Standings</h2>
          <NuxtLink
            to="/standings"
            class="text-[0.75rem] text-gray-500 no-underline hover:text-gray-300 transition-colors"
          >
            Full table
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="table in conferenceTables"
            :key="table.conference"
            class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md"
          >
            <div
              class="px-3 py-1.5 border-b border-white/[0.06] text-[0.65rem] font-semibold text-gray-500 uppercase tracking-wide"
            >
              {{ table.conference }}
            </div>
            <NuxtLink
              v-for="team in table.teams"
              :key="team.teamId"
              :to="`/teams/${team.teamId}`"
              class="flex items-center gap-2 px-3 py-1.5 no-underline border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.03]"
            >
              <span class="text-[0.7rem] text-gray-600 tabular-nums w-3">
                {{ team.conferenceRank }}
              </span>
              <img
                v-if="team.teamLogo"
                :src="team.teamLogo"
                :alt="team.teamName ?? ''"
                class="w-5 h-5 object-contain shrink-0"
              />
              <span class="flex-1 text-[0.8rem] text-gray-300 truncate">{{ team.teamName }}</span>
              <span class="text-[0.8rem] font-semibold text-white tabular-nums">
                {{ team.points }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
