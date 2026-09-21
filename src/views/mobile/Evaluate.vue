<template>
  <div class="evaluate-page">
    <van-nav-bar title="评价此次和解" left-arrow @click-left="onBack" />
    <div class="page-section">
      <div class="card" v-if="currentCase">
        <div class="flex-between">
          <span class="text-secondary">{{ currentCase.caseNo }}</span>
          <StatusBadge :status="currentCase.status" />
        </div>
        <div class="mt-8">{{ currentCase.commodity }} · ¥{{ currentCase.amount }}</div>
      </div>
      <van-empty v-else description="未找到案例" />
      <div class="card" v-if="currentCase">
        <div class="section-title" style="padding-top: 0">满意度评价</div>
        <div class="evaluate-rate">
          <van-rate v-model="rating" :size="28" />
          <span class="text-secondary">{{ ratingText }}</span>
        </div>
        <van-field
          v-model="comment"
          rows="3"
          autosize
          type="textarea"
          label="评价内容"
          placeholder="说说您对此次和解的感受"
          style="margin-top: 12px"
        />
        <div style="padding: 16px 0 0">
          <van-button round block type="primary" @click="onSubmit">提交评价</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { ReconciliationCase } from '@/types'
import { useReconciliationStore } from '@/stores/reconciliation'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const recoStore = useReconciliationStore()

const currentCase = computed<ReconciliationCase | undefined>(() =>
  recoStore.getById(route.params.id as string),
)

const rating = ref<1 | 2 | 3 | 4 | 5>(5)
const comment = ref('')

const ratingText = computed(() => {
  return ['', '很不满意', '不满意', '一般', '满意', '非常满意'][rating.value] ?? ''
})

function onSubmit() {
  const ok = recoStore.evaluate(route.params.id as string, rating.value, comment.value)
  if (ok) {
    showToast('评价成功，感谢您的反馈')
    setTimeout(() => router.replace('/m/consumer'), 600)
  }
}

function onBack() {
  router.back()
}
</script>

<style scoped>
.evaluate-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.evaluate-rate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}
</style>
