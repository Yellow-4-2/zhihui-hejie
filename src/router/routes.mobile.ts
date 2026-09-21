import type { RouteRecordRaw } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'

export const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/m/:role',
    component: MobileLayout,
    meta: { requiresMobile: true },
    children: [
      { path: '', component: () => import('@/views/mobile/Home.vue'), meta: { tabbar: true } },
      {
        path: 'list/:status',
        component: () => import('@/views/mobile/StatusList.vue'),
        meta: { tabbar: true },
      },
      { path: 'initiate', component: () => import('@/views/mobile/Initiate.vue') },
      { path: 'case/:id', component: () => import('@/views/mobile/CaseDetail.vue') },
      { path: 'evaluate/:id', component: () => import('@/views/mobile/Evaluate.vue') },
    ],
  },
]
