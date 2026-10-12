<template>
  <el-table
    :data="data"
    :border="border"
    :max-height="maxHeight"
    stripe
    :row-style="{ height: '48px' }"
    :cell-style="{ padding: '0 12px' }"
    style="width: 100%"
    @row-click="(row: T) => $emit('row-click', row)"
  >
    <el-table-column
      v-for="col in columns"
      :key="col.key"
      :prop="col.key"
      :label="col.title"
      :width="col.width"
      :min-width="col.minWidth"
      :align="col.align ?? 'left'"
      :header-align="col.headerAlign ?? col.align ?? 'left'"
      :fixed="col.fixed"
      :sortable="col.sortable"
      show-overflow-tooltip
    >
      <template #default="{ row, $index }">
        <slot :name="col.key" :row="row" :index="$index">
          {{ (row as Record<string, unknown>)[col.key] }}
        </slot>
      </template>
    </el-table-column>

    <!-- 空状态 -->
    <template #empty>
      <el-empty description="暂无数据" :image-size="80" />
    </template>
  </el-table>
</template>

<script setup lang="ts" generic="T">
export interface PcColumn {
  key: string
  title: string
  width?: string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
}

defineProps<{
  columns: PcColumn[]
  data: T[]
  border?: boolean
  maxHeight?: string | number
}>()

defineEmits<{
  (e: 'row-click', row: T): void
}>()
</script>
