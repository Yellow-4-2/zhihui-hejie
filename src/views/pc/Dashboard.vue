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

    <!-- 最近和解 -->
    <div class="pc-section">
      <div class="pc-section__title">最近和解（按更新时间）</div>
      <PcTable :columns="columns" :data="recent" border>
        <template #caseNo="{ row }">
          <el-button text type="primary" @click="openDetail(row.id)">{{ row.caseNo }}</el-button>
        </template>
        <template #status="{ row }">
          <StatusBadge :status="row.status" variant="pc" size="small" effect="dark" />
        </template>
        <template #amount="{ row }">¥{{ row.amount }}</template>
        <template #updatedAt="{ row }">{{ formatTime(row.updatedAt) }}</template>
        <template #action="{ row }">
          <el-button type="primary" text @click="openDetail(row.id)">处理</el-button>
        </template>
      </PcTable>
    </div>

    <CaseDetailDrawer v-model:show="drawerShow" :case-id="currentId" @refresh="refresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
    .then(() => {
      recoStore.resetMock()
      refresh()
      ElMessage.success('已重置')
    })
    .catch(() => {})
}
</script>
