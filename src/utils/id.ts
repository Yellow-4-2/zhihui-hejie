// 简单唯一 id 生成器
let counter = 0
export function genId(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}

export function genCaseNo(seq: number): string {
  return `CASE-2022-${String(seq).padStart(4, '0')}`
}
