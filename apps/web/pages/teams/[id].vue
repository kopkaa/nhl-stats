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
      .filter((player) => group.codes.includes(player.positionCode))
      .sort((playerA, playerB) => (playerA.sweaterNumber ?? 99) - (playerB.sweaterNumber ?? 99)),
  })),
);

const skaterStats = computed(() =>
  [...(skaterStatsResult.value?.teamSkaterStats ?? [])].sort((skaterA, skaterB) => skaterB.points - skaterA.points),
);

const goalieStats = computed(() =>
  [...(goalieStatsResult.value?.teamGoalieStats ?? [])].sort((goalieA, goalieB) => goalieB.wins - goalieA.wins),
);

const recentGames = computed(() =>
  (gamesResult.value?.teamGames ?? [])
    .filter((game) => game.gameState === GameState.Final || game.gameState === GameState.Off)
    .slice(0, 10),
);

const upcomingGames = computed(() =>
  (gamesResult.value?.teamGames ?? [])
    .filter((game) => game.gameState === GameState.Fut || game.gameState === GameState.Pre)
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
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
<img v-if="team.logo" :src="team.logo" :alt="team.fullName" class="w-16 h-16 object-contain" />
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight leading-tight">{{ team.fullName }}</h1>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 font-medium">{{ team.triCode }}</span>
            <span v-if="team.conferenceName" class="text-xs text-gray-600">&middot; {{ team.conferenceName }}</span>
            <span v-if="team.divisionName" class="text-xs text-gray-600">&middot; {{ team.divisionName }}</span>
          </div>
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
          <div class="team-table-wrap">
            <DataTable :value="group.players" size="small" class="team-dt">
              <Column field="sweaterNumber" header="#" sortable>
                <template #body="{ data: player }">
                  <span class="text-gray-500 font-medium">{{ player.sweaterNumber ?? '—' }}</span>
                </template>
              </Column>

              <Column field="lastName" header="Player" sortable>
                <template #body="{ data: player }">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="player.headshot"
                      :src="player.headshot"
                      :alt="`${player.firstName} ${player.lastName}`"
                      class="w-7 h-7 rounded-full object-cover bg-gray-800"
                    />
                    <span class="text-white font-medium">{{ player.firstName }} {{ player.lastName }}</span>
                  </div>
                </template>
              </Column>

              <Column field="positionCode" header="POS" sortable>
                <template #body="{ data: player }">
                  <span class="text-gray-400">{{ player.positionCode }}</span>
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

      <!-- Stats Tab -->
      <div v-else-if="activeTab === 'stats'">
        <!-- Skaters -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skaters</h3>
        <div class="team-table-wrap mb-6">
          <DataTable :value="skaterStats" size="small" class="team-dt team-dt--stats">
            <Column field="lastName" header="Player" sortable>
              <template #body="{ data: skater }">
                <div class="flex items-center gap-2">
                  <img
                    v-if="skater.headshot"
                    :src="skater.headshot"
                    :alt="`${skater.firstName} ${skater.lastName}`"
                    class="w-6 h-6 rounded-full object-cover bg-gray-800"
                  />
                  <span class="text-white font-medium">{{ skater.firstName[0] }}. {{ skater.lastName }}</span>
                </div>
              </template>
            </Column>

            <Column field="positionCode" header="POS" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-500 text-xs">{{ skater.positionCode }}</span>
              </template>
            </Column>

            <Column field="gamesPlayed" header="GP" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.gamesPlayed }}</span>
              </template>
            </Column>

            <Column field="goals" header="G" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.goals }}</span>
              </template>
            </Column>

            <Column field="assists" header="A" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.assists }}</span>
              </template>
            </Column>

            <Column field="points" header="PTS" sortable>
              <template #body="{ data: skater }">
                <span class="text-white font-bold tabular-nums">{{ skater.points }}</span>
              </template>
            </Column>

            <Column field="plusMinus" header="+/-" sortable>
              <template #body="{ data: skater }">
                <span
                  :class="skater.plusMinus > 0 ? 'text-green-400' : skater.plusMinus < 0 ? 'text-red-400' : ''"
                  class="tabular-nums"
                >
                  {{ skater.plusMinus > 0 ? '+' : '' }}{{ skater.plusMinus }}
                </span>
              </template>
            </Column>

            <Column field="penaltyMinutes" header="PIM" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.penaltyMinutes }}</span>
              </template>
            </Column>

            <Column field="powerPlayGoals" header="PPG" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.powerPlayGoals }}</span>
              </template>
            </Column>

            <Column field="shorthandedGoals" header="SHG" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.shorthandedGoals }}</span>
              </template>
            </Column>

            <Column field="gameWinningGoals" header="GWG" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.gameWinningGoals }}</span>
              </template>
            </Column>

            <Column field="shots" header="S" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ skater.shots }}</span>
              </template>
            </Column>

            <Column field="shootingPctg" header="S%" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ formatPctg(skater.shootingPctg) }}</span>
              </template>
            </Column>

            <Column field="avgTimeOnIce" header="TOI" sortable>
              <template #body="{ data: skater }">
                <span class="text-gray-400 tabular-nums">{{ formatToi(skater.avgTimeOnIce) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Goalies -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Goalies</h3>
        <div class="team-table-wrap">
          <DataTable :value="goalieStats" size="small" class="team-dt team-dt--stats">
            <Column field="lastName" header="Player" sortable>
              <template #body="{ data: goalie }">
                <div class="flex items-center gap-2">
                  <img
                    v-if="goalie.headshot"
                    :src="goalie.headshot"
                    :alt="`${goalie.firstName} ${goalie.lastName}`"
                    class="w-6 h-6 rounded-full object-cover bg-gray-800"
                  />
                  <span class="text-white font-medium">{{ goalie.firstName[0] }}. {{ goalie.lastName }}</span>
                </div>
              </template>
            </Column>

            <Column field="gamesPlayed" header="GP" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.gamesPlayed }}</span>
              </template>
            </Column>

            <Column field="gamesStarted" header="GS" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.gamesStarted }}</span>
              </template>
            </Column>

            <Column field="wins" header="W" sortable>
              <template #body="{ data: goalie }">
                <span class="text-white font-bold tabular-nums">{{ goalie.wins }}</span>
              </template>
            </Column>

            <Column field="losses" header="L" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.losses }}</span>
              </template>
            </Column>

            <Column field="otLosses" header="OTL" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.otLosses }}</span>
              </template>
            </Column>

            <Column field="goalsAgainstAvg" header="GAA" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.goalsAgainstAvg?.toFixed(2) ?? '—' }}</span>
              </template>
            </Column>

            <Column field="savePctg" header="SV%" sortable>
              <template #body="{ data: goalie }">
                <span class="text-white font-bold tabular-nums">{{ goalie.savePctg ? `.${(goalie.savePctg * 1000).toFixed(0)}` : '—' }}</span>
              </template>
            </Column>

            <Column field="shutouts" header="SO" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.shutouts }}</span>
              </template>
            </Column>

            <Column field="shotsAgainst" header="SA" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.shotsAgainst }}</span>
              </template>
            </Column>

            <Column field="saves" header="SV" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.saves }}</span>
              </template>
            </Column>

            <Column field="goalsAgainst" header="GA" sortable>
              <template #body="{ data: goalie }">
                <span class="text-gray-400 tabular-nums">{{ goalie.goalsAgainst }}</span>
              </template>
            </Column>
          </DataTable>
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
.team-table-wrap {
  background: rgb(17 17 27);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  overflow: hidden;
}

.team-dt :deep(.p-datatable-table-container) {
  overflow-x: auto;
}

.team-dt :deep(.p-datatable-table) {
  border-collapse: collapse;
  width: 100%;
}

.team-dt :deep(th),
.team-dt :deep(td) {
  overflow: hidden;
  white-space: nowrap;
}

.team-dt :deep(.p-datatable-thead > tr > th) {
  background: transparent;
  border: none;
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

.team-dt :deep(.p-datatable-thead > tr > th:nth-child(2)) {
  text-align: left;
  width: 35%;
}

.team-dt :deep(.p-datatable-sort-icon) {
  width: 0.6rem !important;
  height: 0.6rem !important;
  margin-left: 2px;
}

.team-dt :deep(.p-datatable-column-header-content) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.team-dt :deep(.p-datatable-thead > tr > th:nth-child(2) .p-datatable-column-header-content) {
  justify-content: flex-start;
}

.team-dt :deep(.p-datatable-thead > tr > th.p-datatable-sortable-column:hover) {
  background: transparent;
  color: rgb(209 213 219);
}

.team-dt :deep(.p-datatable-thead > tr > th.p-datatable-column-sorted) {
  background: transparent;
  color: white;
}

.team-dt :deep(.p-datatable-tbody > tr) {
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.12s;
}

.team-dt :deep(.p-datatable-tbody > tr:first-child) {
  border-top: none;
}

.team-dt :deep(.p-datatable-tbody > tr:last-child) {
  border-bottom: none;
}

.team-dt :deep(.p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.03);
}

.team-dt :deep(.p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.4rem 0.5rem;
  color: rgb(156 163 175);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
  white-space: nowrap;
}

.team-dt :deep(.p-datatable-tbody > tr > td:nth-child(2)) {
  text-align: left;
}

.team-dt--stats :deep(.p-datatable-thead > tr > th:nth-child(1)) {
  text-align: left;
  width: 20%;
}

.team-dt--stats :deep(.p-datatable-thead > tr > th:nth-child(2)) {
  text-align: center;
  width: auto;
}

.team-dt--stats :deep(.p-datatable-thead > tr > th:nth-child(1) .p-datatable-column-header-content) {
  justify-content: flex-start;
}

.team-dt--stats :deep(.p-datatable-thead > tr > th:nth-child(2) .p-datatable-column-header-content) {
  justify-content: center;
}

.team-dt--stats :deep(.p-datatable-tbody > tr > td:nth-child(1)) {
  text-align: left;
}

.team-dt--stats :deep(.p-datatable-tbody > tr > td:nth-child(2)) {
  text-align: center;
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
