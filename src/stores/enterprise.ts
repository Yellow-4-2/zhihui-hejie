import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Enterprise } from '@/types'
import { MOCK_ENTERPRISES } from '@/mock/enterprises'

export const useEnterpriseStore = defineStore('enterprise', () => {
  const enterprises = ref<Enterprise[]>([...MOCK_ENTERPRISES])

  const list = computed(() => enterprises.value)

  function getById(id?: string): Enterprise | undefined {
    if (!id) return undefined
    return enterprises.value.find((e) => e.id === id)
  }

  function search(keyword: string): Enterprise[] {
    const k = keyword.trim().toLowerCase()
    if (!k) return enterprises.value
    return enterprises.value.filter(
      (e) => e.name.toLowerCase().includes(k) || e.category.toLowerCase().includes(k),
    )
  }

  return { enterprises, list, getById, search }
})
