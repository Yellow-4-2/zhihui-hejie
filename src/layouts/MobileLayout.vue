<template>
  <div :class="['mobile-shell', { 'is-pc': isDesktop }]">
    <!-- PC 端布局：侧边栏 + 内容区 -->
    <template v-if="isDesktop">
      <el-container class="pc-shell">
        <el-header class="pc-header" height="56px">
          <div class="pc-header__left">
            <span class="pc-header__logo">{{ roleIcon }}</span>
            <span class="pc-header__title">{{ roleLabel }}</span>
            <el-tag type="primary" effect="dark" size="small" class="pc-header__badge">
              PC 端适配
            </el-tag>
          </div>
          <div class="pc-header__right">
            <el-dropdown trigger="click">
              <span class="pc-header__user">
                <el-icon><User /></el-icon>
                {{ userStore.name || '用户' }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goHome">
                    <el-icon><SwitchButton /></el-icon> 切换角色
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="onLogout">
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-container>
          <el-aside width="220px" class="pc-aside">
            <el-menu
              :default-active="activeMenu"
              background-color="#001529"
              text-color="rgba(255,255,255,0.75)"
              active-text-color="#ffffff"
              class="pc-menu"
              @select="go"
            >
              <template v-for="item in pcMenuItems" :key="item.to">
                <el-menu-item :index="item.to">
                  <el-icon><component :is="item.icon" /></el-icon>
                  <span>{{ item.label }}</span>
                </el-menu-item>
              </template>
            </el-menu>
          </el-aside>

          <el-main class="pc-main">
            <el-card shadow="never" class="pc-content">
              <div class="pc-content__title" v-if="pageTitle">
                <h2>{{ pageTitle }}</h2>
              </div>
              <router-view v-slot="{ Component }">
                <keep-alive :include="['StatusList']">
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </el-card>
          </el-main>
        </el-container>
      </el-container>
    </template>

    <!-- 移动端布局：van-nav-bar + 底部 tabbar -->
    <template v-else>
      <div :class="['mobile-page', { 'mobile-page--no-tabbar': !showTabbar }]">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['StatusList']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <van-tabbar
        v-if="showTabbar"
        v-model="activeIndex"
        placeholder
        active-color="#1989fa"
        inactive-color="#7d7e80"
      >
        <van-tabbar-item
          v-for="(item, i) in tabbarItems"
          :key="item.to"
          :icon="item.icon"
          @click="onTabClick(item, i)"
        >
          {{ item.label }}
        </van-tabbar-item>
      </van-tabbar>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onBeforeUnmount, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, ArrowDown, SwitchButton, HomeFilled, Edit, Clock, Operation, CircleCheck, Document } from '@element-plus/icons-vue'
import { CaseStatus } from '@/types'
import { STATUS_META } from '@/config/statusMeta'
import { useUserStore } from '@/stores/user'
import { useReconciliationStore } from '@/stores/reconciliation'
import { useEnterpriseStore } from '@/stores/enterprise'
import { useCaseLibraryStore } from '@/stores/caseLibrary'
import { MOBILE_ROLE_PARAM, ROLE_LABEL } from '@/config/constants'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recoStore = useReconciliationStore()
const enterpriseStore = useEnterpriseStore()
const caseLibStore = useCaseLibraryStore()

// ---------- 响应式：检测 PC / 移动 ----------
const DESKTOP_BREAKPOINT = 900
const isDesktop = ref(false)
let mql: MediaQueryList | null = null
function onMqlChange(e: MediaQueryListEvent) { isDesktop.value = e.matches }
onMounted(() => {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth >= DESKTOP_BREAKPOINT
    mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    mql.addEventListener('change', onMqlChange)
  }
  recoStore.init()
  enterpriseStore.init()
  caseLibStore.init()
})
onBeforeUnmount(() => { mql?.removeEventListener('change', onMqlChange) })

// 传给子页面
provide('isDesktop', isDesktop)

// ---------- 路由 / 角色 ----------
const roleParam = computed(() => {
  const r = route.params.role as string | undefined
  if (r) return r
  const role = userStore.role
  if (!role) return 'consumer'
  return MOBILE_ROLE_PARAM[role]
})

const base = computed(() => `/${route.path.split('/')[1]}/${roleParam.value}`)
const showTabbar = computed(() => Boolean(route.meta.tabbar))

// ---------- 移动端 tabbar ----------
const tabbarItems = computed(() => [
  { to: `${base.value}`, icon: 'home-o', label: '首页' },
  { to: `${base.value}/list/${CaseStatus.PENDING}`, icon: 'underway-o', label: STATUS_META[CaseStatus.PENDING].label },
  { to: `${base.value}/list/${CaseStatus.ACCEPTED}`, icon: 'records-o', label: STATUS_META[CaseStatus.ACCEPTED].label },
  { to: `${base.value}/list/${CaseStatus.IN_PROGRESS}`, icon: 'comment-o', label: STATUS_META[CaseStatus.IN_PROGRESS].label },
  { to: `${base.value}/list/ALL`, icon: 'apps-o', label: '全部' },
])

const activeIndex = ref(0)
watchEffect(() => {
  const idx = tabbarItems.value.findIndex((it) => route.path === it.to)
  if (idx >= 0) activeIndex.value = idx
})

function onTabClick(item: { to: string }, _i: number) {
  if (route.path !== item.to) router.push(item.to)
}

// ---------- PC 端侧边栏菜单 ----------
const roleLabel = computed(() => (userStore.role ? ROLE_LABEL[userStore.role] : '用户') ?? '用户')
const roleIcon = computed(() => {
  const r = userStore.role
  if (r === 'consumer') return '🧑'
  if (r === 'enterprise') return '🏢'
  return '📋'
})

type PcMenuItem = { to: string; label: string; icon: any }
const pcMenuItems = computed<PcMenuItem[]>(() => {
  const r = userStore.role
  const items: PcMenuItem[] = [
    { to: base.value, label: '首页概览', icon: HomeFilled },
  ]
  if (r === 'consumer') {
    items.push(
      { to: `${base.value}/initiate`, label: '发起和解', icon: Edit },
      { to: `${base.value}/list/PENDING`, label: '待受理', icon: Clock },
      { to: `${base.value}/list/IN_PROGRESS`, label: '和解中', icon: Operation },
      { to: `${base.value}/list/COMPLETED`, label: '和解完成', icon: CircleCheck },
      { to: `${base.value}/list/ALL`, label: '全部和解', icon: Document },
    )
  } else if (r === 'enterprise') {
    items.push(
      { to: `${base.value}/list/PENDING`, label: '待受理', icon: Clock },
      { to: `${base.value}/list/ACCEPTED`, label: '已受理', icon: Document },
      { to: `${base.value}/list/IN_PROGRESS`, label: '和解中', icon: Operation },
      { to: `${base.value}/list/ALL`, label: '全部和解', icon: Document },
    )
  } else {
    items.push(
      { to: `${base.value}/list/PENDING`, label: '待受理', icon: Clock },
      { to: `${base.value}/list/ACCEPTED`, label: '已受理', icon: Document },
      { to: `${base.value}/list/IN_PROGRESS`, label: '和解中', icon: Operation },
      { to: `${base.value}/list/ALL`, label: '全部和解', icon: Document },
    )
  }
  return items
})

const activeMenu = computed(() => {
  if (route.path === base.value) return base.value
  return route.path
})

const pageTitle = computed(() => {
  if (route.path === base.value) return `${roleLabel.value} · 首页`
  if (route.path.includes('/initiate')) return '发起和解'
  if (route.path.includes('/evaluate')) return '评价和解'
  if (route.params.status && route.params.status !== 'ALL') {
    const meta = STATUS_META[route.params.status as CaseStatus]
    return meta ? meta.label : '和解列表'
  }
  if (route.params.status === 'ALL') return '全部和解'
  if (route.path.includes('/case/')) return '和解详情'
  return ''
})

function go(path: string) {
  if (activeMenu.value !== path) router.push(path)
}

function goHome() {
  userStore.logout()
  router.push('/')
}

function onLogout() {
  ElMessageBox.confirm('确认退出登录？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      userStore.logout()
      router.push('/')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
/* ========== 移动端样式 ========== */
.mobile-shell {
  min-height: 100vh;
}
.mobile-page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background: #f7f8fa;
}
.mobile-page--no-tabbar { padding-bottom: 0; }

/* ========== PC 端样式 ========== */
.mobile-shell.is-pc {
  .pc-shell { height: 100vh; }
  .pc-header {
    background: #fff; border-bottom: 1px solid #e4e7ed;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
  }
  .pc-header__left { display: flex; align-items: center; gap: 10px; }
  .pc-header__logo { font-size: 22px; }
  .pc-header__title { font-size: 16px; font-weight: 600; color: #303133; }
  .pc-header__badge { margin-left: 4px; }
  .pc-header__right { display: flex; align-items: center; }
  .pc-header__user {
    display: flex; align-items: center; gap: 4px;
    cursor: pointer; color: #606266; font-size: 14px;
  }

  .pc-aside {
    background: #001529; overflow-y: auto;
  }
  .pc-menu { border-right: none; }

  .pc-main {
    background: #f0f2f5; padding: 20px;
  }
  .pc-content {
    border-radius: 8px;
  }
  .pc-content__title {
    margin-bottom: 16px;
    h2 { margin: 0; font-size: 18px; color: #303133; }
  }

  /* 隐藏子页面的 van-nav-bar（PC 下不需要） */
  :deep(.van-nav-bar) { display: none !important; }
  /* 子页面背景改为白色（PC 下 el-card 已包裹） */
  :deep(.home),
  :deep(.status-list),
  :deep(.case-detail-page),
  :deep(.initiate-page),
  :deep(.evaluate-page) {
    min-height: auto;
    background: transparent;
  }
}
</style>
