import { http } from './http'
import type { CaseLibraryEntry } from '@/types'

/** 获取案例库列表（可搜索） */
export function fetchCaseLibrary(keyword = ''): Promise<CaseLibraryEntry[]> {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  return http<CaseLibraryEntry[]>(`/api/case-library${query}`)
}

/** 获取单个案例 */
export function fetchCaseLibraryById(id: string): Promise<CaseLibraryEntry> {
  return http<CaseLibraryEntry>(`/api/case-library/${id}`)
}
