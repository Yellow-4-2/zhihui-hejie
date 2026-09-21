import { useWindowSize } from '@vant/use'
import { computed } from 'vue'

export function useDevice() {
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value <= 750)
  const isPc = computed(() => width.value > 750)
  return { width, isMobile, isPc }
}
