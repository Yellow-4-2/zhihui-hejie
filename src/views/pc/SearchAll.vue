<template>
  <div>
    <div class="pc-toolbar">
      <div class="pc-toolbar__left">
        <h2 class="pc-page-title">综合查询</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>和解业务</el-breadcrumb-item>
          <el-breadcrumb-item>综合查询</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="pc-toolbar__search">
        <el-select v-model="filterStatus" style="width: 140px">
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.text"
            :value="opt.value"
          />
        </el-select>
        <el-input
          v-model="keyword"
          placeholder="搜案例号/商品/消费者"
          clearable
          :prefix-icon="Search"
          style="width: 280px"
        />
        <el-button :icon="Refresh" plain @click="reset">重置</el-button>
      </div>
    </div>

    <PcTable :columns="columns" :data="paged" border max-height="440">
      <template #caseNo="{ row }">
        <el-button link type="primary" @click="openDetail(row.id)">{{ row.caseNo }}</el-button>
      </template>
      <template #status="{ row }">
        <StatusBadge :status="row.status" variant="pc" size="small" />
      </template>
      <template #amount="{ row }">¥{{ row.amount }}</template>
      <template #updatedAt="{ row }">{{ formatTime(row.updatedAt) }}</template>
      <template #action="{ row }">
        <el-button size="small" type="primary" plain @click="openDetail(row.id)">查看详情</el-button>
      </template>
    </PcTable>

    <div class="pc-pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="filtered.length"
        background
        layout="total, prev, pager, next"
      />
    </div>

    <CaseDetailDrawer v-model:show="drawerShow" :case-id="currentId" @refresh="refresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { ReconciliationCase } from '@/types'
import { STATUS_META } from '@/config/statusMeta'
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

const filterStatus = ref('ALL')
const keyword = ref('')
function reset() {
  filterStatus.value = 'ALL'
  keyword.value = ''
}

const statusOptions = [
  { text: '全部状态', value: 'ALL' },
  ...Object.entries(STATUS_META).map(([value, m]) => ({ text: m.label, value })),
]

const filtered = computed<ReconciliationCase[]>(() => {
  void version.value
  let list = recoStore.casesForRole(userStore.role) as ReconciliationCase[]
  if (filterStatus.value !== 'ALL') {
    list = list.filter((c) => c.status === filterStatus.value)
  }
  const k = keyword.value.trim().toLowerCase()
  if (k) {
    list = list.filter(
      (c) =>
        c.caseNo.toLowerCase().includes(k) ||
        c.commodity.toLowerCase().includes(k) ||
        c.consumerName.toLowerCase().includes(k),
    )
  }
  return list
})

/* ---------- 分页 ---------- */
const page = ref(1)
const pageSize = 10
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch([filterStatus, keyword], () => {
  page.value = 1
})
watch(() => filtered.value.length, (len) => {
  const maxPage = Math.max(1, Math.ceil(len / pageSize))
  if (page.value > maxPage) page.value = maxPage
})

const columns: PcColumn[] = [
  { key: 'caseNo', title: '案例编号', width: '160px', fixed: 'left' },
  { key: 'commodity', title: '商品', minWidth: 140 },
  { key: 'consumerName', title: '消费者', width: '100px' },
  { key: 'enterpriseName', title: '企业', width: '120px' },
  { key: 'amount', title: '金额', width: '100px' },
  { key: 'status', title: '状态', width: '100px' },
  { key: 'updatedAt', title: '更新时间', width: '170px' },
  { key: 'action', title: '操作', width: '110px', fixed: 'right' },
]

const drawerShow = ref(false)
const currentId = ref<string | undefined>()
function openDetail(id: string) {
  currentId.value = id
  drawerShow.value = true
}
</script>

<style scoped>
.pc-toolbar__search {
  display: flex;
  gap: 8px;
}
</style>
