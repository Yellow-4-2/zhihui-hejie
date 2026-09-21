<template>
  <div class="login-demo-page">
    <van-nav-bar title="接口 Demo 登录" />

    <!-- 已登录：展示当前身份 -->
    <template v-if="currentUser">
      <van-cell-group inset title="当前登录身份">
        <van-cell title="姓名" :value="currentUser.name" />
        <van-cell title="邮箱" :value="currentUser.email" />
        <van-cell title="角色">
          <template #value>
            <van-tag :color="roleMeta(currentUser.role).color">
              {{ roleMeta(currentUser.role).label }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell v-if="currentUser.enterpriseId" title="关联企业" :value="currentUser.enterpriseId" />
      </van-cell-group>

      <div class="buttons">
        <van-button round block type="primary" @click="goManage">进入用户管理</van-button>
        <van-button round block plain type="danger" @click="logout">退出登录</van-button>
      </div>
    </template>

    <!-- 未登录：登录表单 -->
    <template v-else>
      <van-notice-bar
        wrapable
        text="以下账号由后端启动时自动预置，密码统一为 123456。点击账号可快速填充。"
      />

      <van-cell-group inset title="选择账号快速填充" class="account-list">
        <van-cell
          v-for="acc in accounts"
          :key="acc.email"
          :title="acc.name"
          is-link
          @click="fillAccount(acc.email)"
        >
          <template #label>{{ acc.email }}</template>
          <template #value>
            <van-tag :color="roleMeta(acc.role).color">{{ roleMeta(acc.role).label }}</van-tag>
          </template>
        </van-cell>
      </van-cell-group>

      <van-form @submit="onLogin">
        <van-cell-group inset style="margin-top: 12px">
          <van-field
            v-model="form.email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { pattern: emailReg, message: '邮箱格式不正确' },
            ]"
          />
          <van-field
            v-model="form.password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>
        <div class="buttons">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
      </van-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Role } from '@/types'
import { login, fetchProfile } from '@/api/auth'
import { setToken, clearToken, getToken } from '@/api/http'
import type { User } from '@/api/users'
import { ROLE_META } from './roleMeta'

const router = useRouter()

const accounts = [
  { name: '消费者小王', email: 'consumer@test.com', role: Role.CONSUMER },
  { name: '某品牌企业', email: 'enterprise@test.com', role: Role.ENTERPRISE },
  { name: '消保委调解员', email: 'committee-m@test.com', role: Role.COMMITTEE_M },
  { name: '消保委管理员', email: 'committee-pc@test.com', role: Role.COMMITTEE_PC },
]

const form = reactive({ email: '', password: '123456' })
const loading = ref(false)
const currentUser = ref<User | null>(null)

const emailReg = /^[\w.+-]+@[\w-]+\.[\w.-]+$/
const roleMeta = (role: Role) => ROLE_META[role]

function fillAccount(email: string) {
  form.email = email
  form.password = '123456'
}

async function onLogin() {
  loading.value = true
  try {
    const result = await login({ email: form.email, password: form.password })
    setToken(result.accessToken)
    currentUser.value = result.user
    showToast('登录成功')
  } catch (e) {
    showToast((e as Error).message)
  } finally {
    loading.value = false
  }
}

async function logout() {
  clearToken()
  currentUser.value = null
  form.email = ''
  showToast('已退出登录')
}

function goManage() {
  router.push('/users')
}

onMounted(async () => {
  // 已持有 token 时，拉取最新身份信息直接进入登录态
  if (getToken()) {
    try {
      currentUser.value = await fetchProfile()
    } catch {
      /* 401 时 http 层会清 token 并留在本页 */
    }
  }
})
</script>

<style scoped lang="scss">
.login-demo-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 24px;
}

.account-list {
  margin-top: 12px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 16px 8px;
}
</style>
