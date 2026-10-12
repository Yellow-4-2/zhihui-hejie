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
      <div class="brands-toolbar__right">
        <el-input
          v-model="keyword"
          placeholder="搜索企业名称/类别"
          clearable
          :prefix-icon="Search"
          style="width: 240px"
        />
        <el-button type="primary" :icon="Plus" @click="onAdd">新增品牌</el-button>
      </div>
    </div>

    <PcTable :columns="columns" :data="list" border>
      <template #settledAt="{ row }">{{ formatDate(row.settledAt) }}</template>
    </PcTable>

    <!-- 新增品牌 Dialog -->
    <el-dialog
      v-model="addShow"
      title="新增入驻品牌"
      width="460px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="企业名称" required>
          <el-input v-model="form.name" placeholder="请输入企业名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="类别" required>
          <el-input v-model="form.category" placeholder="如：家电、数码、零售" maxlength="20" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" maxlength="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addShow = false">取消</el-button>
        <el-button type="primary" @click="onConfirmAdd">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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

const addShow = ref(false)
const form = reactive({ name: '', category: '', contactPhone: '' })

onMounted(() => enterpriseStore.init())

function onAdd() {
  form.name = ''
  form.category = ''
  form.contactPhone = ''
  addShow.value = true
}

async function onConfirmAdd() {
  if (!form.name.trim() || !form.category.trim() || !form.contactPhone.trim()) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    await enterpriseStore.create({
      name: form.name.trim(),
      category: form.category.trim(),
      contactPhone: form.contactPhone.trim(),
    })
    addShow.value = false
    ElMessage.success('新增成功')
  } catch (e) {
    ElMessage.error((e as Error).message || '新增失败')
  }
}
</script>

<style scoped>
.brands-toolbar__right {
  display: flex;
  gap: 8px;
}
</style>
