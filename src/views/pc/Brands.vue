<template>
  <div>
    <div class="pc-toolbar">
      <div class="pc-toolbar__left">
        <h2 class="pc-page-title">品牌入驻</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>系统管理</el-breadcrumb-item>
          <el-breadcrumb-item>品牌入驻</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-input
        v-model="keyword"
        placeholder="搜索企业名称/类别"
        clearable
        :prefix-icon="Search"
        style="width: 280px"
      />
    </div>

    <PcTable :columns="columns" :data="list" border>
      <template #settledAt="{ row }">{{ formatDate(row.settledAt) }}</template>
    </PcTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useEnterpriseStore } from '@/stores/enterprise'
import PcTable, { type PcColumn } from '@/components/PcTable.vue'
import { formatDate } from '@/utils/date'

const enterpriseStore = useEnterpriseStore()
const keyword = ref('')

const list = computed(() => enterpriseStore.search(keyword.value))
const columns: PcColumn[] = [
  { key: 'id', title: '企业ID', width: '120px' },
  { key: 'name', title: '企业名称', width: '180px' },
  { key: 'category', title: '类别', width: '120px' },
  { key: 'contactPhone', title: '联系电话', width: '160px' },
  { key: 'settledAt', title: '入驻时间', width: '170px' },
]
</script>
