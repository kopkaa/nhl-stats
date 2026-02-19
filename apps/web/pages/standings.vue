<script setup lang="ts">
import { useGetStandingsQuery } from '~/graphql/generated';

const { result, loading, error } = useGetStandingsQuery({});

const standings = computed(() => result.value?.standings ?? []);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Standings</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <ProgressSpinner />
    </div>

    <Message v-else-if="error" severity="error">
      {{ error.message }}
    </Message>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-800 text-gray-400 text-left">
            <th class="py-3 px-2 w-8">#</th>
            <th class="py-3 px-2">Team</th>
            <th class="py-3 px-2 text-center">GP</th>
            <th class="py-3 px-2 text-center">W</th>
            <th class="py-3 px-2 text-center">L</th>
            <th class="py-3 px-2 text-center">OTL</th>
            <th class="py-3 px-2 text-center font-bold">PTS</th>
            <th class="py-3 px-2 text-center">GF</th>
            <th class="py-3 px-2 text-center">GA</th>
            <th class="py-3 px-2 text-center">DIFF</th>
            <th class="py-3 px-2 text-center">STRK</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in standings"
            :key="row.teamId"
            class="border-b border-gray-800/50 hover:bg-gray-900 transition-colors"
          >
            <td class="py-3 px-2 text-gray-500">{{ index + 1 }}</td>
            <td class="py-3 px-2">
              <div class="flex items-center gap-3">
                <img
                  v-if="row.teamLogo"
                  :src="row.teamLogo"
                  :alt="row.teamName"
                  class="w-6 h-6 object-contain"
                />
                <span class="font-medium">{{ row.teamName }}</span>
              </div>
            </td>
            <td class="py-3 px-2 text-center text-gray-400">{{ row.gamesPlayed }}</td>
            <td class="py-3 px-2 text-center">{{ row.wins }}</td>
            <td class="py-3 px-2 text-center">{{ row.losses }}</td>
            <td class="py-3 px-2 text-center">{{ row.otLosses }}</td>
            <td class="py-3 px-2 text-center font-bold">{{ row.points }}</td>
            <td class="py-3 px-2 text-center text-gray-400">{{ row.goalsFor }}</td>
            <td class="py-3 px-2 text-center text-gray-400">{{ row.goalsAgainst }}</td>
            <td
              class="py-3 px-2 text-center"
              :class="row.goalsFor - row.goalsAgainst > 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ row.goalsFor - row.goalsAgainst > 0 ? '+' : '' }}{{ row.goalsFor - row.goalsAgainst }}
            </td>
            <td class="py-3 px-2 text-center text-gray-400">
              {{ row.streakCode }}{{ row.streakCount }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
