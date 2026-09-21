<template>
  <div class="timeline">
    <div v-for="(item, i) in items" :key="i" class="timeline-item">
      <div class="timeline-dot" :style="{ background: colorOf(item.status) }"></div>
      <div class="timeline-line" v-if="i < items.length - 1"></div>
      <div class="timeline-content">
        <div class="timeline-head">
          <span class="timeline-status" :style="{ color: colorOf(item.status) }">
            {{ labelOf(item.status) }}
          </span>
          <span class="timeline-time">{{ formatTime(item.at) }}</span>
        </div>
        <div class="timeline-op">{{ item.operator }}</div>
        <div v-if="item.remark" class="timeline-remark">{{ item.remark }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatusTimelineItem } from '@/types'
import { STATUS_META } from '@/config/statusMeta'
import { formatTime } from '@/utils/date'

defineProps<{ items: StatusTimelineItem[] }>()

function colorOf(s: StatusTimelineItem['status']) {
  return STATUS_META[s].color
}
function labelOf(s: StatusTimelineItem['status']) {
  return STATUS_META[s].label
}
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 4px;
}
.timeline-item {
  position: relative;
  padding-left: 20px;
  padding-bottom: 16px;
}
.timeline-dot {
  position: absolute;
  left: 2px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}
.timeline-line {
  position: absolute;
  left: 6px;
  top: 16px;
  bottom: 0;
  width: 2px;
  background: #ebedf0;
}
.timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.timeline-status {
  font-size: 14px;
  font-weight: 500;
}
.timeline-time {
  font-size: 12px;
  color: #969799;
}
.timeline-op {
  font-size: 12px;
  color: #646566;
  margin-top: 2px;
}
.timeline-remark {
  font-size: 13px;
  color: #323233;
  margin-top: 4px;
  background: #f7f8fa;
  padding: 6px 8px;
  border-radius: 4px;
}
</style>
