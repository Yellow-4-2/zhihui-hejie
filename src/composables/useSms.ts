import { ref, onUnmounted } from 'vue'

export function useSms(duration = 60) {
  const countdown = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    if (countdown.value > 0) return
    countdown.value = duration
    timer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        clear()
      }
    }, 1000)
  }

  function clear() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    countdown.value = 0
  }

  onUnmounted(clear)

  return { countdown, start }
}
