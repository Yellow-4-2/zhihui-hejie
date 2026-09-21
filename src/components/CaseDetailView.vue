<template>
  <div class="case-detail">
    <div v-if="!caseData" class="empty-wrap">未找到案例</div>
    <template v-else>
      <div class="card">
        <div class="case-detail__head">
          <span class="case-detail__no">{{ caseData.caseNo }}</span>
          <StatusBadge :status="caseData.status" />
        </div>
        <van-cell-group :border="false">
          <van-cell title="商品" :value="caseData.commodity" />
          <van-cell title="金额" :value="`¥${caseData.amount}`" />
          <van-cell title="消费者" :value="`${caseData.consumerName}（${caseData.consumerPhone}）`" />
          <van-cell title="被诉企业" :value="caseData.enterpriseName || '待分配'" />
          <van-cell title="发起时间" :value="formatTime(caseData.createdAt)" />
        </van-cell-group>
      </div>

      <div class="card">
        <div class="section-title" style="padding-top: 0">纠纷描述</div>
        <div class="case-detail__desc">{{ caseData.description }}</div>
      </div>

      <div v-if="caseData.rejectRemark" class="card">
        <div class="section-title" style="padding-top: 0">不受理原因</div>
        <div class="case-detail__desc case-detail__desc--warn">{{ caseData.rejectRemark }}</div>
      </div>

      <div v-if="caseData.suggestion" class="card">
        <div class="section-title" style="padding-top: 0">和解建议</div>
        <div class="case-detail__desc">{{ caseData.suggestion.content }}</div>
        <div v-if="referencedCases.length" class="case-detail__refs">
          <div class="section-title">引用案例库</div>
          <div v-for="r in referencedCases" :key="r.id" class="case-detail__ref">
            <van-tag plain type="primary">{{ r.category }}</van-tag>
            <span class="case-detail__ref-title">{{ r.title }}</span>
          </div>
        </div>
        <div class="text-secondary" style="margin-top: 6px">
          {{ formatTime(caseData.suggestion.createdAt) }} · {{ caseData.suggestion.author }}
        </div>
      </div>

      <div v-if="caseData.completionVoucherImages?.length" class="card">
        <div class="section-title" style="padding-top: 0">和解完成凭证</div>
        <div class="case-detail__images">
          <van-image
            v-for="(img, i) in caseData.completionVoucherImages"
            :key="i"
            :src="img"
            width="100px"
            height="100px"
            fit="cover"
            radius="6"
            @click="previewImages(i)"
          />
        </div>
      </div>

      <div v-if="caseData.returnVisitRemark" class="card">
        <div class="section-title" style="padding-top: 0">回访确认</div>
        <div class="case-detail__desc">{{ caseData.returnVisitRemark }}</div>
        <div class="text-secondary" style="margin-top: 6px">
          {{ formatTime(caseData.returnVisitedAt!) }}
        </div>
      </div>

      <div v-if="caseData.evaluation" class="card">
        <div class="section-title" style="padding-top: 0">消费者评价</div>
        <van-rate v-model="caseData.evaluation.rating" readonly />
        <div v-if="caseData.evaluation.comment" class="case-detail__desc" style="margin-top: 8px">
          {{ caseData.evaluation.comment }}
        </div>
        <div class="text-secondary" style="margin-top: 6px">
          {{ formatTime(caseData.evaluation.createdAt) }}
        </div>
      </div>

      <div class="card">
        <div class="section-title" style="padding-top: 0">处理时间线</div>
        <StatusTimeline :items="caseData.timeline" />
      </div>

      <!-- 角色动作插槽 -->
      <div v-if="$slots.actions" class="case-detail__actions">
        <slot name="actions" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { showImagePreview } from 'vant'
import type { ReconciliationCase } from '@/types'
import StatusBadge from './StatusBadge.vue'
import StatusTimeline from './StatusTimeline.vue'
import { useCaseLibraryStore } from '@/stores/caseLibrary'
import { formatTime } from '@/utils/date'

const props = defineProps<{ caseData?: ReconciliationCase }>()
const caseLibStore = useCaseLibraryStore()

const referencedCases = computed(() => {
  const ids = props.caseData?.suggestion?.referencedCaseIds ?? []
  return ids.map((id) => caseLibStore.getById(id)).filter(Boolean) as NonNullable<
    ReturnType<typeof caseLibStore.getById>
  >[]
})

function previewImages(index: number) {
  const imgs = props.caseData?.completionVoucherImages ?? []
  if (imgs.length) showImagePreview(imgs, index)
}
</script>

<style scoped>
.case-detail {
  padding-bottom: 8px;
}
.case-detail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.case-detail__no {
  font-size: 14px;
  color: #969799;
}
.case-detail__desc {
  font-size: 14px;
  color: #323233;
  line-height: 22px;
}
.case-detail__desc--warn {
  color: #ee0a24;
}
.case-detail__refs {
  margin-top: 10px;
}
.case-detail__ref {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-top: 6px;
}
.case-detail__ref-title {
  color: #646566;
}
.case-detail__images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.case-detail__actions {
  padding: 12px;
}
</style>
