<template>
  <div>
    <div class="pc-toolbar">
      <div class="pc-toolbar__left">
        <h2 class="pc-page-title">{{ pageTitle }}</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/pc' }">和解业务</el-breadcrumb-item>
          <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-button :icon="Refresh" plain @click="refresh">刷新</el-button>
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
        <el-button size="small" type="primary" plain @click="openDetail(row.id)">处理</el-button>
      </template>
    </PcTable>

    <div class="pc-pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="list.length"
        background
        layout="total, prev, pager, next"
      />
    </div>

    <CaseDetailDrawer v-model:show="drawerShow" :case-id="currentId" @refresh="refresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { CaseStatus, type ReconciliationCase } from '@/types'
import { STATUS_META } from '@/config/statusMeta'
import { useReconciliationStore } from '@/stores/reconciliation'
import { useUserStore } from '@/stores/user'
import PcTable, { type PcColumn } from '@/components/PcTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import CaseDetailDrawer from './CaseDetailDrawer.vue'
import { formatTime } from '@/utils/date'

const props = defineProps({
  status: { type: String as PropType<CaseStatus>, required: true },
})

const recoStore = useReconciliationStore()
const userStore = useUserStore()

const version = ref(0)
function refresh() {
  version.value += 1
}

const list = computed<ReconciliationCase[]>(() => {
  void version.value
  return recoStore.byStatus(props.status, userStore.role) as ReconciliationCase[]
})

const pageTitle = computed(() => STATUS_META[props.status as CaseStatus].label + '列表')

/* ---------- 分页 ---------- */
const page = ref(1)
const pageSize = 10
const paged = computed(() => list.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch(() => props.status, () => {
  page.value = 1
})
watch(() => list.value.length, (len) => {
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
  { key: 'action', title: '操作', width: '100px', fixed: 'right' },
]

const drawerShow = ref(false)
const currentId = ref<string | undefined>()
function openDetail(id: string) {
  currentId.value = id
  drawerShow.value = true
}
</script>
