<template>
  <div>
    <!-- 工具栏 -->
    <div class="pc-toolbar">
      <div class="pc-toolbar__left">
        <h2 class="pc-page-title">概览面板</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/pc' }">工作台</el-breadcrumb-item>
          <el-breadcrumb-item>概览面板</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-button :icon="Refresh" plain @click="onReset">
        重置演示数据
      </el-button>
    </div>

    <!-- 状态统计卡片 -->
    <el-row :gutter="16" class="dash-stat">
      <el-col
        v-for="s in statuses"
        :key="s"
        :xs="12"
        :sm="8"
        :md="6"
        :lg="3"
        :xl="3"
      >
        <div class="dash-stat__card" :style="{ borderTopColor: STATUS_META[s].color }">
          <div class="dash-stat__num" :style="{ color: STATUS_META[s].color }">
            {{ counts[s] ?? 0 }}
          </div>
          <div class="dash-stat__label">{{ STATUS_META[s].label }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 数据图表 -->
    <el-row :gutter="16" class="dash-charts">
      <el-col :xs="24" :md="8">
        <div class="dash-chart">
          <div class="dash-chart__title">案件状态分布</div>
          <div ref="pieEl" class="dash-chart__canvas"></div>
        </div>
      </el-col>
      <el-col :xs="24" :md="8">
        <div class="dash-chart">
          <div class="dash-chart__title">月度和解量趋势</div>
          <div ref="lineEl" class="dash-chart__canvas"></div>
        </div>
      </el-col>
      <el-col :xs="24" :md="8">
        <div class="dash-chart">
          <div class="dash-chart__title">企业案件量排行</div>
          <div ref="barEl" class="dash-chart__canvas"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近和解 -->
    <div class="pc-section">
      <div class="pc-section__title">最近和解（按更新时间）</div>
      <PcTable :columns="columns" :data="recent" border>
        <template #caseNo="{ row }">
          <el-button class="dash-case-btn" text type="primary" @click="openDetail(row.id)">{{ row.caseNo }}</el-button>
        </template>
        <template #status="{ row }">
          <StatusBadge :status="row.status" variant="pc" size="small" effect="dark" />
        </template>
        <template #amount="{ row }">¥{{ row.amount }}</template>
        <template #updatedAt="{ row }">{{ formatTime(row.updatedAt) }}</template>
        <template #action="{ row }">
          <el-button size="small" type="primary" plain @click="openDetail(row.id)">处理</el-button>
        </template>
      </PcTable>
    </div>

    <CaseDetailDrawer v-model:show="drawerShow" :case-id="currentId" @refresh="refresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts/core'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ReconciliationCase } from '@/types'
import { STATUS_META, STATUS_FLOW_ORDER } from '@/config/statusMeta'
import { useReconciliationStore } from '@/stores/reconciliation'
import { useUserStore } from '@/stores/user'
import PcTable, { type PcColumn } from '@/components/PcTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import CaseDetailDrawer from './CaseDetailDrawer.vue'
import { formatTime } from '@/utils/date'

const recoStore = useReconciliationStore()
const userStore = useUserStore()

const version = ref(0)
function refresh() {
  version.value += 1
}

const statuses = STATUS_FLOW_ORDER
const counts = computed(() => {
  void version.value
  return recoStore.countsFor(userStore.role)
})

const recent = computed<ReconciliationCase[]>(() => {
  void version.value
  const all = recoStore.casesForRole(userStore.role) as ReconciliationCase[]
  return all.slice(0, 8)
})

/* ---------- 图表数据 ---------- */
echarts.use([PieChart, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const roleCases = computed<ReconciliationCase[]>(() => {
  void version.value
  return recoStore.casesForRole(userStore.role) as ReconciliationCase[]
})

const statusData = computed(() =>
  STATUS_FLOW_ORDER.map((s) => ({
    name: STATUS_META[s].label,
    value: roleCases.value.filter((c) => c.status === s).length,
    itemStyle: { color: STATUS_META[s].color },
  })).filter((d) => d.value > 0),
)

const monthData = computed(() => {
  const map = new Map<string, number>()
  roleCases.value.forEach((c) => {
    const d = new Date(c.updatedAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) ?? 0) + 1)
  })
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})

const entData = computed(() => {
  const map = new Map<string, number>()
  roleCases.value.forEach((c) => {
    const name = c.enterpriseName ?? '未知企业'
    map.set(name, (map.get(name) ?? 0) + 1)
  })
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
})

/* ---------- 图表渲染 ---------- */
const pieEl = ref<HTMLElement>()
const lineEl = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const AXIS_STYLE = {
  axisLabel: { fontSize: 11, color: '#9ca3af' },
  axisLine: { lineStyle: { color: '#e5e7eb' } },
  axisTick: { show: false },
}

function renderPie() {
  pieChart?.setOption({
    tooltip: { trigger: 'item', formatter: '{b}：{c} 件（{d}%）' },
    legend: { bottom: 0, type: 'scroll', icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 10, textStyle: { fontSize: 11, color: '#6b7280' } },
    series: [
      {
        type: 'pie',
        radius: ['44%', '68%'],
        center: ['50%', '44%'],
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        label: { show: false },
        emphasis: { label: { show: false } },
        data: statusData.value,
      },
    ],
  })
}

function renderLine() {
  lineChart?.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 20, top: 24, bottom: 30 },
    xAxis: { type: 'category', boundaryGap: false, data: monthData.value.map((d) => d[0]), ...AXIS_STYLE },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#f3f4f6' } }, ...AXIS_STYLE },
    series: [
      {
        type: 'line',
        smooth: true,
        data: monthData.value.map((d) => d[1]),
        symbolSize: 7,
        lineStyle: { width: 2.5, color: '#409eff' },
        itemStyle: { color: '#409eff' },
        areaStyle: { color: 'rgba(64, 158, 255, 0.12)' },
      },
    ],
  })
}

function renderBar() {
  const rows = entData.value.slice(0, 6).reverse()
  barChart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}：{c} 件' },
    grid: { left: 90, right: 28, top: 16, bottom: 24 },
    xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#f3f4f6' } }, ...AXIS_STYLE },
    yAxis: { type: 'category', data: rows.map((d) => d[0]), ...AXIS_STYLE },
    series: [
      {
        type: 'bar',
        data: rows.map((d) => d[1]),
        barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0], color: '#67c23a' },
      },
    ],
  })
}

function renderAll() {
  renderPie()
  renderLine()
  renderBar()
}

function onResize() {
  pieChart?.resize()
  lineChart?.resize()
  barChart?.resize()
}

onMounted(async () => {
  await nextTick()
  pieChart = echarts.init(pieEl.value!)
  lineChart = echarts.init(lineEl.value!)
  barChart = echarts.init(barEl.value!)
  renderAll()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  pieChart?.dispose()
  lineChart?.dispose()
  barChart?.dispose()
  pieChart = lineChart = barChart = null
})

watch([statusData, monthData, entData], renderAll)

const columns: PcColumn[] = [
  { key: 'caseNo', title: '案例编号', width: '160px', fixed: 'left' },
  { key: 'commodity', title: '商品', minWidth: 140 },
  { key: 'consumerName', title: '消费者', width: '100px' },
  { key: 'enterpriseName', title: '企业', width: '120px' },
  { key: 'amount', title: '金额', width: '100px' },
  { key: 'status', title: '状态', width: '100px' },
  { key: 'updatedAt', title: '更新时间', width: '170px' },
  { key: 'action', title: '操作', width: '100px', fixed: 'right' },
]

const drawerShow = ref(false)
const currentId = ref<string | undefined>()
function openDetail(id: string) {
  currentId.value = id
  drawerShow.value = true
}

function onReset() {
  ElMessageBox.confirm('确认重置所有演示数据？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await recoStore.resetMock()
      refresh()
      ElMessage.success('已重置')
    })
    .catch(() => {})
}
</script>

<style scoped>
/* 去掉文字按钮默认左右 15px 内边距，使案例编号与其他列文字左对齐 */
.dash-case-btn {
  padding: 8px 0;
}

.dash-charts {
  margin-bottom: 16px;
}

.dash-chart {
  height: 100%;
  padding: 14px 14px 6px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.dash-chart__title {
  margin-bottom: 2px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.dash-chart__canvas {
  width: 100%;
  height: 240px;
}
</style>
