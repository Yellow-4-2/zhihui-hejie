<template>
  <div class="login-page">
    <div class="login-page__brand">
      <div class="brand-inner">
        <div class="brand-logo">🧑</div>
        <div class="brand-title">消费者登录</div>
        <div class="brand-sub">保护您的合法权益 · 快速和解消费纠纷</div>
        <div class="brand-features">
          <div class="brand-features__item">免费提交消费纠纷</div>
          <div class="brand-features__item">全程线上处理 · 实时进度</div>
          <div class="brand-features__item">专业消保委调解</div>
        </div>
      </div>
    </div>

    <div class="login-page__form-area">
      <div class="login-card">
        <div class="mobile-logo">🧑</div>
        <h1 class="login-card__title">消费者登录</h1>
        <p class="login-card__sub">手机验证码登录</p>

        <el-form
          ref="elFormRef"
          class="form-pc"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          size="large"
          @keyup.enter="onPcSubmit"
        >
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="loginForm.phone" :prefix-icon="Iphone" placeholder="请输入手机号" maxlength="11" />
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <div class="sms-row">
              <el-input v-model="loginForm.code" :prefix-icon="Key" placeholder="请输入6位验证码" maxlength="6" />
              <el-button :disabled="countdown > 0" @click="sendSms">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" size="large" :loading="loading" @click="onPcSubmit">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-mobile">
          <SmsLoginField :role="Role.CONSUMER" @success="onSuccess" />
        </div>

        <div class="login-back" @click="$router.push('/')">‹ 返回角色选择</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Iphone, Key } from '@element-plus/icons-vue'
import SmsLoginField from '@/components/SmsLoginField.vue'
import { useUserStore } from '@/stores/user'
import { DEMO_CREDENTIALS, SMS_MOCK_CODE } from '@/config/constants'
import { Role } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const elFormRef = ref<FormInstance>()
const countdown = ref(0)
let timer: number | null = null
const demo = DEMO_CREDENTIALS[Role.CONSUMER]
const loginForm = ref({ phone: (demo as any).phone, code: (demo as any).code })
const loginRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

function sendSms() {
  countdown.value = 60
  ElMessage.success(`验证码已发送（演示：${SMS_MOCK_CODE}）`)
  timer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) { clearInterval(timer); timer = null }
  }, 1000)
}

function onPcSubmit() {
  if (!elFormRef.value) return
  elFormRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      const ok = userStore.loginMobile(Role.CONSUMER, loginForm.value.phone, loginForm.value.code)
      loading.value = false
      if (!ok) { ElMessage.error('手机号或验证码错误'); return }
      onSuccess()
    }, 300)
  })
}

function onSuccess() { router.push('/m/consumer') }
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.form-pc { display: none; }
.form-mobile { display: block; }
.login-page__brand { display: none; }
.login-page__form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-card { width: 100%; max-width: 380px; }
.mobile-logo { font-size: 48px; text-align: center; margin-bottom: 8px; }
.login-card__title { font-size: 22px; font-weight: 600; color: #303133; text-align: center; margin-bottom: 6px; }
.login-card__sub { font-size: 14px; color: #909399; text-align: center; margin-bottom: 28px; }
.login-btn { width: 100%; height: 44px; font-size: 16px; }
.login-back { margin-top: 16px; text-align: center; color: #1989fa; font-size: 14px; cursor: pointer; }
.sms-row { display: flex; gap: 8px; width: 100%;
  :deep(.el-input) { flex: 1; }
}

@media (min-width: 900px) {
  .form-pc { display: block; }
  .form-mobile { display: none; }

  .login-page { flex-direction: row; }
  .login-page__brand {
    display: flex; flex: 1;
    background: linear-gradient(135deg, #ff6b35 0%, #ff976a 100%);
    color: #fff; align-items: center; justify-content: center; padding: 60px; text-align: center;
  }
  .brand-inner { max-width: 420px; text-align: center; }
  .brand-logo { font-size: 72px; line-height: 1; margin-bottom: 24px; }
  .brand-title { font-size: 32px; font-weight: 600; margin-bottom: 10px; }
  .brand-sub { font-size: 15px; opacity: 0.9; margin-bottom: 48px; }
  .brand-features { display: flex; flex-direction: column; gap: 14px; align-items: center; }
  .brand-features__item { font-size: 14px; opacity: 0.95; padding-top: 20px; position: relative;
    &::before { content: '✓'; position: absolute; left: 50%; top: 0; transform: translateX(-50%); font-weight: bold; }
  }
  .login-page__form-area { width: 480px; flex: none; background: #fff; }
  .login-card { max-width: 360px; }
  .mobile-logo { display: none; }
  .login-card__title { text-align: left; font-size: 26px; }
  .login-card__sub { text-align: left; margin-bottom: 32px; }
}
</style>
