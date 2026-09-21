<template>
  <div class="action-sheet">
    <van-button
      v-for="a in actions"
      :key="a.type"
      :type="btnType(a.variant)"
      size="small"
      :plain="a.variant === 'default'"
      @click="onAction(a)"
    >
      {{ a.label }}
    </van-button>
  </div>

  <!-- 选择企业（受理） -->
  <van-popup v-model:show="enterprisePickerShow" position="bottom" round teleport="body">
    <van-picker
      :columns="enterpriseColumns"
      title="选择入驻企业"
      @confirm="onEnterpriseConfirm"
      @cancel="enterprisePickerShow = false"
    />
  </van-popup>

  <!-- 不受理原因 -->
  <van-dialog
    v-model:show="rejectDialogShow"
    title="不受理"
    show-cancel-button
    @confirm="onRejectConfirm"
  >
    <van-field
      v-model="rejectRemark"
      rows="2"
      autosize
      type="textarea"
      placeholder="请填写不受理备注"
      style="margin: 12px 0"
    />
  </van-dialog>

  <!-- 发起和解建议 -->
  <van-popup
    v-model:show="suggestionShow"
    position="bottom"
    round
    closeable
    :style="{ height: '70%' }"
    teleport="body"
  >
    <div class="popup-form">
      <div class="popup-form__title">发起和解建议</div>
      <van-field
        v-model="suggestionContent"
        rows="4"
        autosize
        type="textarea"
        label="建议内容"
        placeholder="请填写和解建议"
      />
      <div class="section-title">引用和解案例库</div>
      <div class="popup-form__refs">
        <van-tag
          v-for="id in suggestionRefIds"
          :key="id"
          closeable
          type="primary"
          plain
          @close="removeRef(id)"
        >
          {{ caseLibStore.getById(id)?.title ?? id }}
        </van-tag>
        <van-button size="small" icon="add-o" plain @click="pickerShow = true">
          添加引用
        </van-button>
      </div>
      <div class="popup-form__btn">
        <van-button type="primary" block round @click="onSuggestionConfirm">
          提交并进入和解中
        </van-button>
      </div>
    </div>
  </van-popup>
  <CaseLibraryPicker v-model:show="pickerShow" v-model="suggestionRefIds" />

  <!-- 消保委和解确认（记录消费者决定） -->
  <van-dialog
    v-model:show="committeeConfirmShow"
    title="和解确认"
    show-cancel-button
    :confirm-button-text="committeeAgreed ? '确认' : '提交'"
    @confirm="onCommitteeConfirm"
  >
    <div style="padding: 16px; text-align: center">
      <div class="text-secondary" style="margin-bottom: 12px">消费者是否同意和解方案？</div>
      <van-radio-group v-model="committeeAgreed" direction="horizontal">
        <van-radio :name="true">同意</van-radio>
        <van-radio :name="false">不同意</van-radio>
      </van-radio-group>
    </div>
  </van-dialog>

  <!-- 完成和解（上传凭证） -->
  <van-popup
    v-model:show="completeShow"
    position="bottom"
    round
    closeable
    :style="{ height: '60%' }"
    teleport="body"
  >
    <div class="popup-form">
      <div class="popup-form__title">完成和解</div>
      <div class="section-title">上传和解完成凭证</div>
      <ImageUploaderField v-model="completeImages" :max-count="6" />
      <div class="popup-form__btn">
        <van-button type="primary" block round @click="onCompleteConfirm">
          提交完成和解
        </van-button>
      </div>
    </div>
  </van-popup>

  <!-- 回访确认 -->
  <van-dialog
    v-model:show="returnVisitShow"
    title="回访确认"
    show-cancel-button
    @confirm="onReturnVisitConfirm"
  >
    <van-field
      v-model="returnRemark"
      rows="2"
      autosize
      type="textarea"
      placeholder="请填写回访备注"
      style="margin: 12px 0"
    />
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import type { ReconciliationCase, ActionDef, Role } from '@/types'
import { useCaseActions } from '@/composables/useCaseActions'
import { useReconciliationStore } from '@/stores/reconciliation'
import { useEnterpriseStore } from '@/stores/enterprise'
import { useCaseLibraryStore } from '@/stores/caseLibrary'
import CaseLibraryPicker from './CaseLibraryPicker.vue'
import ImageUploaderField from './ImageUploaderField.vue'

const props = defineProps<{ caseData: ReconciliationCase; role: Role | null }>()
const emit = defineEmits<{
  done: []
  view: []
  evaluate: []
}>()

const recoStore = useReconciliationStore()
const enterpriseStore = useEnterpriseStore()
const caseLibStore = useCaseLibraryStore()

const { actions } = useCaseActions(() => props.caseData, props.role)

function btnType(v: ActionDef['variant']) {
  if (v === 'primary') return 'primary' as const
  if (v === 'danger') return 'danger' as const
  return 'default' as const
}

// 各弹窗状态
const enterprisePickerShow = ref(false)
const enterpriseColumns = computed(() =>
  enterpriseStore.list.map((e) => ({ text: e.name, value: e.id })),
)

const rejectDialogShow = ref(false)
const rejectRemark = ref('')

const suggestionShow = ref(false)
const suggestionContent = ref('')
const suggestionRefIds = ref<string[]>([])
const pickerShow = ref(false)

const committeeConfirmShow = ref(false)
const committeeAgreed = ref(true)

const completeShow = ref(false)
const completeImages = ref<string[]>([])

const returnVisitShow = ref(false)
const returnRemark = ref('')

const actionType = ref<ActionDef['type']>('view_detail')

function onAction(a: ActionDef) {
  actionType.value = a.type
  switch (a.type) {
    case 'view_detail':
      emit('view')
      break
    case 'verify_accept':
      enterprisePickerShow.value = true
      break
    case 'verify_reject':
      rejectRemark.value = ''
      rejectDialogShow.value = true
      break
    case 'propose_suggestion':
      suggestionContent.value = ''
      suggestionRefIds.value = []
      suggestionShow.value = true
      break
    case 'committee_confirm':
      committeeAgreed.value = true
      committeeConfirmShow.value = true
      break
    case 'consumer_agree':
      showConfirmDialog({ title: '提示', message: '确认同意该和解方案？' })
        .then(() => {
          recoStore.consumerConfirm(props.caseData.id, true)
          showToast('已同意和解')
          emit('done')
        })
        .catch(() => {})
      break
    case 'consumer_disagree':
      showConfirmDialog({ title: '提示', message: '确认不同意该和解方案？' })
        .then(() => {
          recoStore.consumerConfirm(props.caseData.id, false)
          showToast('已不同意')
          emit('done')
        })
        .catch(() => {})
      break
    case 'complete_reconcile':
      completeImages.value = []
      completeShow.value = true
      break
    case 'return_visit':
      returnRemark.value = ''
      returnVisitShow.value = true
      break
    case 'evaluate':
      emit('evaluate')
      break
  }
}

function onEnterpriseConfirm({ selectedValues }: { selectedValues: string[] }) {
  const eid = selectedValues[0]
  const ent = enterpriseStore.getById(eid)
  if (!ent) return
  enterprisePickerShow.value = false
  // 先关闭弹窗，再在 nextTick 变更状态+提示，避免同步重渲染打断弹窗关闭导致白壳残留
  nextTick(() => {
    const ok = recoStore.acceptCase(props.caseData.id, ent.id, ent.name)
    if (ok) {
      showToast('已受理并分配企业')
      emit('done')
    }
  })
}

function onRejectConfirm() {
  if (!rejectRemark.value.trim()) {
    showToast('请填写不受理备注')
    return
  }
  const remark = rejectRemark.value
  rejectDialogShow.value = false
  nextTick(() => {
    const ok = recoStore.rejectCase(props.caseData.id, remark)
    if (ok) {
      showToast('已标记不受理')
      emit('done')
    }
  })
}

function removeRef(id: string) {
  suggestionRefIds.value = suggestionRefIds.value.filter((x) => x !== id)
}

function onSuggestionConfirm() {
  if (!suggestionContent.value.trim()) {
    showToast('请填写和解建议')
    return
  }
  const content = suggestionContent.value
  const refs = [...suggestionRefIds.value]
  suggestionShow.value = false
  nextTick(() => {
    const ok = recoStore.proposeSuggestion(props.caseData.id, content, refs)
    if (ok) {
      showToast('已发起和解建议')
      emit('done')
    }
  })
}

function onCommitteeConfirm() {
  const agreed = committeeAgreed.value
  committeeConfirmShow.value = false
  nextTick(() => {
    const ok = recoStore.committeeConfirm(props.caseData.id, agreed)
    if (ok) {
      showToast(agreed ? '已记录：同意和解' : '已记录：不同意')
      emit('done')
    }
  })
}

function onCompleteConfirm() {
  const images = [...completeImages.value]
  completeShow.value = false
  nextTick(() => {
    const ok = recoStore.completeReconcile(props.caseData.id, images)
    if (ok) {
      showToast('已完成和解')
      emit('done')
    }
  })
}

function onReturnVisitConfirm() {
  if (!returnRemark.value.trim()) {
    showToast('请填写回访备注')
    return
  }
  const remark = returnRemark.value
  returnVisitShow.value = false
  nextTick(() => {
    const ok = recoStore.returnVisit(props.caseData.id, remark)
    if (ok) {
      showToast('回访确认完成')
      emit('done')
    }
  })
}
</script>

<style scoped>
.action-sheet {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.popup-form {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}
.popup-form__title {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
}
.popup-form__refs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
}
.popup-form__btn {
  padding: 20px 0 8px;
}
</style>
