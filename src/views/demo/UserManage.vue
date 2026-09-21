<template>
  <div class="user-manage-page">
    <van-nav-bar title="用户管理" left-arrow @click-left="onBack">
      <template #right>
        <span class="logout-link" @click="logout">退出</span>
      </template>
    </van-nav-bar>

    <!-- 搜索 + 新增 -->
    <div class="toolbar">
      <van-search
        v-model="keyword"
        shape="round"
        placeholder="搜索姓名 / 邮箱"
        @search="loadUsers"
        @clear="loadUsers"
      />
      <van-button type="primary" size="small" icon="plus" @click="openCreate">
        新增
      </van-button>
    </div>

    <!-- 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="loading" class="hint">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <van-empty v-else-if="users.length === 0" description="暂无用户，点上方按钮新增" />

      <van-cell-group v-else inset class="user-list">
        <van-cell v-for="user in users" :key="user.id" center>
          <template #title>
            <div class="user-title">
              <span class="user-name">{{ user.name }}</span>
              <van-tag :color="roleMeta(user.role).color">{{ roleMeta(user.role).label }}</van-tag>
            </div>
            <div class="user-email">{{ user.email }}</div>
            <div v-if="user.enterpriseId" class="user-email">关联企业：{{ user.enterpriseId }}</div>
          </template>
          <template #value>
            <div class="actions">
              <van-button size="mini" plain type="primary" @click="openEdit(user)">编辑</van-button>
              <van-button size="mini" plain type="danger" @click="onDelete(user)">删除</van-button>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </van-pull-refresh>

    <!-- 新增 / 编辑弹层 -->
    <van-popup v-model:show="showForm" position="bottom" round>
      <div class="form-title">{{ editingId ? '编辑用户' : '新增用户' }}</div>
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field
            v-model="form.email"
            label="邮箱"
            placeholder="请输入邮箱（即登录账号）"
            :readonly="!!editingId"
            :rules="[{ pattern: emailReg, message: '邮箱格式不正确' }]"
          />
          <!-- 角色选择 -->
          <van-field
            :model-value="roleMeta(form.role).label"
            label="角色"
            is-link
            readonly
            placeholder="请选择角色"
            @click="showRolePicker = true"
            :rules="[{ required: true, message: '请选择角色' }]"
          />
          <!-- 企业角色才显示关联企业 -->
          <van-field
            v-if="form.role === Role.ENTERPRISE"
            v-model="form.enterpriseId"
            label="关联企业ID"
            placeholder="如 E001"
            :rules="[{ required: true, message: '请填写关联企业ID' }]"
          />
          <!-- 密码：新增必填；编辑可留空 -->
          <van-field
            v-model="form.password"
            label="密码"
            type="password"
            :placeholder="editingId ? '留空则不修改' : '至少 6 位'"
            :rules="
              editingId
                ? [{ validator: optionalPassword, message: '密码至少 6 位' }]
                : [
                    { required: true, message: '请输入密码' },
                    { validator: optionalPassword, message: '密码至少 6 位' },
                  ]
            "
          />
        </van-cell-group>
        <div class="form-buttons">
          <van-button round block type="primary" native-type="submit">确定</van-button>
          <van-button round block plain @click="showForm = false">取消</van-button>
        </div>
      </van-form>
    </van-popup>

    <!-- 角色选择器 -->
    <van-popup v-model:show="showRolePicker" position="bottom" round>
      <van-picker
        :columns="roleColumns"
        @confirm="onRoleConfirm"
        @cancel="showRolePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { Role } from '@/types'
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from '@/api/users'
import { getToken, clearToken } from '@/api/http'
import { ROLE_META } from './roleMeta'

const router = useRouter()

const users = ref<User[]>([])
const keyword = ref('')
const loading = ref(false)
const refreshing = ref(false)

const showForm = ref(false)
const showRolePicker = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  email: '',
  password: '',
  role: Role.CONSUMER,
  enterpriseId: '',
})

const emailReg = /^[\w.+-]+@[\w-]+\.[\w.-]+$/
const optionalPassword = (val: string) => !val || val.length >= 6

const roleMeta = (role: Role) => ROLE_META[role]
// van-picker 列：text/value
const roleColumns = Object.values(Role).map((r) => ({
  text: ROLE_META[r].label,
  value: r,
}))

/** 拉取列表 */
async function loadUsers() {
  loading.value = true
  try {
    users.value = await fetchUsers(keyword.value.trim())
  } catch (e) {
    showToast((e as Error).message)
  } finally {
    loading.value = false
  }
}

async function onRefresh() {
  await loadUsers()
  refreshing.value = false
}

function openCreate() {
  editingId.value = null
  form.name = ''
  form.email = ''
  form.password = ''
  form.role = Role.CONSUMER
  form.enterpriseId = ''
  showForm.value = true
}

function openEdit(user: User) {
  editingId.value = user.id
  form.name = user.name
  form.email = user.email
  form.password = ''
  form.role = user.role
  form.enterpriseId = user.enterpriseId ?? ''
  showForm.value = true
}

function onRoleConfirm({ selectedValues }: { selectedValues: string[] }) {
  form.role = selectedValues[0] as Role
  // 切到非企业角色时清掉企业ID
  if (form.role !== Role.ENTERPRISE) form.enterpriseId = ''
  showRolePicker.value = false
}

/** 提交 */
async function onSubmit() {
  try {
    if (editingId.value) {
      await updateUser(editingId.value, {
        name: form.name,
        role: form.role,
        enterpriseId: form.role === Role.ENTERPRISE ? form.enterpriseId : undefined,
        ...(form.password ? { password: form.password } : {}),
      })
      showToast('修改成功')
    } else {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        enterpriseId: form.role === Role.ENTERPRISE ? form.enterpriseId : undefined,
      })
      showToast('新增成功')
    }
    showForm.value = false
    await loadUsers()
  } catch (e) {
    showToast((e as Error).message)
  }
}

async function onDelete(user: User) {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除用户「${user.name}」吗？`,
    })
    await deleteUser(user.id)
    showToast('删除成功')
    await loadUsers()
  } catch (e) {
    if (e instanceof Error && e.message) showToast(e.message)
  }
}

function logout() {
  clearToken()
  router.replace('/demo')
}

function onBack() {
  router.back()
}

onMounted(() => {
  // 未登录直接跳 Demo 登录页
  if (!getToken()) {
    router.replace('/demo')
    return
  }
  loadUsers()
})
</script>

<style scoped lang="scss">
.user-manage-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.logout-link {
  font-size: 13px;
  color: #ee0a24;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;

  .van-search {
    flex: 1;
  }
}

.hint {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.user-list {
  margin-top: 8px;

  .user-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-name {
    font-size: 15px;
    font-weight: 600;
    color: #323233;
  }

  .user-email {
    margin-top: 4px;
    font-size: 12px;
    color: #969799;
  }
}

.actions {
  display: flex;
  gap: 8px;
}

.form-title {
  padding: 20px 0 8px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.form-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 16px 32px;
}
</style>
