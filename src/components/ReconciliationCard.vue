<template>
  <div class="reco-card" @click="$emit('click')">
    <div class="reco-card__head">
      <span class="reco-card__no">{{ caseData.caseNo }}</span>
      <StatusBadge :status="caseData.status" />
    </div>
    <div class="reco-card__row">
      <span class="reco-card__label">商品</span>
      <span class="reco-card__value text-ellipsis">{{ caseData.commodity }}</span>
    </div>
    <div class="reco-card__row">
      <span class="reco-card__label">企业</span>
      <span class="reco-card__value text-ellipsis">{{ caseData.enterpriseName || '待分配' }}</span>
    </div>
    <div class="reco-card__row">
      <span class="reco-card__label">金额</span>
      <span class="reco-card__value">¥{{ caseData.amount }}</span>
    </div>
    <div class="reco-card__desc text-ellipsis">{{ caseData.description }}</div>
    <div class="reco-card__foot">
      <span class="text-secondary">{{ formatTime(caseData.updatedAt) }}</span>
      <span v-if="showArrow" class="reco-card__arrow">›</span>
    </div>
    <div v-if="$slots.actions" class="reco-card__actions" @click.stop>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReconciliationCase } from '@/types'
import StatusBadge from './StatusBadge.vue'
import { formatTime } from '@/utils/date'

defineProps<{ caseData: ReconciliationCase; showArrow?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.reco-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}
.reco-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.reco-card__no {
  font-size: 13px;
  color: #969799;
}
.reco-card__row {
  display: flex;
  font-size: 13px;
  line-height: 22px;
}
.reco-card__label {
  color: #969799;
  width: 48px;
  flex-shrink: 0;
}
.reco-card__value {
  color: #323233;
  flex: 1;
}
.reco-card__desc {
  font-size: 13px;
  color: #646566;
  margin-top: 4px;
}
.reco-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ebedf0;
}
.reco-card__arrow {
  font-size: 18px;
  color: #c8c9cc;
  line-height: 1;
}
.reco-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f2f3f5;
}
</style>
