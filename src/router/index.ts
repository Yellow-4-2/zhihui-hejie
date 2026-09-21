import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import BlankLayout from '@/layouts/BlankLayout.vue'
import { pcRoutes } from './routes.pc'
import { mobileRoutes } from './routes.mobile'
import { setupGuards } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: BlankLayout,
    children: [
      { path: '', component: () => import('@/views/portal/RoleSelect.vue') },
      { path: 'login/pc', component: () => import('@/views/portal/LoginCommittee.vue') },
      { path: 'login/m/committee', component: () => import('@/views/portal/LoginCommittee.vue') },
      { path: 'login/m/consumer', component: () => import('@/views/portal/LoginConsumer.vue') },
      { path: 'login/m/enterprise', component: () => import('@/views/portal/LoginEnterprise.vue') },
    ],
  },
  ...pcRoutes,
  ...mobileRoutes,
  // NestJS 接口联调 Demo（公开页面）
  { path: '/demo', component: () => import('@/views/demo/LoginDemo.vue') },
  { path: '/users', component: () => import('@/views/demo/UserManage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

setupGuards(router)

export default router
