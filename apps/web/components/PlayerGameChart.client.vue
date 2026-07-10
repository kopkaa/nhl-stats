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
  shots?: number | null
  pim?: number | null
  toi?: string | null
  savePctg?: number | null
}

type ScaleGroup = 'count' | 'time' | 'pct'
type PlayerRole = 'skater' | 'goalie'

interface Metric {
  key: string
  label: string
  color: string
  fill: string
  group: ScaleGroup
  roles: PlayerRole[]
  value: (entry: GameLogEntry) => number | null
}

const METRICS: Metric[] = [
  { key: 'points', label: 'PTS', color: 'rgba(255,255,255,0.85)', fill: 'rgba(255,255,255,0.05)', group: 'count', roles: ['skater'], value: entry => entry.points ?? 0 },
  { key: 'goals', label: 'G', color: '#f59e0b', fill: 'rgba(245,158,11,0.06)', group: 'count', roles: ['skater'], value: entry => entry.goals ?? 0 },
  { key: 'assists', label: 'A', color: '#38bdf8', fill: 'rgba(56,189,248,0.06)', group: 'count', roles: ['skater'], value: entry => entry.assists ?? 0 },
  { key: 'shots', label: 'S', color: '#34d399', fill: 'rgba(52,211,153,0.06)', group: 'count', roles: ['skater'], value: entry => entry.shots ?? 0 },
  { key: 'pim', label: 'PIM', color: '#fb7185', fill: 'rgba(251,113,133,0.06)', group: 'count', roles: ['skater'], value: entry => entry.pim ?? 0 },
  { key: 'savePctg', label: 'SV%', color: '#60a5fa', fill: 'rgba(96,165,250,0.07)', group: 'pct', roles: ['goalie'], value: entry => (entry.savePctg != null ? +(entry.savePctg * 100).toFixed(1) : null) },
  { key: 'toi', label: 'TOI', color: '#a78bfa', fill: 'rgba(167,139,250,0.06)', group: 'time', roles: ['skater', 'goalie'], value: entry => parseToiMinutes(entry.toi) },
]

const METRIC_BY_KEY = Object.fromEntries(METRICS.map(metric => [metric.key, metric])) as Record<string, Metric>

const STORAGE_PREFIX = 'nhl:gamelog-metrics:'
const DEFAULT_METRICS: Record<PlayerRole, string[]> = {
  skater: ['points', 'goals'],
  goalie: ['savePctg'],
}

function metricsForRole(role: PlayerRole): Metric[] {
  return METRICS.filter(metric => metric.roles.includes(role))
}

function normalizeToSingleGroup(keys: string[]): string[] {
  const firstKey = keys.find(key => METRIC_BY_KEY[key])
  if (!firstKey) return []
  const group = METRIC_BY_KEY[firstKey].group
  return keys.filter(key => METRIC_BY_KEY[key]?.group === group)
}

function loadSelection(role: PlayerRole): string[] {
  const fallback = [...DEFAULT_METRICS[role]]
  const availableKeys = new Set(metricsForRole(role).map(metric => metric.key))
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + role)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return fallback
    const valid = normalizeToSingleGroup(parsed.filter((key): key is string => typeof key === 'string' && availableKeys.has(key)))
    return valid.length ? valid : fallback
  } catch {
    return fallback
  }
}

const props = defineProps<{
  entries: GameLogEntry[]
  isGoalie: boolean
}>()

const role = computed<PlayerRole>(() => (props.isGoalie ? 'goalie' : 'skater'))
const availableMetrics = computed(() => metricsForRole(role.value))

const selectedKeys = ref<string[]>(loadSelection(role.value))

watch(role, newRole => {
  selectedKeys.value = loadSelection(newRole)
})

watch(
  selectedKeys,
  keys => {
    try {
      localStorage.setItem(STORAGE_PREFIX + role.value, JSON.stringify(keys))
    } catch {
      // localStorage unavailable — selection stays in-memory only
    }
  },
  { deep: true }
)

const activeGroup = computed<ScaleGroup>(() => {
  const firstKey = selectedKeys.value[0]
  return firstKey ? METRIC_BY_KEY[firstKey]?.group ?? 'count' : 'count'
})

function toggleMetric(metricKey: string) {
  const metric = METRIC_BY_KEY[metricKey]
  if (!metric) return

  if (metric.group !== activeGroup.value) {
    selectedKeys.value = [metricKey]
    return
  }

  if (selectedKeys.value.includes(metricKey)) {
    if (selectedKeys.value.length === 1) return
    selectedKeys.value = selectedKeys.value.filter(key => key !== metricKey)
  } else {
    selectedKeys.value = [...selectedKeys.value, metricKey]
  }
}

const chronological = computed(() => [...props.entries].reverse())

const labels = computed(() => chronological.value.map(entry => formatGameDate(entry.gameDate)))

const singleMetric = computed(() => selectedKeys.value.length === 1)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: selectedKeys.value.map(metricKey => {
    const metric = METRIC_BY_KEY[metricKey]
    return {
      label: metric.label,
      data: chronological.value.map(metric.value),
      borderColor: metric.color,
      backgroundColor: metric.fill,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: metric.color,
      fill: singleMetric.value,
      tension: 0.3,
      spanGaps: true,
    }
  }),
}))

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
        label(item: { datasetIndex: number; parsed: { y: number | null } }) {
          const metric = METRIC_BY_KEY[selectedKeys.value[item.datasetIndex]]
          const rawValue = item.parsed.y
          if (rawValue == null) return `${metric.label}: —`
          return `${metric.label}: ${metric.group === 'time' ? formatToi(rawValue) : rawValue}`
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
        ...(activeGroup.value === 'count' ? { stepSize: 1, precision: 0 } : {}),
      },
      border: { color: 'rgba(255,255,255,0.06)' },
      min: activeGroup.value === 'pct' ? undefined : 0,
    },
  },
}))
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-1.5 mb-3">
      <button
        v-for="metric in availableMetrics"
        :key="metric.key"
        type="button"
        class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium tracking-tight transition-colors"
        :class="selectedKeys.includes(metric.key) ? 'bg-white/[0.06] text-gray-200' : 'text-gray-600 hover:text-gray-400'"
        @click="toggleMetric(metric.key)"
      >
        <span
          class="w-2 h-2 rounded-full shrink-0 transition-opacity"
          :class="selectedKeys.includes(metric.key) ? 'opacity-100' : 'opacity-30'"
          :style="{ backgroundColor: metric.color }"
        />
        {{ metric.label }}
      </button>
    </div>
    <div class="relative h-44">
      <Line :data="chartData" :options="options" />
    </div>
  </div>
</template>
