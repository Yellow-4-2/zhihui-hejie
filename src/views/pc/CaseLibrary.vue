<template>
  <div>
    <div class="pc-toolbar">
      <div class="pc-toolbar__left">
        <h2 class="pc-page-title">和解案例库</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>和解业务</el-breadcrumb-item>
          <el-breadcrumb-item>和解案例库</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-input
        v-model="keyword"
        placeholder="搜索案例标题/类别/摘要"
        clearable
        :prefix-icon="Search"
        style="width: 320px"
      />
    </div>

    <PcTable :columns="columns" :data="list" border>
      <template #amount="{ row }">¥{{ row.amount }}</template>
      <template #status="{ row }">
        <StatusBadge :status="row.status" variant="pc" size="small" />
      </template>
      <template #createdAt="{ row }">{{ formatTime(row.createdAt) }}</template>
      <template #action="{ row }">
        <el-button text type="primary" @click="onView(row)">查看建议</el-button>
      </template>
    </PcTable>

    <el-dialog v-model="detailShow" :title="current?.title" width="480px">
      <div class="case-lib-detail">
        <el-tag size="small" type="info">{{ current?.category }}</el-tag>
        <span class="case-lib-detail__price">金额：¥{{ current?.amount }}</span>
        <p class="case-lib-detail__summary">{{ current?.summary }}</p>
        <div class="case-lib-detail__suggestion">
          <strong>和解建议：</strong>
          {{ current?.suggestion }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useCaseLibraryStore } from '@/stores/caseLibrary'
import type { CaseLibraryEntry } from '@/types'
import PcTable, { type PcColumn } from '@/components/PcTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatTime } from '@/utils/date'

const caseLibStore = useCaseLibraryStore()
const keyword = ref('')

const list = computed(() => caseLibStore.search(keyword.value))
const columns: PcColumn[] = [
  { key: 'id', title: '编号', width: '100px' },
  { key: 'title', title: '案例标题', minWidth: 180 },
  { key: 'category', title: '类别', width: '120px' },
  { key: 'amount', title: '金额', width: '100px', align: 'right' },
  { key: 'status', title: '状态', width: '100px', align: 'center' },
  { key: 'createdAt', title: '时间', width: '170px' },
  { key: 'action', title: '操作', width: '110px', align: 'center', fixed: 'right' },
]

const detailShow = ref(false)
const current = ref<CaseLibraryEntry | undefined>()
function onView(row: CaseLibraryEntry) {
  current.value = row
  detailShow.value = true
}
</script>

<style scoped>
.case-lib-detail {
  padding: 4px 0;

  &__price {
    margin-left: 12px;
    color: #f56c6c;
    font-weight: 500;
  }

  &__summary {
    margin-top: 14px;
    color: #374151;
    font-size: 14px;
    line-height: 1.8;
  }

  &__suggestion {
    margin-top: 14px;
    padding: 12px 14px;
    background: #ecf5ff;
    border-radius: 4px;
    border-left: 3px solid #409eff;
    font-size: 14px;
    line-height: 1.8;
    color: #303133;
  }
}
</style>
