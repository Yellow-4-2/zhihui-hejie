<template>
  <div class="status-list">
    <!-- 移动端（Vant） -->
    <template v-if="!isDesktop">
      <van-nav-bar :title="title" left-arrow @click-left="onBack" />
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="page-section">
          <ReconciliationCard
            v-for="c in list"
            :key="c.id"
            :case-data="c"
            show-arrow
            @click="goDetail(c.id)"
          >
            <template #actions>
              <ActionSheet
                :case-data="c"
                :role="userStore.role"
                @view="goDetail(c.id)"
                @done="onDone"
                @evaluate="goEvaluate(c.id)"
              />
            </template>
          </ReconciliationCard>
          <van-empty v-if="!list.length" :description="`暂无${title}`" />
        </div>
      </van-pull-refresh>
    </template>

    <!-- PC 端（Element Plus） -->
    <template v-else>
      <el-table
        :data="list"
        style="width: 100%"
        @row-click="(row: ReconciliationCase) => row.id && goDetail(row.id)"
        v-loading="refreshing"
      >
        <el-table-column prop="caseNo" label="编号" width="180" />
        <el-table-column prop="commodity" label="商品" min-width="180" show-overflow-tooltip />
        <el-table-column label="金额" width="100">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.status" variant="pc" />
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ row.createdAt }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="row.id && goDetail(row.id)">查看</el-button>
            <el-button link type="primary" size="small" @click.stop="onDone">刷新</el-button>
            <el-button
              v-if="canEvaluate(row)"
              link
              type="success"
              size="small"
              @click.stop="row.id && goEvaluate(row.id)"
            >评价</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!list.length" :description="`暂无${title}`" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CaseStatus, ReconciliationCase } from '@/types'
import { STATUS_META } from '@/config/statusMeta'
import { useReconciliationStore } from '@/stores/reconciliation'
import { useUserStore } from '@/stores/user'
import ReconciliationCard from '@/components/ReconciliationCard.vue'
import ActionSheet from '@/components/ActionSheet.vue'
import StatusBadge from '@/components/StatusBadge.vue'

defineOptions({ name: 'StatusList' })

const isDesktop = inject<Ref<boolean>>('isDesktop', { value: false } as Ref<boolean>)

const route = useRoute()
const router = useRouter()
const recoStore = useReconciliationStore()
const userStore = useUserStore()

const roleParam = computed(() => route.params.role as string)
const statusParam = computed(() => route.params.status as string)
const base = computed(() => `/m/${roleParam.value}`)

const title = computed(() => {
  if (statusParam.value === 'ALL') return '全部和解'
  const meta = STATUS_META[statusParam.value as CaseStatus]
  return meta ? meta.label : '和解列表'
})

const version = ref(0)
const list = computed(() => {
  void version.value
  return recoStore.byStatus(statusParam.value as CaseStatus | 'ALL', userStore.role)
})

const refreshing = ref(false)
function onRefresh() { version.value += 1; refreshing.value = false }
function onDone() { version.value += 1 }
function goDetail(id: string) { router.push(`${base.value}/case/${id}`) }
function goEvaluate(id: string) { router.push(`/m/consumer/evaluate/${id}`) }
function onBack() { router.push(base.value) }

function canEvaluate(row: ReconciliationCase) {
  return userStore.role === 'consumer' && row.status === 'COMPLETED'
}
</script>

<style scoped>
.status-list { min-height: 100vh; background: #f7f8fa; }
</style>
