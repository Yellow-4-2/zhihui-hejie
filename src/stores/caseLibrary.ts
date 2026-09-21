import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CaseLibraryEntry } from '@/types'
import { MOCK_CASE_LIBRARY } from '@/mock/caseLibrary'

export const useCaseLibraryStore = defineStore('caseLibrary', () => {
  const entries = ref<CaseLibraryEntry[]>([...MOCK_CASE_LIBRARY])

  const byCategory = computed(() => {
    const map: Record<string, CaseLibraryEntry[]> = {}
    for (const e of entries.value) {
      ;(map[e.category] ??= []).push(e)
    }
    return map
  })

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

  return { entries, byCategory, search, getById }
})
