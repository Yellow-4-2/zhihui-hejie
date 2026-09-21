<template>
  <div class="home">
    <!-- 移动端（Vant） -->
    <template v-if="!isDesktop">
      <van-nav-bar :title="title">
        <template #right>
          <van-icon name="user-o" size="20" @click="onLogout" />
        </template>
      </van-nav-bar>
      <div class="home__hero">
        <div class="home__welcome">
          <div class="home__hello">您好，{{ userStore.name }}</div>
          <div class="home__role">{{ roleLabel }}</div>
        </div>
        <van-button type="primary" round icon="edit" @click="goInitiate" style="margin-top: 12px">
          我要和解
        </van-button>
      </div>
      <div class="page-section">
        <div class="section-title">各状态和解数量</div>
        <StatusCountGrid :statuses="statuses" :counts="counts" @select="onSelectStatus" />
      </div>
      <div class="page-section">
        <div class="flex-between" style="padding: 0 0 8px">
          <span class="section-title" style="padding: 0">最近和解</span>
          <span class="text-secondary" @click="goAll">全部 ›</span>
        </div>
        <ReconciliationCard
          v-for="c in recent"
          :key="c.id"
          :case-data="c"
          show-arrow
          @click="goDetail(c.id)"
        />
        <van-empty v-if="!recent.length" description="暂无和解记录" />
      </div>
    </template>

    <!-- PC 端（Element Plus） -->
    <template v-else>
      <div class="pc-hero">
        <div class="pc-hero__left">
          <h1 class="pc-hero__hello">您好，{{ userStore.name }}</h1>
          <p class="pc-hero__role">{{ roleLabel }}</p>
        </div>
        <el-button type="primary" size="large" @click="goInitiate">
          <el-icon style="margin-right: 4px"><Edit /></el-icon>
          发起和解
        </el-button>
      </div>

      <el-row :gutter="16" class="pc-stats">
        <el-col v-for="s in statusCards" :key="s.status" :xs="12" :sm="8" :md="4" :lg="4">
          <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
            <div class="stat-card__inner">
              <el-icon class="stat-card__icon" :style="{ color: s.color }">
                <component :is="s.icon" />
              </el-icon>
              <div class="stat-card__info">
                <div class="stat-card__count" :style="{ color: s.color }">{{ counts[s.status] || 0 }}</div>
                <div class="stat-card__label">{{ s.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="never" class="pc-recent">
        <template #header>
          <div class="pc-recent__header">
            <span class="pc-recent__title">最近和解</span>
            <el-button link type="primary" @click="goAll">查看全部 ›</el-button>
          </div>
        </template>
        <el-table :data="recent" style="width: 100%" @row-click="goPcDetail">
          <el-table-column prop="caseNo" label="编号" width="180" />
          <el-table-column prop="commodity" label="商品" min-width="160" show-overflow-tooltip />
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
        </el-table>
        <el-empty v-if="!recent.length" description="暂无和解记录" />
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { Clock, Document, Operation, CircleCheck, Warning, Files, CircleClose, Star } from '@element-plus/icons-vue'
import type { CaseStatus, ReconciliationCase } from '@/types'
import { useUserStore } from '@/stores/user'
import { useReconciliationStore } from '@/stores/reconciliation'
import { ROLE_LABEL } from '@/config/constants'
import { HOME_STATUS_BY_ROLE } from '@/config/statusMeta'
import StatusCountGrid from '@/components/StatusCountGrid.vue'
import ReconciliationCard from '@/components/ReconciliationCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const isDesktop = inject<Ref<boolean>>('isDesktop', { value: false } as Ref<boolean>)

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const recoStore = useReconciliationStore()

const roleParam = computed(() => route.params.role as string)
const base = computed(() => `/m/${roleParam.value}`)

const title = computed(() => `${(userStore.role && ROLE_LABEL[userStore.role]) ?? '智慧和解'}首页`)
const roleLabel = computed(() => (userStore.role && ROLE_LABEL[userStore.role]) ?? '')

const statuses = computed<CaseStatus[]>(() => {
  const r = userStore.role
  if (!r) return []
  const key = r === 'committee_m' ? 'committee_m' : (r as string)
  return HOME_STATUS_BY_ROLE[key] ?? []
})

const counts = computed(() => recoStore.countsFor(userStore.role))
const recent = computed(() => recoStore.casesForRole(userStore.role).slice(0, 5))

// PC 端状态卡片配置（覆盖全部 8 种状态，与 STATUS_META 对齐）
const statusCards = computed(() => {
  const map: Record<string, { icon: any; color: string; label: string }> = {
    PENDING: { icon: Clock, color: '#ff976a', label: '待受理' },
    ACCEPTED: { icon: Document, color: '#1989fa', label: '已受理' },
    IN_PROGRESS: { icon: Operation, color: '#7232dd', label: '和解中' },
    COMPLETED: { icon: CircleCheck, color: '#07c160', label: '和解完成' },
    FAILED: { icon: Warning, color: '#ee0a24', label: '和解失败' },
    FINISHED: { icon: Files, color: '#969799', label: '已完结' },
    REJECTED: { icon: CircleClose, color: '#909399', label: '不受理' },
    EVALUATED: { icon: Star, color: '#f5a623', label: '已评价' },
  }
  return statuses.value.map((s) => ({ status: s, ...(map[s] ?? { icon: Document, color: '#909399', label: s }) }))
})

function goInitiate() { router.push(`${base.value}/initiate`) }
function goDetail(id: string) { router.push(`${base.value}/case/${id}`) }
function goPcDetail(row: ReconciliationCase) { row.id && goDetail(row.id) }
function goAll() { router.push(`${base.value}/list/ALL`) }
function onSelectStatus(s: CaseStatus) { router.push(`${base.value}/list/${s}`) }
function onLogout() {
  showConfirmDialog({ title: '提示', message: '确认退出登录？' })
    .then(() => { userStore.logout(); router.push('/') })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
/* 移动端 */
.home__hero {
  background: linear-gradient(135deg, #1989fa 0%, #0a6cd6 100%);
  color: #fff; padding: 20px 16px 24px;
}
.home__welcome { display: flex; align-items: baseline; gap: 10px; }
.home__hello { font-size: 18px; font-weight: 500; }
.home__role { font-size: 12px; opacity: 0.85; }

/* PC 端 */
.pc-hero {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, #1989fa 0%, #0a6cd6 100%);
  color: #fff; padding: 24px 28px; border-radius: 8px; margin-bottom: 20px;
}
.pc-hero__hello { margin: 0; font-size: 24px; font-weight: 600; }
.pc-hero__role { margin: 4px 0 0; font-size: 14px; opacity: 0.9; }

.pc-stats { margin-bottom: 20px; }
.stat-card {
  :deep(.el-card__body) { padding: 20px; }
}
.stat-card__inner { display: flex; align-items: center; gap: 16px; }
.stat-card__icon { font-size: 36px; }
.stat-card__count { font-size: 24px; font-weight: 600; line-height: 1; }
.stat-card__label { font-size: 13px; color: #909399; margin-top: 4px; }

.pc-recent { border-radius: 8px; }
.pc-recent__header { display: flex; align-items: center; justify-content: space-between; }
.pc-recent__title { font-size: 16px; font-weight: 600; color: #303133; }
</style>
