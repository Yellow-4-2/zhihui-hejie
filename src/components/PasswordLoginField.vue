<template>
  <div class="login-field">
    <van-cell-group inset>
      <van-field
        v-model="account"
        label="账号"
        placeholder="请输入账号"
        clearable
        :left-icon="accountIcon"
      />
      <van-field
        v-model="password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        clearable
        :left-icon="lockIcon"
      />
    </van-cell-group>
    <div class="login-field__btn">
      <van-button type="primary" block round @click="onSubmit">登录</van-button>
    </div>
    <div class="login-field__tip">
      演示账号：<b>{{ demo.account }}</b> 密码：<b>{{ demo.password }}</b>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { DEMO_CREDENTIALS } from '@/config/constants'
import type { Role } from '@/types'

const props = defineProps<{ role: Role }>()
const emit = defineEmits<{ success: [] }>()

const userStore = useUserStore()
const account = ref(DEMO_CREDENTIALS[props.role].account ?? '')
const password = ref(DEMO_CREDENTIALS[props.role].password ?? '')
const demo = DEMO_CREDENTIALS[props.role]
const accountIcon = 'manager-o'
const lockIcon = 'lock'

function onSubmit() {
  if (!account.value || !password.value) {
    showToast('请输入账号和密码')
    return
  }
  const ok = userStore.loginByAccount(props.role, account.value, password.value)
  if (!ok) {
    showToast('账号或密码错误')
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
