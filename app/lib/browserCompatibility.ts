/**
 * 浏览器兼容性检测和处理
 * 提供跨浏览器兼容性检测、polyfill管理和优雅降级功能
 * 完全避免使用eval()和new Function()等不安全的方法
 */

// 浏览器检测接口
export interface BrowserInfo {
  name: string
  version: string
  os: string
  engine: string
  mobile: boolean
  tablet: boolean
}

// 兼容性检查结果接口
export interface CompatibilityResult {
  supported: boolean
  features: FeatureSupport[]
  polyfills: string[]
  recommendations: string[]
}

// 功能支持接口
export interface FeatureSupport {
  name: string
  supported: boolean
  version?: string
  polyfill?: string
  fallback?: string
}

// 浏览器兼容性管理器类
export class BrowserCompatibilityManager {
  private static instance: BrowserCompatibilityManager
  private browserInfo: BrowserInfo | null = null
  private compatibilityCache: Map<string, CompatibilityResult> = new Map()

  private constructor() {
    this.detectBrowser()
  }

  static getInstance(): BrowserCompatibilityManager {
    if (!BrowserCompatibilityManager.instance) {
      BrowserCompatibilityManager.instance = new BrowserCompatibilityManager()
    }
    return BrowserCompatibilityManager.instance
  }

  /**
   * 检测当前浏览器信息
   */
  private detectBrowser(): BrowserInfo {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        name: 'unknown',
        version: '0.0',
        os: 'unknown',
        engine: 'unknown',
        mobile: false,
        tablet: false
      }
    }

    const userAgent = navigator.userAgent
    const vendor = navigator.vendor || ''

    // 检测浏览器名称和版本
    let name = 'unknown'
    let version = '0.0'
    let engine = 'unknown'

    // Chrome
    if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
      name = 'chrome'
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
      version = match ? match[1] : '0.0'
      engine = 'blink'
    }
    // Firefox
    else if (/Firefox/.test(userAgent)) {
      name = 'firefox'
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
      version = match ? match[1] : '0.0'
      engine = 'gecko'
    }
    // Safari
    else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
      name = 'safari'
      const match = userAgent.match(/Version\/(\d+\.\d+)/)
      version = match ? match[1] : '0.0'
      engine = 'webkit'
    }
    // Edge
    else if (/Edge/.test(userAgent)) {
      name = 'edge'
      const match = userAgent.match(/Edge\/(\d+\.\d+)/)
      version = match ? match[1] : '0.0'
      engine = 'edgehtml'
    }
    // Edge (Chromium)
    else if (/Edg/.test(userAgent)) {
      name = 'edge'
      const match = userAgent.match(/Edg\/(\d+\.\d+)/)
      version = match ? match[1] : '0.0'
      engine = 'blink'
    }
    // Internet Explorer
    else if (/MSIE|Trident/.test(userAgent)) {
      name = 'ie'
      const match = userAgent.match(/(?:MSIE |rv:)(\d+\.\d+)/)
      version = match ? match[1] : '0.0'
      engine = 'trident'
    }

    // 检测操作系统
    let os = 'unknown'
    if (/Windows/.test(userAgent)) {
      os = 'windows'
    } else if (/Mac/.test(userAgent)) {
      os = 'macos'
    } else if (/Linux/.test(userAgent)) {
      os = 'linux'
    } else if (/Android/.test(userAgent)) {
      os = 'android'
    } else if (/iOS|iPhone|iPad|iPod/.test(userAgent)) {
      os = 'ios'
    }

    // 检测设备类型
    const mobile = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent)
    const tablet = /iPad|Tablet/.test(userAgent)

    this.browserInfo = {
      name,
      version,
      os,
      engine,
      mobile,
      tablet
    }

    return this.browserInfo
  }

  /**
   * 获取浏览器信息
   */
  getBrowserInfo(): BrowserInfo {
    return this.browserInfo || this.detectBrowser()
  }

  /**
   * 检查功能支持 - 使用安全的检测方法
   */
  checkFeatureSupport(): FeatureSupport[] {
    const features: FeatureSupport[] = []

    // 基于浏览器版本推断 ES6+ 功能支持
    const browserInfo = this.getBrowserInfo()
    const version = parseFloat(browserInfo.version)

    // ES6 功能支持检查 - 基于浏览器版本
    features.push({
      name: 'arrow-functions',
      supported: this.checkArrowFunctionsByBrowser(browserInfo.name, version),
      polyfill: 'babel-plugin-transform-arrow-functions'
    })

    features.push({
      name: 'async-await',
      supported: this.checkAsyncAwaitByBrowser(browserInfo.name, version),
      polyfill: 'regenerator-runtime'
    })

    features.push({
      name: 'destructuring',
      supported: this.checkDestructuringByBrowser(browserInfo.name, version),
      polyfill: 'babel-plugin-transform-destructuring'
    })

    features.push({
      name: 'template-literals',
      supported: this.checkTemplateLiteralsByBrowser(browserInfo.name, version),
      polyfill: 'babel-plugin-transform-template-literals'
    })

    // 检查 Web API 支持
    features.push({
      name: 'fetch',
      supported: typeof fetch !== 'undefined',
      polyfill: 'whatwg-fetch',
      fallback: 'XMLHttpRequest'
    })

    features.push({
      name: 'promise',
      supported: typeof Promise !== 'undefined',
      polyfill: 'promise-polyfill'
    })

    features.push({
      name: 'intersection-observer',
      supported: typeof IntersectionObserver !== 'undefined',
      polyfill: 'intersection-observer-polyfill'
    })

    features.push({
      name: 'resize-observer',
      supported: typeof ResizeObserver !== 'undefined',
      polyfill: 'resize-observer-polyfill'
    })

    features.push({
      name: 'mutation-observer',
      supported: typeof MutationObserver !== 'undefined'
    })

    // 检查 CSS 功能支持
    features.push({
      name: 'css-grid',
      supported: this.checkCSSFeature('grid-template-columns'),
      fallback: 'flexbox-layout'
    })

    features.push({
      name: 'css-flexbox',
      supported: this.checkCSSFeature('display', 'flex'),
      fallback: 'float-layout'
    })

    features.push({
      name: 'css-custom-properties',
      supported: this.checkCSSFeature('--test', 'color'),
      fallback: 'css-variables-fallback'
    })

    features.push({
      name: 'css-scroll-behavior',
      supported: this.checkCSSFeature('scroll-behavior', 'smooth'),
      fallback: 'smooth-scroll-polyfill'
    })

    // 检查存储支持
    features.push({
      name: 'localstorage',
      supported: this.checkLocalStorage(),
      fallback: 'cookie-storage'
    })

    features.push({
      name: 'sessionstorage',
      supported: this.checkSessionStorage(),
      fallback: 'memory-storage'
    })

    // 检查其他功能
    features.push({
      name: 'webworkers',
      supported: typeof Worker !== 'undefined'
    })

    features.push({
      name: 'service-worker',
      supported: 'serviceWorker' in navigator
    })

    features.push({
      name: 'webassembly',
      supported: typeof WebAssembly !== 'undefined'
    })

    // 检查可访问性功能
    features.push({
      name: 'aria-attributes',
      supported: this.checkAriaSupport()
    })

    features.push({
      name: 'keyboard-navigation',
      supported: this.checkKeyboardNavigation()
    })

    return features
  }

  /**
   * 基于浏览器版本检查箭头函数支持
   */
  private checkArrowFunctionsByBrowser(browser: string, version: number): boolean {
    switch (browser) {
      case 'chrome': return version >= 45
      case 'firefox': return version >= 39
      case 'safari': return version >= 10
      case 'edge': return version >= 12
      case 'ie': return false
      default: return true // 现代浏览器默认支持
    }
  }

  /**
   * 基于浏览器版本检查 async/await 支持
   */
  private checkAsyncAwaitByBrowser(browser: string, version: number): boolean {
    switch (browser) {
      case 'chrome': return version >= 55
      case 'firefox': return version >= 52
      case 'safari': return version >= 10.1
      case 'edge': return version >= 14
      case 'ie': return false
      default: return true
    }
  }

  /**
   * 基于浏览器版本检查解构赋值支持
   */
  private checkDestructuringByBrowser(browser: string, version: number): boolean {
    switch (browser) {
      case 'chrome': return version >= 49
      case 'firefox': return version >= 41
      case 'safari': return version >= 10
      case 'edge': return version >= 14
      case 'ie': return false
      default: return true
    }
  }

  /**
   * 基于浏览器版本检查模板字面量支持
   */
  private checkTemplateLiteralsByBrowser(browser: string, version: number): boolean {
    switch (browser) {
      case 'chrome': return version >= 41
      case 'firefox': return version >= 34
      case 'safari': return version >= 9
      case 'edge': return version >= 12
      case 'ie': return false
      default: return true
    }
  }

  /**
   * 检查 CSS 功能支持
   */
  private checkCSSFeature(property: string, value?: string): boolean {
    if (typeof document === 'undefined') return false

    const element = document.createElement('div')

    if (value) {
      element.style.setProperty(property, value)
      return element.style.getPropertyValue(property) !== ''
    } else {
      return property in element.style
    }
  }

  /**
   * 检查 localStorage 支持
   */
  private checkLocalStorage(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查 sessionStorage 支持
   */
  private checkSessionStorage(): boolean {
    try {
      if (typeof sessionStorage === 'undefined') return false
      const test = '__test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查 ARIA 属性支持
   */
  private checkAriaSupport(): boolean {
    if (typeof document === 'undefined') return false

    const testElement = document.createElement('div')
    testElement.setAttribute('aria-label', 'test')
    return testElement.hasAttribute('aria-label')
  }

  /**
   * 检查键盘导航支持
   */
  private checkKeyboardNavigation(): boolean {
    if (typeof document === 'undefined') return false

    return 'addEventListener' in document && 'keydown' in document
  }

  /**
   * 获取兼容性报告
   */
  getCompatibilityReport(): CompatibilityResult {
    const cacheKey = `${this.getBrowserInfo().name}-${this.getBrowserInfo().version}`

    if (this.compatibilityCache.has(cacheKey)) {
      return this.compatibilityCache.get(cacheKey)!
    }

    const features = this.checkFeatureSupport()
    const supportedFeatures = features.filter(f => f.supported)
    const unsupportedFeatures = features.filter(f => !f.supported)

    const supported = unsupportedFeatures.length === 0
    const polyfills = unsupportedFeatures
      .filter(f => f.polyfill)
      .map(f => f.polyfill)

    const recommendations = this.generateRecommendations(unsupportedFeatures)

    const result: CompatibilityResult = {
      supported,
      features,
      polyfills,
      recommendations
    }

    this.compatibilityCache.set(cacheKey, result)
    return result
  }

  /**
   * 生成兼容性建议
   */
  private generateRecommendations(unsupportedFeatures: FeatureSupport[]): string[] {
    const recommendations: string[] = []
    const browserInfo = this.getBrowserInfo()

    if (browserInfo.name === 'ie' && parseFloat(browserInfo.version) < 11) {
      recommendations.push('建议升级到现代浏览器以获得更好的体验')
      recommendations.push('考虑使用 polyfill.io 来加载必要的 polyfills')
    }

    if (unsupportedFeatures.some(f => f.name.includes('css'))) {
      recommendations.push('某些 CSS 功能可能需要添加前缀或使用降级方案')
    }

    if (unsupportedFeatures.some(f => f.name.includes('storage'))) {
      recommendations.push('本地存储功能受限，将使用内存存储作为备选方案')
    }

    if (browserInfo.mobile) {
      recommendations.push('移动设备上可能需要优化触摸交互和性能')
    }

    if (unsupportedFeatures.some(f => f.name.includes('aria'))) {
      recommendations.push('可访问性功能可能受限，建议使用现代浏览器')
    }

    return recommendations
  }

  /**
   * 加载 polyfills
   */
  async loadPolyfills(polyfills: string[]): Promise<void> {
    const loadPromises = polyfills.map(polyfill => this.loadPolyfill(polyfill))
    await Promise.allSettled(loadPromises)
  }

  /**
   * 加载单个 polyfill
   */
  private async loadPolyfill(polyfill: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = `https://polyfill.io/v3/polyfill.min.js?features=${polyfill}`
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load polyfill: ${polyfill}`))

      document.head.appendChild(script)
    })
  }

  /**
   * 应用兼容性修复
   */
  applyCompatibilityFixes(): void {
    this.fixEventListeners()
    this.fixScrollBehavior()
    this.fixLocalStorage()
    this.fixConsoleAPIs()
    this.fixKeyboardNavigation()
  }

  /**
   * 修复事件监听器兼容性
   */
  private fixEventListeners(): void {
    if (typeof window === 'undefined') return

    // 修复 passive 事件监听器支持
    const supportsPassive = this.checkPassiveSupport()
    const originalAddEventListener = EventTarget.prototype.addEventListener

    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListener,
      options?: boolean | AddEventListenerOptions
    ) {
      if (typeof options === 'object' && options.passive && !supportsPassive) {
        // 降级为不支持 passive
        const optionsWithoutPassive = { ...options }
        delete optionsWithoutPassive.passive
        originalAddEventListener.call(this, type, listener, optionsWithoutPassive)
      } else {
        originalAddEventListener.call(this, type, listener, options)
      }
    }
  }

  /**
   * 检查 passive 事件监听器支持
   */
  private checkPassiveSupport(): boolean {
    if (typeof window === 'undefined') return false

    let supportsPassive = false
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => {
          supportsPassive = true
          return true
        }
      })
      window.addEventListener('test', () => {}, opts)
      window.removeEventListener('test', () => {}, opts)
    } catch {
      supportsPassive = false
    }

    return supportsPassive
  }

  /**
   * 修复滚动行为兼容性
   */
  private fixScrollBehavior(): void {
    if (typeof document === 'undefined') return

    if (!('scrollBehavior' in document.documentElement.style)) {
      // 为不支持 smooth scroll 的浏览器添加 polyfill
      const originalScrollTo = window.scrollTo
      window.scrollTo = function(options?: ScrollToOptions | number, y?: number) {
        if (typeof options === 'object' && options.behavior === 'smooth') {
          // 使用自定义 smooth scroll 实现
          smoothScrollPolyfill(options.left || 0, options.top || 0)
        } else {
          originalScrollTo.call(this, options as any, y)
        }
      }
    }
  }

  /**
   * 修复 localStorage 兼容性
   */
  private fixLocalStorage(): void {
    if (typeof window === 'undefined') return

    if (!this.checkLocalStorage()) {
      // 创建内存存储作为降级方案
      const memoryStorage: Record<string, string> = {}

      window.localStorage = {
        getItem: (key: string) => memoryStorage[key] || null,
        setItem: (key: string, value: string) => { memoryStorage[key] = value },
        removeItem: (key: string) => { delete memoryStorage[key] },
        clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]) },
        get length() { return Object.keys(memoryStorage).length },
        key: (index: number) => Object.keys(memoryStorage)[index] || null
      }
    }
  }

  /**
   * 修复 Console API 兼容性
   */
  private fixConsoleAPIs(): void {
    if (typeof window === 'undefined') return

    const console = window.console
    if (!console) return

    // 确保所有 console 方法存在
    const methods = ['log', 'warn', 'error', 'info', 'debug', 'trace', 'group', 'groupEnd', 'groupCollapsed']
    methods.forEach(method => {
      if (!(console as any)[method]) {
        (console as any)[method] = () => {}
      }
    })
  }

  /**
   * 修复键盘导航兼容性
   */
  private fixKeyboardNavigation(): void {
    if (typeof document === 'undefined') return

    // 修复 IE 不支持 :focus-visible
    if (!CSS.supports || !CSS.supports('selector(:focus-visible)')) {
      const style = document.createElement('style')
      style.textContent = `
        .focus-visible:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `
      document.head.appendChild(style)
    }
  }
}

// smooth scroll polyfill - 不使用requestAnimationFrame的兼容版本
function smoothScrollPolyfill(x: number, y: number): void {
  const startX = window.scrollX || window.pageXOffset || 0
  const startY = window.scrollY || window.pageYOffset || 0
  const distanceX = x - startX
  const distanceY = y - startY
  const duration = 500

  let startTime: number | null = null

  function animateScroll(currentTime: number): void {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const currentX = startX + distanceX * easeInOutCubic(progress)
    const currentY = startY + distanceY * easeInOutCubic(progress)

    window.scrollTo(currentX, currentY)

    if (progress < 1) {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(animateScroll)
      } else {
        // 降级到setTimeout
        setTimeout(() => animateScroll(performance.now()), 16)
      }
    }
  }

  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(animateScroll)
  } else {
    // 降级到setTimeout
    setTimeout(() => animateScroll(performance.now()), 16)
  }
}

// 导出单例实例
export const browserCompatibility = BrowserCompatibilityManager.getInstance()

// 工具函数
export const browserUtils = {
  /**
   * 检查是否为移动设备
   */
  isMobile(): boolean {
    return browserCompatibility.getBrowserInfo().mobile
  },

  /**
   * 检查是否为平板设备
   */
  isTablet(): boolean {
    return browserCompatibility.getBrowserInfo().tablet
  },

  /**
   * 检查是否为桌面设备
   */
  isDesktop(): boolean {
    const info = browserCompatibility.getBrowserInfo()
    return !info.mobile && !info.tablet
  },

  /**
   * 获取浏览器版本号
   */
  getVersion(): number {
    return parseFloat(browserCompatibility.getBrowserInfo().version)
  },

  /**
   * 检查是否支持某个功能
   */
  supportsFeature(featureName: string): boolean {
    const features = browserCompatibility.checkFeatureSupport()
    const feature = features.find(f => f.name === featureName)
    return feature?.supported ?? false
  },

  /**
   * 获取降级方案
   */
  getFallback(featureName: string): string | null {
    const features = browserCompatibility.checkFeatureSupport()
    const feature = features.find(f => f.name === featureName)
    return feature?.fallback || null
  },

  /**
   * 检查是否为Internet Explorer
   */
  isIE(): boolean {
    return browserCompatibility.getBrowserInfo().name === 'ie'
  },

  /**
   * 检查是否为旧版浏览器
   */
  isLegacyBrowser(): boolean {
    const info = browserCompatibility.getBrowserInfo()
    return (
      (info.name === 'ie' && parseFloat(info.version) < 11) ||
      (info.name === 'chrome' && parseFloat(info.version) < 60) ||
      (info.name === 'firefox' && parseFloat(info.version) < 55) ||
      (info.name === 'safari' && parseFloat(info.version) < 12)
    )
  }
}