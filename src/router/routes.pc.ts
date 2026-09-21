import type { RouteRecordRaw } from 'vue-router'
import PcLayout from '@/layouts/PcLayout.vue'

export const pcRoutes: RouteRecordRaw[] = [
  {
    path: '/pc',
    component: PcLayout,
    meta: { requiresPc: true },
    children: [
      { path: '', component: () => import('@/views/pc/Dashboard.vue') },
      { path: 'users', component: () => import('@/views/pc/UserSettings.vue') },
      { path: 'brands', component: () => import('@/views/pc/Brands.vue') },
      { path: 'case-library', component: () => import('@/views/pc/CaseLibrary.vue') },
      { path: 'pending', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'PENDING' } },
      { path: 'accepted', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'ACCEPTED' } },
      { path: 'in-progress', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'IN_PROGRESS' } },
      { path: 'completed', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'COMPLETED' } },
      { path: 'failed', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'FAILED' } },
      { path: 'finished', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'FINISHED' } },
      { path: 'rejected', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'REJECTED' } },
      { path: 'evaluated', component: () => import('@/views/pc/StatusPcPage.vue'), props: { status: 'EVALUATED' } },
      { path: 'search', component: () => import('@/views/pc/SearchAll.vue') },
    ],
  },
]
