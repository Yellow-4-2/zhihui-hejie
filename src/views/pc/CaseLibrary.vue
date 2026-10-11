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
        <el-button size="small" type="primary" plain @click="onView(row)">查看建议</el-button>
      </template>
    </PcTable>

    <el-dialog v-model="detailShow" :title="current?.title" width="520px" class="case-lib-dialog">
      <div v-if="current" class="case-lib-detail">
        <div class="case-lib-detail__meta">
          <div class="case-lib-detail__tags">
            <el-tag size="small" type="primary" effect="light" round>{{ current.category }}</el-tag>
            <StatusBadge :status="current.status" variant="pc" size="small" />
          </div>
          <div class="case-lib-detail__price">
            <span class="case-lib-detail__price-label">争议金额</span>
            <span class="case-lib-detail__price-value">¥{{ current.amount.toLocaleString() }}</span>
          </div>
        </div>

        <section class="case-lib-detail__block">
          <h4 class="case-lib-detail__label">纠纷摘要</h4>
          <p class="case-lib-detail__summary">{{ current.summary }}</p>
        </section>

        <section class="case-lib-detail__suggestion">
          <h4 class="case-lib-detail__label case-lib-detail__label--accent">
            <el-icon><Promotion /></el-icon>
            和解建议
          </h4>
          <p class="case-lib-detail__suggestion-text">{{ current.suggestion }}</p>
        </section>
      </div>
      <template #footer>
        <el-button type="primary" @click="detailShow = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Promotion } from '@element-plus/icons-vue'
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
/* 注意：不要在 plain CSS 的 style 块里用 & 嵌套——构建不会展开，
   浏览器会把 &__xxx 判为非法选择器整条丢弃（本项目踩过坑），必须写扁平类名 */
.case-lib-detail {
  padding: 4px 0 8px;
}

.case-lib-detail__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px dashed #e5e7eb;
}

.case-lib-detail__tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.case-lib-detail__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.3;
}

.case-lib-detail__price-label {
  font-size: 12px;
  color: #9ca3af;
}

.case-lib-detail__price-value {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
  font-variant-numeric: tabular-nums;
}

.case-lib-detail__label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 1px;
}

.case-lib-detail__label--accent {
  color: #409eff;
}

.case-lib-detail__block {
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.case-lib-detail__summary {
  margin: 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.8;
}

.case-lib-detail__suggestion {
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #ecf5ff 100%);
  border: 1px solid #d9ecff;
  border-left: 3px solid #409eff;
  border-radius: 8px;
}

.case-lib-detail__suggestion-text {
  margin: 0;
  color: #303133;
  font-size: 14px;
  line-height: 1.8;
}
</style>

<style>
/* 弹窗外壳由 Element Plus 内部渲染，样式放全局并挂唯一 class，避免 scoped 属性选择器失配 */
.case-lib-dialog {
  border-radius: 12px;
}

.case-lib-dialog .el-dialog__header {
  padding: 18px 22px 14px;
  margin-right: 0;
  border-bottom: 1px solid #f0f0f0;
}

.case-lib-dialog .el-dialog__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.case-lib-dialog .el-dialog__title::before {
  content: '';
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #409eff, #79bbff);
}

.case-lib-dialog .el-dialog__body {
  padding: 20px 24px;
}

.case-lib-dialog .el-dialog__footer {
  padding: 4px 24px 20px;
}
</style>
