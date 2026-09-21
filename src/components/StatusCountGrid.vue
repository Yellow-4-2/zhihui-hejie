<template>
  <div class="count-grid">
    <div
      v-for="s in statuses"
      :key="s"
      class="count-grid__item"
      @click="$emit('select', s)"
    >
      <div class="count-grid__num" :style="{ color: STATUS_META[s].color }">
        {{ counts[s] ?? 0 }}
      </div>
      <div class="count-grid__label">{{ STATUS_META[s].label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CaseStatus } from '@/types'
import { STATUS_META } from '@/config/statusMeta'

defineProps<{
  statuses: CaseStatus[]
  counts: Record<string, number>
}>()
defineEmits<{ select: [status: CaseStatus] }>()
</script>

<style scoped>
.count-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #ebedf0;
  border-radius: 8px;
  overflow: hidden;
}
.count-grid__item {
  background: #fff;
  padding: 14px 4px;
  text-align: center;
  cursor: pointer;
}
.count-grid__num {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}
.count-grid__label {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}
</style>
