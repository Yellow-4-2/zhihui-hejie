<template>
  <div class="role-switch">
    <header class="role-switch__topbar">
      <div class="role-switch__brand">
        <span class="role-switch__logo">⚖️</span>
        <div>
          <div class="role-switch__title">智慧和解平台</div>
          <div class="role-switch__sub">浙江省消费者权益保护委员会</div>
        </div>
      </div>
    </header>

    <div class="role-switch__body">
      <div class="role-switch__hero">
        <h2 class="role-switch__hero-title">请选择您的角色</h2>
      </div>

      <div class="role-switch__grid">
        <div
          v-for="r in roles"
          :key="r.label"
          class="role-switch__item"
          @click="onSelect(r)"
        >
          <div class="role-switch__icon" :style="{ background: r.color }">{{ r.icon }}</div>
          <div class="role-switch__name">{{ r.label }}</div>
          <div class="role-switch__desc">{{ r.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 消保委两端合并：点击后根据屏幕宽度自动决定去 PC 还是移动入口
const roles = computed(() => {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 900
  return [
    {
      label: '消保委',
      desc: '账号密码登录',
      icon: '⚖️',
      color: '#1989fa',
      to: isDesktop ? '/login/pc' : '/login/m/committee',
    },
    {
      label: '消费者',
      desc: '手机验证码登录',
      icon: '🧑',
      color: '#ff976a',
      to: '/login/m/consumer',
    },
    {
      label: '入驻企业',
      desc: '手机验证码登录',
      icon: '🏢',
      color: '#7232dd',
      to: '/login/m/enterprise',
    },
  ]
})

function onSelect(r: (typeof roles.value)[number]) {
  router.push(r.to)
}
</script>

<style scoped lang="scss">
.role-switch {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* PC 顶部栏 */
.role-switch__topbar {
  display: none;
  background: linear-gradient(90deg, #1a4ba0 0%, #1989fa 100%);
  padding: 0 32px;
  height: 64px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(26, 75, 160, 0.25);
}
.role-switch__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #fff;
}
.role-switch__logo {
  font-size: 28px;
  line-height: 1;
}
.role-switch__title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}
.role-switch__sub {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
}

/* 移动端 hero */
.role-switch__hero {
  text-align: center;
  padding: 40px 24px 20px;
}
.role-switch__hero-title {
  font-size: 20px;
  color: #1a4ba0;
}

.role-switch__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 卡片区 */
.role-switch__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0 16px 24px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
.role-switch__item {
  background: #fff;
  border-radius: 10px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
}
.role-switch__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 75, 160, 0.12);
  border-color: #1989fa;
}
.role-switch__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 auto 8px;
  color: #fff;
}
.role-switch__name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.role-switch__desc {
  font-size: 11px;
  color: #909399;
  margin-top: 3px;
}

/* PC 响应式（>= 900px） */
@media (min-width: 900px) {
  .role-switch__topbar {
    display: flex;
  }
  .role-switch__hero {
    padding: 48px 24px 32px;
  }
  .role-switch__hero-title {
    font-size: 24px;
  }
  .role-switch__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 0 32px;
    max-width: 780px;
  }
  .role-switch__item {
    padding: 28px 16px 24px;
    border-radius: 12px;
  }
  .role-switch__icon {
    width: 52px;
    height: 52px;
    font-size: 26px;
    margin-bottom: 12px;
  }
  .role-switch__name {
    font-size: 16px;
  }
  .role-switch__desc {
    font-size: 12px;
    margin-top: 4px;
  }
}
</style>
