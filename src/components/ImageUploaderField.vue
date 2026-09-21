<template>
  <van-uploader
    v-model="fileList"
    :max-count="maxCount"
    :max-size="maxSize"
    multiple
    :after-read="onAfterRead"
    @oversize="onOversize"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast, type UploaderFileListItem } from 'vant'

const props = withDefaults(
  defineProps<{ modelValue: string[]; maxCount?: number; maxSize?: number }>(),
  { maxCount: 6, maxSize: 5 * 1024 * 1024 },
)
const emit = defineEmits<{ 'update:modelValue': [val: string[]] }>()

const fileList = ref<UploaderFileListItem[]>(
  props.modelValue.map((url) => ({ url, isImage: true }) as UploaderFileListItem),
)

watch(
  () => props.modelValue,
  (v) => {
    const existing = fileList.value.map((f) => f.url).filter(Boolean)
    if (existing.join('|') !== v.join('|')) {
      fileList.value = v.map((url) => ({ url, isImage: true }) as UploaderFileListItem)
    }
  },
)

function onAfterRead(items: UploaderFileListItem | UploaderFileListItem[]) {
  const arr = Array.isArray(items) ? items : [items]
  const urls: string[] = []
  for (const it of arr) {
    if (it.file) {
      urls.push(URL.createObjectURL(it.file))
    } else if (it.url) {
      urls.push(it.url)
    }
  }
  const all = [...props.modelValue, ...urls]
  emit('update:modelValue', all)
}

function onOversize() {
  showToast('图片不能超过 5MB')
}
</script>
