<template>
  <van-popup
    v-model:show="innerShow"
    position="bottom"
    round
    :style="{ height: '70%' }"
    teleport="body"
  >
    <div class="picker">
      <van-search v-model="keyword" placeholder="搜索案例标题/类别" shape="round" />
      <div class="picker__list">
        <div
          v-for="item in list"
          :key="item.id"
          class="picker__item"
          :class="{ active: selectedIds.includes(item.id) }"
          @click="toggle(item.id)"
        >
          <div class="picker__item-head">
            <span class="picker__item-title">{{ item.title }}</span>
            <van-icon v-if="selectedIds.includes(item.id)" name="success" color="#1989fa" />
          </div>
          <div class="picker__item-meta">
            <van-tag plain type="primary">{{ item.category }}</van-tag>
            <span class="text-secondary">¥{{ item.amount }}</span>
          </div>
          <div class="picker__item-summary">{{ item.summary }}</div>
          <div class="picker__item-suggestion">建议：{{ item.suggestion }}</div>
        </div>
        <van-empty v-if="!list.length" description="未找到案例" />
      </div>
      <div class="picker__footer">
        <van-button block type="primary" round @click="onConfirm">
          确认引用（{{ selectedIds.length }}）
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCaseLibraryStore } from '@/stores/caseLibrary'

const props = defineProps<{ show: boolean; modelValue: string[] }>()
const emit = defineEmits<{
  'update:show': [v: boolean]
  'update:modelValue': [v: string[]]
}>()

const caseLibStore = useCaseLibraryStore()
const keyword = ref('')
const selectedIds = ref<string[]>([...props.modelValue])

const innerShow = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
})

const list = computed(() => caseLibStore.search(keyword.value))

function toggle(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function onConfirm() {
  emit('update:modelValue', selectedIds.value)
  innerShow.value = false
}
</script>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.picker__list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}
.picker__item {
  background: #fff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}
.picker__item.active {
  border-color: #1989fa;
  background: #e6f4ff;
}
.picker__item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.picker__item-title {
  font-size: 14px;
  font-weight: 500;
}
.picker__item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.picker__item-summary {
  font-size: 12px;
  color: #646566;
  margin-top: 6px;
}
.picker__item-suggestion {
  font-size: 12px;
  color: #1989fa;
  margin-top: 4px;
}
.picker__footer {
  padding: 10px 16px;
  border-top: 1px solid #ebedf0;
}
</style>
