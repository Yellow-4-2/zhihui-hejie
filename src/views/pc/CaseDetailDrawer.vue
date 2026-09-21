<template>
  <el-drawer
    v-model="innerShow"
    title="案例详情"
    size="520px"
    direction="rtl"
    class="pc-drawer"
    :close-on-click-modal="true"
  >
    <template v-if="currentCase">
      <CaseDetailView :case-data="currentCase">
        <template v-if="currentCase" #actions>
          <ActionSheet
            :case-data="currentCase"
            :role="Role.COMMITTEE_PC"
            @done="onDone"
            @view="() => {}"
          />
        </template>
      </CaseDetailView>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Role, type ReconciliationCase } from '@/types'
import { useReconciliationStore } from '@/stores/reconciliation'
import CaseDetailView from '@/components/CaseDetailView.vue'
import ActionSheet from '@/components/ActionSheet.vue'

const props = defineProps<{ show: boolean; caseId?: string }>()
const emit = defineEmits<{ 'update:show': [v: boolean]; refresh: [] }>()

const recoStore = useReconciliationStore()

const innerShow = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
})

const currentCase = computed<ReconciliationCase | undefined>(() =>
  props.caseId ? recoStore.getById(props.caseId) : undefined,
)

function onDone() {
  emit('refresh')
}
</script>

<style scoped>
.pc-drawer {
  .el-drawer__body {
    background: #f7f8fa;
    padding: 12px 16px;
  }
}
</style>
