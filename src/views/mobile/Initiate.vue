<template>
  <div class="initiate-page">
    <van-nav-bar :title="pageTitle" left-arrow @click-left="onBack" />
    <van-form @submit="onSubmit">
      <van-cell-group inset style="margin-top: 12px">
        <template v-if="needConsumer">
          <van-field
            v-model="form.consumerName"
            label="消费者姓名"
            placeholder="请输入消费者姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field
            v-model="form.consumerPhone"
            label="消费者手机"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }, { validator: phoneRule, message: '手机号格式不正确' }]"
          />
        </template>
        <template v-if="needEnterprise">
          <van-field
            v-model="form.enterpriseName"
            label="企业名称"
            placeholder="请输入企业名称"
            :rules="[{ required: true, message: '请输入企业名称' }]"
          />
        </template>
        <van-field
          v-model="form.commodity"
          label="商品/服务"
          placeholder="请输入商品或服务名称"
          :rules="[{ required: true, message: '请输入商品' }]"
        />
        <van-field
          v-model="form.amount"
          label="争议金额"
          type="number"
          placeholder="请输入金额（元）"
          :rules="[{ required: true, message: '请输入金额' }]"
        />
        <van-field
          v-model="form.description"
          rows="3"
          autosize
          type="textarea"
          label="问题描述"
          placeholder="请描述纠纷情况"
          :rules="[{ required: true, message: '请描述问题' }]"
        />
      </van-cell-group>
      <div style="padding: 24px 16px">
        <van-button round block type="primary" native-type="submit">提交和解申请</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Role } from '@/types'
import { useUserStore } from '@/stores/user'
import { useReconciliationStore } from '@/stores/reconciliation'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recoStore = useReconciliationStore()

const role = computed(() => userStore.role)

const needConsumer = computed(() => role.value !== Role.CONSUMER)
const needEnterprise = computed(() => role.value !== Role.ENTERPRISE)

const pageTitle = computed(() => '我要和解')

const form = reactive({
  consumerName: '',
  consumerPhone: '',
  enterpriseName: '',
  commodity: '',
  amount: '',
  description: '',
})

// 消费者发起：自动填充自身信息（可改）
if (role.value === Role.CONSUMER) {
  form.consumerName = userStore.name || ''
  form.consumerPhone = userStore.phone || ''
}
// 企业发起：自动填充企业名
if (role.value === Role.ENTERPRISE) {
  // enterpriseName 从当前企业用户推导（用 name 作为企业名简化）
  form.enterpriseName = userStore.name?.replace('客服', '') || ''
}

function phoneRule(v: string) {
  return /^1\d{10}$/.test(v)
}

async function onSubmit() {
  const c = await recoStore.initiateCase({
    consumerName: form.consumerName || userStore.name || '',
    consumerPhone: form.consumerPhone || userStore.phone || '',
    enterpriseName: form.enterpriseName || undefined,
    commodity: form.commodity,
    amount: Number(form.amount) || 0,
    description: form.description,
    initiator: role.value as Role,
  })
  if (!c) {
    showToast('提交失败，请重试')
    return
  }
  showToast('提交成功')
  setTimeout(() => {
    router.replace(`/m/${route.params.role}/case/${c.id}`)
  }, 600)
}

function onBack() {
  router.back()
}
</script>

<style scoped>
.initiate-page {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
