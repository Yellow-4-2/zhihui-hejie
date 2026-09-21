<template>
  <div>
    <div class="pc-toolbar">
      <div class="pc-toolbar__left">
        <h2 class="pc-page-title">用户设置（权限组管理）</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/pc' }">系统管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户设置</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-button type="primary" :icon="Plus" @click="onAdd">新增用户</el-button>
    </div>

    <PcTable :columns="columns" :data="rows" border>
      <template #role="{ row }">
        <el-tag type="primary" effect="light">{{ ROLE_LABEL[row.role as Role] }}</el-tag>
      </template>
      <template #action="{ index }">
        <el-button type="danger" text @click="onRemove(index)">移除</el-button>
      </template>
    </PcTable>

    <p class="text-secondary" style="margin-top: 16px">
      提示：使用"智慧和解"平台的人员都需要在对应的权限组中添加。当前为演示数据，仅前端展示。
    </p>

    <!-- 新增用户 Dialog -->
    <el-dialog
      v-model="addShow"
      title="新增用户"
      width="460px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="请输入姓名" maxlength="30" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="form.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="权限组" required>
          <el-select v-model="form.role" placeholder="选择权限组" style="width: 100%">
            <el-option
              v-for="opt in groupOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
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
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Role, type MockUser } from '@/types'
import { ROLE_LABEL } from '@/config/constants'
import { MOCK_USERS } from '@/mock/users'
import PcTable, { type PcColumn } from '@/components/PcTable.vue'

const rows = ref<MockUser[]>([...MOCK_USERS])
const columns: PcColumn[] = [
  { key: 'name', title: '姓名', width: '120px' },
  { key: 'role', title: '角色', width: '160px' },
  { key: 'account', title: '账号', width: '140px' },
  { key: 'phone', title: '手机号', width: '140px' },
  { key: 'enterpriseId', title: '企业ID', width: '100px' },
  { key: 'action', title: '操作', width: '100px', fixed: 'right' },
]

const groupOptions = [
  { label: '消保委管理员', value: Role.COMMITTEE_PC },
  { label: '消保委移动端', value: Role.COMMITTEE_M },
  { label: '消费者', value: Role.CONSUMER },
  { label: '入驻企业', value: Role.ENTERPRISE },
]

const addShow = ref(false)
const form = reactive({ name: '', account: '', password: '', role: '' })

function onAdd() {
  form.name = ''
  form.account = ''
  form.password = ''
  form.role = ''
  addShow.value = true
}

function onConfirmAdd() {
  if (!form.name || !form.role) {
    ElMessage.warning('请填写完整信息')
    return
  }
  rows.value.push({
    id: `u-${Date.now()}`,
    role: form.role as Role,
    account: form.account || undefined,
    password: form.password || undefined,
    name: form.name,
  })
  addShow.value = false
  ElMessage.success('已新增用户（仅演示）')
}

function onRemove(index: number) {
  rows.value.splice(index, 1)
}
</script>
