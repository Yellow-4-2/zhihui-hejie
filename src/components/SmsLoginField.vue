<template>
  <div class="login-field">
    <van-cell-group inset>
      <van-field
        v-model="phone"
        label="手机号"
        placeholder="请输入手机号"
        clearable
        type="tel"
        maxlength="11"
        left-icon="phone-o"
      />
      <van-field
        v-model="code"
        label="验证码"
        placeholder="请输入验证码"
        clearable
        maxlength="6"
        left-icon="shield-o"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :disabled="countdown > 0"
            @click="onSendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </van-button>
        </template>
      </van-field>
    </van-cell-group>
    <div class="login-field__btn">
      <van-button type="primary" block round @click="onSubmit">登录</van-button>
    </div>
    <div class="login-field__tip">
      演示手机：<b>{{ demo.phone }}</b> 验证码：<b>{{ demo.code }}</b>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { DEMO_CREDENTIALS, SMS_MOCK_CODE } from '@/config/constants'
import { useSms } from '@/composables/useSms'
import type { Role } from '@/types'

const props = defineProps<{ role: Role }>()
const emit = defineEmits<{ success: [] }>()

const userStore = useUserStore()
const phone = ref((DEMO_CREDENTIALS[props.role] as any).phone ?? '')
const code = ref((DEMO_CREDENTIALS[props.role] as any).code ?? '')
const demo = DEMO_CREDENTIALS[props.role]
const { countdown, start } = useSms()

function onSendCode() {
  if (!/^1\d{10}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  start()
  showToast({ message: `验证码：${SMS_MOCK_CODE}`, duration: 3000 })
}

function onSubmit() {
  if (!/^1\d{10}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!code.value) {
    showToast('请输入验证码')
    return
  }
  const ok = userStore.loginMobile(props.role, phone.value, code.value)
  if (!ok) {
    showToast('手机号或验证码错误')
    return
  }
  emit('success')
}
</script>

<style scoped>
.login-field {
  padding: 16px 0;
}
.login-field__btn {
  padding: 20px 16px 8px;
}
.login-field__tip {
  text-align: center;
  font-size: 12px;
  color: #969799;
  padding: 4px 16px;
}
</style>
