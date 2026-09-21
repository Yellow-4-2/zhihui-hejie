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
        /src[\\/]views[\\/]pc/,
        /src[\\/]views[\\/]portal/,
        /src[\\/]views[\\/]mobile/,
        /src[\\/]layouts/,
        /src[\\/]components[\\/]PcTable/,
        /src[\\/]components[\\/]RoleSwitcher/,
        /src[\\/]components[\\/].*Login/,
        /src[\\/]components[\\/]PasswordLoginField/,
        /src[\\/]components[\\/]SmsLoginField/,
      ],
    },
  },
}
