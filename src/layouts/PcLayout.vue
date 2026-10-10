<template>
  <el-container class="pc-shell">
    <!-- 顶部 -->
    <el-header class="pc-header" height="56px">
      <div class="pc-header__left">
        <span class="pc-header__logo">⚖️</span>
        <span class="pc-header__title">智慧和解平台</span>
        <el-tag type="primary" effect="dark" size="small" class="pc-header__badge">
          消保委（PC端）
        </el-tag>
      </div>
      <div class="pc-header__right">
        <el-dropdown trigger="click">
          <span class="pc-header__user">
            <el-icon><User /></el-icon>
            {{ userStore.name || '管理员' }}
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
      <!-- 侧边栏 -->
      <el-aside width="220px" class="pc-aside">
        <el-menu
          :default-active="activeMenu"
          :default-openeds="['workbench', 'system', 'reconciliation']"
          background-color="#001529"
          text-color="rgba(255,255,255,0.75)"
          active-text-color="#ffffff"
          class="pc-menu"
          @select="go"
        >
          <el-sub-menu index="workbench">
            <template #title>
              <el-icon><Grid /></el-icon>工作台
            </template>
            <el-menu-item index="/pc">概览面板</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>系统管理
            </template>
            <el-menu-item index="/pc/users">用户设置</el-menu-item>
            <el-menu-item index="/pc/brands">品牌入驻</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="reconciliation">
            <template #title>
              <el-icon><Document /></el-icon>和解业务
            </template>
            <el-menu-item index="/pc/case-library">和解案例库</el-menu-item>
            <el-menu-item index="/pc/pending">待受理</el-menu-item>
            <el-menu-item index="/pc/accepted">已受理</el-menu-item>
            <el-menu-item index="/pc/in-progress">和解中</el-menu-item>
            <el-menu-item index="/pc/completed">和解完成</el-menu-item>
            <el-menu-item index="/pc/failed">和解失败</el-menu-item>
            <el-menu-item index="/pc/finished">已完结</el-menu-item>
            <el-menu-item index="/pc/rejected">不受理</el-menu-item>
            <el-menu-item index="/pc/evaluated">已评价</el-menu-item>
            <el-menu-item index="/pc/search">综合查询</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容 -->
      <el-main class="pc-main">
        <el-card shadow="never" class="pc-content">
          <router-view />
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useReconciliationStore } from '@/stores/reconciliation'
import { useEnterpriseStore } from '@/stores/enterprise'
import { useCaseLibraryStore } from '@/stores/caseLibrary'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const recoStore = useReconciliationStore()
const enterpriseStore = useEnterpriseStore()
const caseLibStore = useCaseLibraryStore()

onMounted(() => {
  recoStore.init()
  enterpriseStore.init()
  caseLibStore.init()
})

const activeMenu = computed(() => {
  // Dashboard 路径是 /pc，保持激活
  if (route.path === '/pc') return '/pc'
  return route.path
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
