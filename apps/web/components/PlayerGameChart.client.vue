<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface GameLogEntry {
  gameDate: string
  opponentAbbrev?: string | null
  homeRoadFlag?: string | null
  goals?: number | null
  assists?: number | null
  points?: number | null
  savePctg?: number | null
}

const props = defineProps<{
  entries: GameLogEntry[]
  isGoalie: boolean
}>()

const chronological = computed(() => [...props.entries].reverse())

const labels = computed(() =>
  chronological.value.map(entry => {
    const date = new Date(entry.gameDate + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
)

const chartData = computed(() => {
  if (props.isGoalie) {
    return {
      labels: labels.value,
      datasets: [
        {
          label: 'SV%',
          data: chronological.value.map(entry =>
            entry.savePctg != null ? +(entry.savePctg * 100).toFixed(1) : null
          ),
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96,165,250,0.07)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#60a5fa',
          fill: true,
          tension: 0.3,
          spanGaps: true,
        },
      ],
    }
  }

  return {
    labels: labels.value,
    datasets: [
      {
        label: 'PTS',
        data: chronological.value.map(entry => entry.points ?? 0),
        borderColor: 'rgba(255,255,255,0.85)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(255,255,255,0.85)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'G',
        data: chronological.value.map(entry => entry.goals ?? 0),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 3],
        pointRadius: 4,
        pointBackgroundColor: '#f59e0b',
        fill: false,
        tension: 0.3,
      },
    ],
  }
})

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgb(17,17,27)',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: 'rgba(255,255,255,0.55)',
      bodyColor: 'rgba(255,255,255,0.9)',
      padding: 10,
      callbacks: {
        title(items: { dataIndex: number }[]) {
          const index = items[0]?.dataIndex
          if (index == null) return ''
          const entry = chronological.value[index]
          const loc = entry.homeRoadFlag === 'H' ? 'vs' : '@'
          return `${labels.value[index]} · ${loc} ${entry.opponentAbbrev ?? ''}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgb(107,114,128)', font: { size: 11 } },
      border: { color: 'rgba(255,255,255,0.06)' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: {
        color: 'rgb(107,114,128)',
        font: { size: 11 },
        ...(props.isGoalie ? {} : { stepSize: 1, precision: 0 }),
      },
      border: { color: 'rgba(255,255,255,0.06)' },
      min: props.isGoalie ? undefined : 0,
    },
  },
}))
</script>

<template>
  <div>
    <div v-if="!isGoalie" class="flex items-center gap-4 mb-3">
      <span class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="w-2 h-2 rounded-full bg-white/80 shrink-0" />
        PTS
      </span>
      <span class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        G
      </span>
    </div>
    <div v-else class="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
      <span class="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
      SV%
    </div>
    <div class="relative h-44">
      <Line :data="chartData" :options="options" />
    </div>
  </div>
</template>
