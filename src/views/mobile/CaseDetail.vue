<template>
  <div class="case-detail-page">
    <van-nav-bar title="和解详情" left-arrow @click-left="onBack" />
    <div class="page-section">
      <CaseDetailView :case-data="currentCase">
        <template v-if="currentCase" #actions>
          <ActionSheet
            :case-data="currentCase"
            :role="userStore.role"
            @view="() => {}"
            @done="onDone"
            @evaluate="goEvaluate"
          />
        </template>
      </CaseDetailView>
      <van-empty v-if="!currentCase" description="未找到该案例" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ReconciliationCase } from '@/types'
import { useReconciliationStore } from '@/stores/reconciliation'
import { useUserStore } from '@/stores/user'
import CaseDetailView from '@/components/CaseDetailView.vue'
import ActionSheet from '@/components/ActionSheet.vue'

const route = useRoute()
const router = useRouter()
const recoStore = useReconciliationStore()
const userStore = useUserStore()

const version = ref(0)
const currentCase = computed<ReconciliationCase | undefined>(() => {
  void version.value
  return recoStore.getById(route.params.id as string)
})

function onDone() {
  version.value += 1
}
function goEvaluate() {
  router.push(`/m/consumer/evaluate/${route.params.id}`)
}
function onBack() {
  router.back()
}
</script>

<style scoped>
.case-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
