export default {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      viewportWidth(file) {
        if (!file) return 375
        // node_modules 全部不转（Element Plus / Vant 等第三方组件库的样式需保持 px）
        if (file.includes('node_modules')) return undefined
        // src/styles/pc.scss —— PC 端原生 px，不转 vw
        if (/src[\\/]styles[\\/]pc\./.test(file)) return undefined
        return 375
      },
      unitPrecision: 5,
      viewportUnit: 'vw',
      selectorBlackList: ['pc-vant-reset', /^\.pc-/],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [
        /node_modules/,
        /src[\\/]styles[\\/]pc\./,
        // 全局工具类（.card/.section-title 等）与移动端外壳保持 px：
        // 它们同时被 PC 抽屉复用，vw 化在宽屏下会把 14px 放大到 ~40px
        /src[\\/]styles[\\/]index\./,
        /src[\\/]styles[\\/]mobile\./,
        /src[\\/]views[\\/]pc/,
        /src[\\/]views[\\/]portal/,
        /src[\\/]views[\\/]mobile/,
        /src[\\/]layouts/,
        // 共享组件统一保持 px（CaseDetailView/StatusBadge/StatusTimeline/ActionSheet 等
        // 同时用于 PC 抽屉与移动端；375px 视口下 px 与 vw 等价，移动端外观不变）
        /src[\\/]components[\\/]/,
      ],
    },
  },
}
