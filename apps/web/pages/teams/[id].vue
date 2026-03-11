<script setup lang="ts">
import {
  useGetTeamQuery,
  useGetTeamRosterQuery,
  useGetTeamSkaterStatsQuery,
  useGetTeamGoalieStatsQuery,
  useGetTeamGamesQuery,
  GameState,
  PositionCode,
} from '~/graphql/generated';

const route = useRoute();
const teamId = computed(() => Number(route.params.id));

const { result: teamResult, loading: teamLoading, error: teamError } = useGetTeamQuery({ id: teamId });
const { result: rosterResult } = useGetTeamRosterQuery({ teamId });
const { result: skaterStatsResult } = useGetTeamSkaterStatsQuery({ teamId });
const { result: goalieStatsResult } = useGetTeamGoalieStatsQuery({ teamId });
const { result: gamesResult } = useGetTeamGamesQuery({ teamId, limit: 20 });

const team = computed(() => teamResult.value?.team);

type Tab = 'roster' | 'stats' | 'schedule';
const activeTab = ref<Tab>('roster');

const positionGroups = [
  { label: 'Forwards', codes: [PositionCode.C, PositionCode.L, PositionCode.R] },
  { label: 'Defensemen', codes: [PositionCode.D] },
  { label: 'Goalies', codes: [PositionCode.G] },
];

const rosterByPosition = computed(() =>
  positionGroups.map((group) => ({
    ...group,
    players: (rosterResult.value?.teamRoster ?? [])
      .filter((p) => group.codes.includes(p.positionCode))
      .sort((a, b) => (a.sweaterNumber ?? 99) - (b.sweaterNumber ?? 99)),
  })),
);

const skaterStats = computed(() =>
  [...(skaterStatsResult.value?.teamSkaterStats ?? [])].sort((a, b) => b.points - a.points),
);

const goalieStats = computed(() =>
  [...(goalieStatsResult.value?.teamGoalieStats ?? [])].sort((a, b) => b.wins - a.wins),
);

const recentGames = computed(() =>
  (gamesResult.value?.teamGames ?? [])
    .filter((g) => g.gameState === GameState.Final || g.gameState === GameState.Off)
    .slice(0, 10),
);

const upcomingGames = computed(() =>
  (gamesResult.value?.teamGames ?? [])
    .filter((g) => g.gameState === GameState.Fut || g.gameState === GameState.Pre)
    .slice(0, 10),
);

function formatHeight(cm: number | null | undefined): string {
  if (!cm) return '—';
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
}

function formatToi(minutes: number | null | undefined): string {
  if (!minutes) return '—';
  const min = Math.floor(minutes);
  const sec = Math.round((minutes - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function formatPctg(pctg: number | null | undefined): string {
  if (pctg == null) return '—';
  return (pctg * 100).toFixed(1);
}

function gameResult(game: typeof recentGames.value[number]): { text: string; class: string } {
  const isHome = game.homeTeamId === teamId.value;
  const teamScore = isHome ? game.homeScore : game.awayScore;
  const oppScore = isHome ? game.awayScore : game.homeScore;
  if (teamScore == null || oppScore == null) return { text: '—', class: 'text-gray-500' };
  if (teamScore > oppScore) return { text: 'W', class: 'text-green-400 font-semibold' };
  return { text: 'L', class: 'text-red-400 font-semibold' };
}

function opponentInfo(game: typeof recentGames.value[number]) {
  const isHome = game.homeTeamId === teamId.value;
  return {
    name: isHome ? game.awayTeamName : game.homeTeamName,
    logo: isHome ? game.awayTeamLogo : game.homeTeamLogo,
    prefix: isHome ? 'vs' : '@',
    teamScore: isHome ? game.homeScore : game.awayScore,
    oppScore: isHome ? game.awayScore : game.homeScore,
  };
}

function formatGameDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
</script>

<template>
  <div>
    <div v-if="teamLoading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="teamError" severity="error">{{ teamError.message }}</Message>

    <div v-else-if="!team" class="py-20 text-center text-gray-500">Team not found</div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-5 mb-8">
        <NuxtLink to="/teams" class="text-gray-500 hover:text-white transition-colors no-underline">
          <i class="pi pi-arrow-left text-sm" />
        </NuxtLink>
        <img v-if="team.logo" :src="team.logo" :alt="team.fullName" class="w-16 h-16 object-contain" />
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight leading-tight">{{ team.fullName }}</h1>
          <span class="text-sm text-gray-500 font-medium">{{ team.triCode }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-0.5 bg-gray-900 rounded-lg p-1 border border-gray-800 w-fit mb-6">
        <button
          v-for="tab in (['roster', 'stats', 'schedule'] as Tab[])"
          :key="tab"
          class="px-4 py-1.5 text-xs rounded-md font-medium capitalize transition-colors cursor-pointer border-0"
          :class="activeTab === tab
            ? 'bg-gray-700 text-white'
            : 'bg-transparent text-gray-500 hover:text-gray-300'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Roster Tab -->
      <div v-if="activeTab === 'roster'">
        <div v-for="group in rosterByPosition" :key="group.label" class="mb-6">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ group.label }}</h3>
          <div class="roster-table-wrap">
            <table class="roster-table">
              <thead>
                <tr>
                  <th class="w-8">#</th>
                  <th class="text-left">Player</th>
                  <th>POS</th>
                  <th>S/C</th>
                  <th>HT</th>
                  <th>WT</th>
                  <th>BORN</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in group.players" :key="p.id">
                  <td class="text-gray-500 font-medium">{{ p.sweaterNumber ?? '—' }}</td>
                  <td class="text-left">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="p.headshot"
                        :src="p.headshot"
                        :alt="`${p.firstName} ${p.lastName}`"
                        class="w-7 h-7 rounded-full object-cover bg-gray-800"
                      />
                      <span class="text-white font-medium">{{ p.firstName }} {{ p.lastName }}</span>
                    </div>
                  </td>
                  <td class="text-gray-400">{{ p.positionCode }}</td>
                  <td class="text-gray-400">{{ p.shootsCatches ?? '—' }}</td>
                  <td class="text-gray-400">{{ formatHeight(p.heightCm) }}</td>
                  <td class="text-gray-400">{{ p.weightKg ? `${p.weightKg} kg` : '—' }}</td>
                  <td class="text-gray-500 text-xs">{{ p.birthCountry ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Stats Tab -->
      <div v-else-if="activeTab === 'stats'">
        <!-- Skaters -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skaters</h3>
        <div class="roster-table-wrap mb-6">
          <table class="roster-table">
            <thead>
              <tr>
                <th class="text-left">Player</th>
                <th>POS</th>
                <th>GP</th>
                <th>G</th>
                <th>A</th>
                <th class="text-white">PTS</th>
                <th>+/-</th>
                <th>PIM</th>
                <th>PPG</th>
                <th>SHG</th>
                <th>GWG</th>
                <th>S</th>
                <th>S%</th>
                <th>TOI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in skaterStats" :key="s.playerId">
                <td class="text-left">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="s.headshot"
                      :src="s.headshot"
                      :alt="`${s.firstName} ${s.lastName}`"
                      class="w-6 h-6 rounded-full object-cover bg-gray-800"
                    />
                    <span class="text-white font-medium">{{ s.firstName[0] }}. {{ s.lastName }}</span>
                  </div>
                </td>
                <td class="text-gray-500 text-xs">{{ s.positionCode }}</td>
                <td>{{ s.gamesPlayed }}</td>
                <td>{{ s.goals }}</td>
                <td>{{ s.assists }}</td>
                <td class="text-white font-bold">{{ s.points }}</td>
                <td :class="s.plusMinus > 0 ? 'text-green-400' : s.plusMinus < 0 ? 'text-red-400' : ''">
                  {{ s.plusMinus > 0 ? '+' : '' }}{{ s.plusMinus }}
                </td>
                <td>{{ s.penaltyMinutes }}</td>
                <td>{{ s.powerPlayGoals }}</td>
                <td>{{ s.shorthandedGoals }}</td>
                <td>{{ s.gameWinningGoals }}</td>
                <td>{{ s.shots }}</td>
                <td>{{ formatPctg(s.shootingPctg) }}</td>
                <td>{{ formatToi(s.avgTimeOnIce) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Goalies -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Goalies</h3>
        <div class="roster-table-wrap">
          <table class="roster-table">
            <thead>
              <tr>
                <th class="text-left">Player</th>
                <th>GP</th>
                <th>GS</th>
                <th class="text-white">W</th>
                <th>L</th>
                <th>OTL</th>
                <th>GAA</th>
                <th class="text-white">SV%</th>
                <th>SO</th>
                <th>SA</th>
                <th>SV</th>
                <th>GA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in goalieStats" :key="g.playerId">
                <td class="text-left">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="g.headshot"
                      :src="g.headshot"
                      :alt="`${g.firstName} ${g.lastName}`"
                      class="w-6 h-6 rounded-full object-cover bg-gray-800"
                    />
                    <span class="text-white font-medium">{{ g.firstName[0] }}. {{ g.lastName }}</span>
                  </div>
                </td>
                <td>{{ g.gamesPlayed }}</td>
                <td>{{ g.gamesStarted }}</td>
                <td class="text-white font-bold">{{ g.wins }}</td>
                <td>{{ g.losses }}</td>
                <td>{{ g.otLosses }}</td>
                <td>{{ g.goalsAgainstAvg?.toFixed(2) ?? '—' }}</td>
                <td class="text-white font-bold">{{ g.savePctg ? `.${(g.savePctg * 1000).toFixed(0)}` : '—' }}</td>
                <td>{{ g.shutouts }}</td>
                <td>{{ g.shotsAgainst }}</td>
                <td>{{ g.saves }}</td>
                <td>{{ g.goalsAgainst }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Schedule Tab -->
      <div v-else-if="activeTab === 'schedule'">
        <!-- Recent Results -->
        <div v-if="recentGames.length" class="mb-8">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Results</h3>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="game in recentGames"
              :key="game.id"
              class="game-row"
            >
              <span class="text-xs text-gray-600 w-16 shrink-0 tabular-nums">{{ formatGameDate(game.gameDate) }}</span>
              <span :class="gameResult(game).class" class="w-5 text-center text-xs">{{ gameResult(game).text }}</span>
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-gray-600 text-xs w-4 text-right">{{ opponentInfo(game).prefix }}</span>
                <img
                  v-if="opponentInfo(game).logo"
                  :src="opponentInfo(game).logo!"
                  :alt="opponentInfo(game).name ?? ''"
                  class="w-5 h-5 object-contain shrink-0"
                />
                <span class="text-gray-300 text-sm truncate">{{ opponentInfo(game).name }}</span>
              </div>
              <span class="text-sm tabular-nums font-medium text-gray-300">
                {{ opponentInfo(game).teamScore }}–{{ opponentInfo(game).oppScore }}
              </span>
            </div>
          </div>
        </div>

        <!-- Upcoming -->
        <div v-if="upcomingGames.length">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming</h3>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="game in upcomingGames"
              :key="game.id"
              class="game-row"
            >
              <span class="text-xs text-gray-600 w-16 shrink-0 tabular-nums">{{ formatGameDate(game.gameDate) }}</span>
              <div class="flex items-center gap-2 flex-1 min-w-0 ml-5">
                <span class="text-gray-600 text-xs w-4 text-right">{{ opponentInfo(game).prefix }}</span>
                <img
                  v-if="opponentInfo(game).logo"
                  :src="opponentInfo(game).logo!"
                  :alt="opponentInfo(game).name ?? ''"
                  class="w-5 h-5 object-contain shrink-0"
                />
                <span class="text-gray-300 text-sm truncate">{{ opponentInfo(game).name }}</span>
              </div>
              <span v-if="game.venue" class="text-xs text-gray-600 hidden sm:block">{{ game.venue }}</span>
            </div>
          </div>
        </div>

        <div v-if="!recentGames.length && !upcomingGames.length" class="py-16 text-center text-gray-500 text-sm">
          No games available
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.roster-table-wrap {
  background: rgb(17 17 27);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  overflow-x: auto;
}

.roster-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.roster-table thead th {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgb(107 114 128);
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.5rem 0.5rem;
  text-align: center;
  white-space: nowrap;
}

.roster-table tbody tr {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.12s;
}

.roster-table tbody tr:first-child {
  border-top: none;
}

.roster-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.roster-table tbody td {
  padding: 0.4rem 0.5rem;
  color: rgb(156 163 175);
  font-variant-numeric: tabular-nums;
  text-align: center;
  white-space: nowrap;
}

.game-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgb(17 17 27);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: background 0.12s;
}

.game-row:hover {
  background: rgba(255, 255, 255, 0.03);
}
</style>
