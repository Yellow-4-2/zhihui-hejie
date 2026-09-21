<template>
  <div class="login-page">
    <!-- 左侧品牌区（PC 显示） -->
    <div class="login-page__brand">
      <div class="brand-inner">
        <div class="brand-logo">⚖️</div>
        <div class="brand-title">智慧和解平台</div>
        <div class="brand-sub">浙江省消费者权益保护委员会</div>
        <div class="brand-features">
          <div class="brand-features__item">高效和解 · 快速处理消费纠纷</div>
          <div class="brand-features__item">多方协同 · 消保委 · 企业 · 消费者</div>
          <div class="brand-features__item">全流程可追溯 · 数据安全合规</div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-page__form-area">
      <div class="login-card">
        <div class="mobile-logo">⚖️</div>
        <h1 class="login-card__title">{{ formTitle }}</h1>
        <p class="login-card__sub">{{ formSubtitle }}</p>

        <!-- PC 端：Element Plus 表单（始终渲染，CSS 控制显隐） -->
        <el-form
          ref="elFormRef"
          class="form-pc"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          size="large"
          @keyup.enter="onPcSubmit"
        >
          <el-form-item label="账号" prop="account">
            <el-input
              v-model="loginForm.account"
              :prefix-icon="User"
              placeholder="请输入账号"
              maxlength="30"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              :prefix-icon="Lock"
              type="password"
              show-password
              placeholder="请输入密码"
              maxlength="30"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" size="large" :loading="loading" @click="onPcSubmit">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 移动端：Vant 表单（始终渲染，CSS 控制显隐） -->
        <div class="form-mobile">
          <PasswordLoginField :role="targetRole" @success="onSuccess" />
        </div>

        <div class="login-back" @click="$router.push('/')">
          ‹ 返回角色选择
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import PasswordLoginField from '@/components/PasswordLoginField.vue'
import { useUserStore } from '@/stores/user'
import { DEMO_CREDENTIALS } from '@/config/constants'
import { Role } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 仅用于登录成功后的跳转方向判断
const isPcRoute = ref(route.path.startsWith('/login/pc'))

const targetRole = ref(isPcRoute.value ? Role.COMMITTEE_PC : Role.COMMITTEE_M)
const formTitle = ref(isPcRoute.value ? '消保委（PC端）登录' : '消保委（移动端）登录')
const formSubtitle = ref(isPcRoute.value ? '欢迎使用智慧和解平台管理系统' : '使用账号密码登录')

const loading = ref(false)
const elFormRef = ref<FormInstance>()
const demo = DEMO_CREDENTIALS[targetRole.value]
const loginForm = ref({ account: demo.account!, password: demo.password! })
const loginRules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

function onPcSubmit() {
  if (!elFormRef.value) return
  elFormRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      const ok = userStore.loginByAccount(targetRole.value, loginForm.value.account!, loginForm.value.password!)
      loading.value = false
      if (!ok) { ElMessage.error('账号或密码错误'); return }
      onSuccess()
    }, 300)
  })
}

function onSuccess() {
  router.push(isPcRoute.value ? '/pc' : '/m/committee')
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* 品牌区（PC 显示） */
.login-page__brand {
  display: none;
}

/* 表单区 */
.login-page__form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 380px;
}
.mobile-logo {
  font-size: 48px;
  text-align: center;
  margin-bottom: 8px;
}
.login-card__title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin-bottom: 6px;
}
.login-card__sub {
  font-size: 14px;
  color: #909399;
  text-align: center;
  margin-bottom: 28px;
}
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}
.login-back {
  margin-top: 16px;
  text-align: center;
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
}

/* 默认：移动端隐藏 PC 表单，显示移动表单 */
.form-pc { display: none; }
.form-mobile { display: block; }

/* PC 响应式：显示 PC 表单，隐藏移动表单 */
@media (min-width: 900px) {
  .form-pc { display: block; }
  .form-mobile { display: none; }

  .login-page {
    flex-direction: row;
  }

  .login-page__brand {
    display: flex;
    flex: 1;
    background: linear-gradient(135deg, #1a4ba0 0%, #1989fa 60%, #40a9ff 100%);
    color: #fff;
    align-items: center;
    justify-content: center;
    padding: 60px;
    text-align: center;
  }
  .brand-inner {
    max-width: 420px;
    text-align: center;
  }
  .brand-logo {
    font-size: 72px;
    line-height: 1;
    margin-bottom: 24px;
  }
  .brand-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  .brand-sub {
    font-size: 15px;
    opacity: 0.85;
    margin-bottom: 48px;
  }
  .brand-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
  }
  .brand-features__item {
    font-size: 14px;
    padding-left: 0;
    padding-top: 20px;
    position: relative;
    opacity: 0.9;
    &::before {
      content: '✓';
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      font-weight: bold;
    }
  }

  .login-page__form-area {
    width: 480px;
    flex: none;
    background: #fff;
  }
  .login-card {
    max-width: 360px;
  }
  .mobile-logo {
    display: none;
  }
  .login-card__title {
    text-align: left;
    font-size: 26px;
  }
  .login-card__sub {
    text-align: left;
    margin-bottom: 32px;
  }
}
</style>
