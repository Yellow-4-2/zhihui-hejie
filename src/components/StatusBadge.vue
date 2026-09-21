<template>
  <!-- PC 端使用 Element Plus el-tag -->
  <el-tag
    v-if="variant === 'pc'"
    :type="elTagType"
    :effect="effect"
    :size="size"
    :color="safeMeta.color"
    style="border: none"
  >
    {{ safeMeta.label }}
  </el-tag>
  <!-- 移动端保留原有 span 样式 -->
  <span v-else class="status-badge" :style="{ background: safeMeta.color }">{{ safeMeta.label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CaseStatus } from '@/types'
import { STATUS_META } from '@/config/statusMeta'

// status 有可能是 undefined/null（mock 数据或后端异常），做安全兜底
const FALLBACK_META = { label: '未知状态', color: '#909399' }

const props = withDefaults(
  defineProps<{
    status?: CaseStatus | null
    /** 'pc' = Element Plus el-tag；默认/不传 = 移动端 van 风格 span */
    variant?: 'pc' | 'mobile'
    size?: 'small' | 'default' | 'large'
    effect?: 'dark' | 'light' | 'plain'
  }>(),
  { variant: 'mobile', size: 'default', effect: 'dark' },
)

const safeMeta = computed(() => {
  const s = props.status as CaseStatus | undefined
  if (!s) return FALLBACK_META
  return STATUS_META[s] ?? FALLBACK_META
})

const elTagType = computed((): 'success' | 'warning' | 'danger' | 'info' | 'primary' | '' => {
  const s = props.status as CaseStatus | undefined
  switch (s) {
    case 'COMPLETED':
    case 'FINISHED':
    case 'EVALUATED':
      return 'success'
    case 'FAILED':
    case 'REJECTED':
      return 'danger'
    case 'IN_PROGRESS':
      return 'warning'
    default:
      return ''
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  line-height: 1.6;
}
</style>
