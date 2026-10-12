import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Enterprise } from '@/types'
import { fetchEnterprises, createEnterprise } from '@/api/enterprises'

export const useEnterpriseStore = defineStore('enterprise', () => {
  const enterprises = ref<Enterprise[]>([])
  const loaded = ref(false)

  const list = computed(() => enterprises.value)

  async function init() {
    if (loaded.value) return
    try {
      enterprises.value = await fetchEnterprises()
      loaded.value = true
    } catch (e) {
      console.error('fetch enterprises failed:', e)
    }
  }

  async function create(data: Omit<Enterprise, 'id' | 'settledAt'>) {
    const ent = await createEnterprise(data)
    enterprises.value = [...enterprises.value, ent]
    return ent
  }

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

  return { enterprises, list, loaded, init, create, getById, search }
})
