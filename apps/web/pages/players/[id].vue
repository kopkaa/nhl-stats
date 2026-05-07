<script setup lang="ts">
import { PositionCode } from '~/graphql/generated';
import {
  useGetPlayerQuery,
  useGetPlayerSkaterStatsQuery,
  useGetPlayerGoalieStatsQuery,
  useGetPlayerGameLogQuery,
} from '~/graphql/generated';

const route = useRoute();
const playerId = computed(() => Number(route.params.id));

const { result: playerResult, loading, error } = useGetPlayerQuery({ id: playerId });

const player = computed(() => playerResult.value?.player);
const isGoalie = computed(() => player.value?.positionCode === PositionCode.G);

const { result: skaterStatsResult } = useGetPlayerSkaterStatsQuery(
  { playerId },
  { enabled: computed(() => !!player.value && !isGoalie.value) },
);

const { result: goalieStatsResult } = useGetPlayerGoalieStatsQuery(
  { playerId },
  { enabled: computed(() => !!player.value && isGoalie.value) },
);

const { result: gameLogResult } = useGetPlayerGameLogQuery({ playerId, limit: 10 });

const skaterStats = computed(() => skaterStatsResult.value?.playerSkaterStats ?? []);
const goalieStats = computed(() => goalieStatsResult.value?.playerGoalieStats ?? []);
const gameLog = computed(() => gameLogResult.value?.playerGameLog ?? []);

const age = computed(() => {
  if (!player.value?.birthDate) return null;
  const birth = new Date(player.value.birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years--;
  return years;
});

type Tab = 'stats' | 'games';
const activeTab = ref<Tab>('stats');

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
  <div>
    <div v-if="loading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">{{ error.message }}</Message>

    <div v-else-if="!player" class="py-20 text-center text-gray-500">Player not found</div>

    <template v-else>
      <!-- Header -->
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

      <!-- Tabs -->
      <div class="flex border-b border-white/[0.08] mb-6">
        <button
          v-for="tab in (['stats', 'games'] as Tab[])"
          :key="tab"
          class="relative flex items-center gap-1.5 px-5 py-3 text-[0.8rem] font-medium capitalize bg-transparent border-0 cursor-pointer tracking-tight transition-colors"
          :class="activeTab === tab ? 'text-white after:absolute after:bottom-[-1px] after:left-3 after:right-3 after:h-0.5 after:bg-white after:rounded-t-sm' : 'text-gray-500 hover:text-gray-300'"
          @click="activeTab = tab"
        >
          {{ tab === 'games' ? 'Last 10 Games' : 'Season Stats' }}
        </button>
      </div>

      <!-- Season Stats -->
      <template v-if="activeTab === 'stats'">
        <!-- Skater stats -->
        <template v-if="!isGoalie">
          <div v-if="skaterStats.length" class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
            <DataTable :value="skaterStats" size="small" class="nhl-dt">
              <Column field="season" header="Season">
                <template #body="{ data: stat }">
                  <span class="text-gray-300 font-medium tabular-nums">{{ stat.season }}</span>
                </template>
              </Column>
              <Column field="gamesPlayed" header="GP" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.gamesPlayed }}</span>
                </template>
              </Column>
              <Column field="goals" header="G" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.goals }}</span>
                </template>
              </Column>
              <Column field="assists" header="A" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.assists }}</span>
                </template>
              </Column>
              <Column field="points" header="PTS" sortable>
                <template #body="{ data: stat }">
                  <span class="text-white font-bold tabular-nums">{{ stat.points }}</span>
                </template>
              </Column>
              <Column field="plusMinus" header="+/-" sortable>
                <template #body="{ data: stat }">
                  <span
                    class="tabular-nums"
                    :class="stat.plusMinus > 0 ? 'text-result-win' : stat.plusMinus < 0 ? 'text-result-loss' : 'text-gray-400'"
                  >{{ stat.plusMinus > 0 ? '+' : '' }}{{ stat.plusMinus }}</span>
                </template>
              </Column>
              <Column field="penaltyMinutes" header="PIM" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.penaltyMinutes }}</span>
                </template>
              </Column>
              <Column field="powerPlayGoals" header="PPG" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.powerPlayGoals }}</span>
                </template>
              </Column>
              <Column field="shorthandedGoals" header="SHG" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.shorthandedGoals }}</span>
                </template>
              </Column>
              <Column field="gameWinningGoals" header="GWG" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.gameWinningGoals }}</span>
                </template>
              </Column>
              <Column field="shots" header="S" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.shots }}</span>
                </template>
              </Column>
              <Column field="shootingPctg" header="S%" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ formatPctg(stat.shootingPctg) }}</span>
                </template>
              </Column>
              <Column field="avgTimeOnIce" header="TOI" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ formatToi(stat.avgTimeOnIce) }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else class="py-12 text-center text-gray-600 text-sm">No season stats available</div>
        </template>

        <!-- Goalie stats -->
        <template v-else>
          <div v-if="goalieStats.length" class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
            <DataTable :value="goalieStats" size="small" class="nhl-dt">
              <Column field="season" header="Season">
                <template #body="{ data: stat }">
                  <span class="text-gray-300 font-medium tabular-nums">{{ stat.season }}</span>
                </template>
              </Column>
              <Column field="gamesPlayed" header="GP" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.gamesPlayed }}</span>
                </template>
              </Column>
              <Column field="gamesStarted" header="GS" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.gamesStarted }}</span>
                </template>
              </Column>
              <Column field="wins" header="W" sortable>
                <template #body="{ data: stat }">
                  <span class="text-white font-bold tabular-nums">{{ stat.wins }}</span>
                </template>
              </Column>
              <Column field="losses" header="L" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.losses }}</span>
                </template>
              </Column>
              <Column field="otLosses" header="OTL" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.otLosses }}</span>
                </template>
              </Column>
              <Column field="goalsAgainstAvg" header="GAA" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.goalsAgainstAvg?.toFixed(2) ?? '—' }}</span>
                </template>
              </Column>
              <Column field="savePctg" header="SV%" sortable>
                <template #body="{ data: stat }">
                  <span class="text-white font-bold tabular-nums">{{ stat.savePctg ? `.${(stat.savePctg * 1000).toFixed(0)}` : '—' }}</span>
                </template>
              </Column>
              <Column field="shutouts" header="SO" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.shutouts }}</span>
                </template>
              </Column>
              <Column field="shotsAgainst" header="SA" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.shotsAgainst }}</span>
                </template>
              </Column>
              <Column field="saves" header="SV" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.saves }}</span>
                </template>
              </Column>
              <Column field="goalsAgainst" header="GA" sortable>
                <template #body="{ data: stat }">
                  <span class="text-gray-400 tabular-nums">{{ stat.goalsAgainst }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else class="py-12 text-center text-gray-600 text-sm">No season stats available</div>
        </template>
      </template>

      <!-- Game Log -->
      <template v-else-if="activeTab === 'games'">
        <div v-if="gameLog.length" class="bg-[rgb(17_17_27)] border border-white/[0.07] rounded-lg overflow-hidden">
          <DataTable :value="gameLog" size="small" class="nhl-dt">
            <Column field="gameDate" header="Date">
              <template #body="{ data: entry }">
                <span class="text-gray-400 tabular-nums text-xs">{{ formatGameDate(entry.gameDate) }}</span>
              </template>
            </Column>
            <Column field="opponentAbbrev" header="Opp">
              <template #body="{ data: entry }">
                <span class="text-gray-300 font-medium tracking-tight">
                  <span class="text-gray-600 text-xs mr-0.5">{{ entry.homeRoadFlag === 'H' ? 'vs' : '@' }}</span>
                  {{ entry.opponentAbbrev }}
                </span>
              </template>
            </Column>

            <!-- Skater columns -->
            <template v-if="!isGoalie">
              <Column field="goals" header="G">
                <template #body="{ data: entry }">
                  <span :class="(entry.goals ?? 0) > 0 ? 'text-white font-bold' : 'text-gray-500'" class="tabular-nums">{{ entry.goals ?? 0 }}</span>
                </template>
              </Column>
              <Column field="assists" header="A">
                <template #body="{ data: entry }">
                  <span :class="(entry.assists ?? 0) > 0 ? 'text-white font-bold' : 'text-gray-500'" class="tabular-nums">{{ entry.assists ?? 0 }}</span>
                </template>
              </Column>
              <Column field="points" header="PTS">
                <template #body="{ data: entry }">
                  <span :class="(entry.points ?? 0) > 0 ? 'text-white font-bold' : 'text-gray-500'" class="tabular-nums">{{ entry.points ?? 0 }}</span>
                </template>
              </Column>
              <Column field="plusMinus" header="+/-">
                <template #body="{ data: entry }">
                  <span
                    class="tabular-nums"
                    :class="(entry.plusMinus ?? 0) > 0 ? 'text-result-win' : (entry.plusMinus ?? 0) < 0 ? 'text-result-loss' : 'text-gray-500'"
                  >{{ (entry.plusMinus ?? 0) > 0 ? '+' : '' }}{{ entry.plusMinus ?? 0 }}</span>
                </template>
              </Column>
              <Column field="shots" header="S">
                <template #body="{ data: entry }">
                  <span class="text-gray-400 tabular-nums">{{ entry.shots ?? 0 }}</span>
                </template>
              </Column>
              <Column field="pim" header="PIM">
                <template #body="{ data: entry }">
                  <span class="text-gray-500 tabular-nums">{{ entry.pim ?? 0 }}</span>
                </template>
              </Column>
            </template>

            <!-- Goalie columns -->
            <template v-else>
              <Column field="decision" header="DEC">
                <template #body="{ data: entry }">
                  <span
                    class="text-xs font-bold tabular-nums"
                    :class="entry.decision === 'W' ? 'text-result-win' : entry.decision === 'L' ? 'text-result-loss' : 'text-result-ot'"
                  >{{ entry.decision ?? '—' }}</span>
                </template>
              </Column>
              <Column field="shotsAgainst" header="SA">
                <template #body="{ data: entry }">
                  <span class="text-gray-400 tabular-nums">{{ entry.shotsAgainst ?? '—' }}</span>
                </template>
              </Column>
              <Column field="saves" header="SV">
                <template #body="{ data: entry }">
                  <span class="text-gray-400 tabular-nums">{{ entry.saves ?? '—' }}</span>
                </template>
              </Column>
              <Column field="goalsAgainst" header="GA">
                <template #body="{ data: entry }">
                  <span class="text-gray-400 tabular-nums">{{ entry.goalsAgainst ?? '—' }}</span>
                </template>
              </Column>
              <Column field="savePctg" header="SV%">
                <template #body="{ data: entry }">
                  <span class="text-white font-bold tabular-nums">{{ entry.savePctg ? `.${(entry.savePctg * 1000).toFixed(0)}` : '—' }}</span>
                </template>
              </Column>
            </template>

            <Column field="toi" header="TOI">
              <template #body="{ data: entry }">
                <span class="text-gray-400 tabular-nums">{{ entry.toi ?? '—' }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
        <div v-else class="py-12 text-center text-gray-600 text-sm">No game log available</div>
      </template>
    </template>
  </div>
</template>
