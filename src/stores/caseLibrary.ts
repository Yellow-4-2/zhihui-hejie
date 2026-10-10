import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CaseLibraryEntry } from '@/types'
import { fetchCaseLibrary } from '@/api/caseLibrary'

export const useCaseLibraryStore = defineStore('caseLibrary', () => {
  const entries = ref<CaseLibraryEntry[]>([])
  const loaded = ref(false)

  const byCategory = computed(() => {
    const map: Record<string, CaseLibraryEntry[]> = {}
    for (const e of entries.value) {
      ;(map[e.category] ??= []).push(e)
    }
    return map
  })

  async function init() {
    if (loaded.value) return
    try {
      entries.value = await fetchCaseLibrary()
      loaded.value = true
    } catch (e) {
      console.error('fetch case library failed:', e)
    }
  }

  function search(keyword: string): CaseLibraryEntry[] {
    const k = keyword.trim().toLowerCase()
    if (!k) return entries.value
    return entries.value.filter(
      (e) =>
        e.title.toLowerCase().includes(k) ||
        e.category.toLowerCase().includes(k) ||
        e.summary.toLowerCase().includes(k),
    )
  }

  function getById(id: string): CaseLibraryEntry | undefined {
    return entries.value.find((e) => e.id === id)
  }

  return { entries, byCategory, loaded, init, search, getById }
})
