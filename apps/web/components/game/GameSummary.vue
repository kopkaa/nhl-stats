<script setup lang="ts">
import type { GetGameDetailQuery } from '~/graphql/generated';

type GameDetail = GetGameDetailQuery['gameDetail'];
type ScoringPlay = GameDetail['scoring'][number];
type PenaltyCall = GameDetail['penalties'][number];

type TimelineEvent =
  | { kind: 'goal'; timeInPeriod: string; goal: ScoringPlay }
  | { kind: 'penalty'; timeInPeriod: string; penalty: PenaltyCall };

const props = defineProps<{ game: GameDetail }>();

const periods = computed(() => {
  const numbers = new Set<number>([
    ...props.game.scoring.map((goal) => goal.periodNumber),
    ...props.game.penalties.map((penalty) => penalty.periodNumber),
  ]);

  return [...numbers]
    .sort((left, right) => left - right)
    .map((periodNumber) => {
      const events: TimelineEvent[] = [
        ...props.game.scoring
          .filter((goal) => goal.periodNumber === periodNumber)
          .map((goal) => ({ kind: 'goal' as const, timeInPeriod: goal.timeInPeriod, goal })),
        ...props.game.penalties
          .filter((penalty) => penalty.periodNumber === periodNumber)
          .map((penalty) => ({
            kind: 'penalty' as const,
            timeInPeriod: penalty.timeInPeriod,
            penalty,
          })),
      ].sort((left, right) => left.timeInPeriod.localeCompare(right.timeInPeriod));

      const periodType =
        props.game.periods.find((period) => period.periodNumber === periodNumber)?.periodType ?? 'REG';

      return { periodNumber, periodType, events };
    });
});

function periodLabel(periodNumber: number, periodType: string): string {
  return periodType === 'REG' ? `${ordinalSuffix(periodNumber)} Period` : periodType;
}

function penaltyDesc(descKey: string): string {
  return descKey.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
</script>

<template>
  <div v-if="!periods.length" class="py-16 text-center text-gray-500 text-sm">
    No scoring or penalties
  </div>

  <div v-else class="flex flex-col gap-5">
    <section v-for="period in periods" :key="period.periodNumber">
      <h2 class="text-[0.7rem] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {{ periodLabel(period.periodNumber, period.periodType) }}
      </h2>

      <div class="bg-[rgb(17_17_27)] border border-white/[0.06] rounded-md">
        <div
          v-for="(event, index) in period.events"
          :key="index"
          class="flex items-start gap-3 px-3 py-2.5 border-b border-white/[0.04] last:border-b-0"
        >
          <span class="text-[0.7rem] text-gray-600 tabular-nums w-10 shrink-0 pt-0.5">
            {{ event.timeInPeriod }}
          </span>

          <template v-if="event.kind === 'goal'">
            <img
              v-if="event.goal.headshot"
              :src="event.goal.headshot"
              :alt="event.goal.scorerName"
              class="w-8 h-8 rounded-full object-cover bg-gray-800 shrink-0"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <NuxtLink
                  :to="`/players/${event.goal.playerId}`"
                  class="text-sm text-white font-semibold no-underline hover:underline"
                >
                  {{ event.goal.scorerName }}
                </NuxtLink>
                <span class="text-[0.65rem] text-gray-500 font-medium">{{ event.goal.teamAbbrev }}</span>
                <span
                  v-if="event.goal.strength && event.goal.strength !== 'ev'"
                  class="text-[0.6rem] font-bold uppercase px-1 py-px rounded-sm"
                  :class="event.goal.strength === 'pp' ? 'bg-result-win/15 text-result-win' : 'bg-result-ot/15 text-result-ot'"
                >
                  {{ event.goal.strength }}
                </span>
                <span v-if="event.goal.shotType" class="text-[0.65rem] text-gray-600">
                  {{ event.goal.shotType }}
                </span>
              </div>
              <div v-if="event.goal.assists.length" class="text-[0.7rem] text-gray-500 mt-0.5 truncate">
                <NuxtLink
                  v-for="(assist, assistIndex) in event.goal.assists"
                  :key="assist.playerId"
                  :to="`/players/${assist.playerId}`"
                  class="no-underline text-gray-500 hover:text-gray-300"
                >{{ assist.name }}{{ assistIndex < event.goal.assists.length - 1 ? ', ' : '' }}</NuxtLink>
              </div>
              <div v-else class="text-[0.7rem] text-gray-600 mt-0.5">Unassisted</div>
            </div>
            <span class="text-sm tabular-nums text-gray-400 shrink-0 pt-0.5">
              {{ event.goal.awayScore }}–{{ event.goal.homeScore }}
            </span>
          </template>

          <template v-else>
            <span
              class="w-8 shrink-0 flex justify-center pt-0.5"
              :title="`${event.penalty.duration ?? ''} min`"
            >
              <span class="w-1 h-4 bg-result-loss/50 rounded-sm" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-sm text-gray-300">{{ event.penalty.committedBy ?? 'Bench' }}</span>
                <span class="text-[0.65rem] text-gray-500 font-medium">{{ event.penalty.teamAbbrev }}</span>
              </div>
              <div class="text-[0.7rem] text-gray-500 mt-0.5">
                {{ penaltyDesc(event.penalty.descKey) }}
                <span v-if="event.penalty.duration"> · {{ event.penalty.duration }} min</span>
                <span v-if="event.penalty.drawnBy" class="text-gray-600">
                  · drawn by {{ event.penalty.drawnBy }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
