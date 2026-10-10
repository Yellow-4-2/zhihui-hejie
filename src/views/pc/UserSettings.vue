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
      <template #action="{ row }">
        <el-button type="danger" text @click="onRemove(row)">移除</el-button>
      </template>
    </PcTable>

    <p class="text-secondary" style="margin-top: 16px">
      提示：使用"智慧和解"平台的人员都需要在对应的权限组中添加。数据已持久化到后端，刷新后不丢失。
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
        <el-form-item label="邮箱" required>
          <el-input v-model="form.account" placeholder="请输入邮箱（作为登录账号）" />
        </el-form-item>
        <el-form-item label="密码" required>
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
        <el-form-item v-if="form.role === Role.ENTERPRISE" label="企业ID" required>
          <el-input v-model="form.enterpriseId" placeholder="请输入关联企业ID，如 E001" />
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
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Role } from '@/types'
import { ROLE_LABEL } from '@/config/constants'
import { createUser, deleteUser, fetchUsers, type User } from '@/api/users'
import PcTable, { type PcColumn } from '@/components/PcTable.vue'

const rows = ref<User[]>([])
const columns: PcColumn[] = [
  { key: 'name', title: '姓名', width: '120px' },
  { key: 'role', title: '角色', width: '160px' },
  { key: 'email', title: '邮箱（账号）', width: '200px' },
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
const form = reactive({ name: '', account: '', password: '', role: '', enterpriseId: '' })

async function loadUsers() {
  try {
    rows.value = await fetchUsers()
  } catch (e) {
    ElMessage.error((e as Error).message || '加载用户失败')
  }
}
onMounted(loadUsers)

function onAdd() {
  form.name = ''
  form.account = ''
  form.password = ''
  form.role = ''
  form.enterpriseId = ''
  addShow.value = true
}

async function onConfirmAdd() {
  if (!form.name || !form.role) {
    ElMessage.warning('请填写姓名和权限组')
    return
  }
  const email = form.account.trim()
  if (!email || !email.includes('@')) {
    ElMessage.warning('请填写正确的邮箱')
    return
  }
  if (!form.password) {
    ElMessage.warning('请填写密码')
    return
  }
  const isEnterprise = form.role === Role.ENTERPRISE
  if (isEnterprise && !form.enterpriseId.trim()) {
    ElMessage.warning('企业角色必须填写关联企业ID')
    return
  }
  try {
    await createUser({
      name: form.name,
      email,
      password: form.password,
      role: form.role as Role,
      enterpriseId: isEnterprise ? form.enterpriseId.trim() : undefined,
    })
    addShow.value = false
    ElMessage.success('新增成功')
    await loadUsers()
  } catch (e) {
    ElMessage.error((e as Error).message || '新增失败')
  }
}

async function onRemove(row: User) {
  try {
    await deleteUser(row.id)
    ElMessage.success('已移除')
    await loadUsers()
  } catch (e) {
    ElMessage.error((e as Error).message || '移除失败')
  }
}
</script>
