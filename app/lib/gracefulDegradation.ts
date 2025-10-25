/**
 * 渐进式降级工具
 */

export interface FeatureCapability {
  /** 功能名称 */
  name: string
  /** 检查函数 */
  check: () => boolean
  /** 降级策略 */
  fallback: () => void
  /** 优先级 */
  priority: number
  /** 是否必需 */
  required: boolean
}

export interface BrowserCapability {
  /** 能力名称 */
  name: string
  /** 检测函数 */
  detect: () => boolean
  /** 降级处理 */
  degrade: () => void
  /** 支持的功能列表 */
  supports: string[]
}

export interface ProgressiveEnhancementConfig {
  /** 功能降级策略 */
  featureStrategies: FeatureCapability[]
  /** 浏览器能力检测 */
  browserCapabilities: BrowserCapability[]
  /** 启用日志 */
  enableLogging: boolean
  /** 降级提示组件 */
  showDegradationNotice: boolean
}

/**
 * 浏览器信息接口
 */
interface BrowserInfo {
  name: string
  version: string
  os: string
}

/**
 * 渐进式降级管理器
 */
export class ProgressiveDegradation {
  private static instance: ProgressiveDegradation
  private config: ProgressiveEnhancementConfig
  private enabledFeatures: Set<string> = new Set()
  private disabledFeatures: Set<string> = new Set()
  private browserInfo: BrowserInfo

  private constructor() {
    this.config = this.getDefaultConfig()
    this.browserInfo = this.detectBrowser()
    this.initialize()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ProgressiveDegradation {
    if (!ProgressiveDegradation.instance) {
      ProgressiveDegradation.instance = new ProgressiveDegradation()
    }
    return ProgressiveDegradation.instance
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): ProgressiveEnhancementConfig {
    return {
      featureStrategies: [
        {
          name: 'es6_modules',
          check: () => typeof import !== 'undefined',
          fallback: () => this.handleES6ModuleFallback(),
          priority: 1,
          required: false
        },
        {
          name: 'async_await',
          check: () => typeof Promise !== 'undefined' && 'async' in window,
          fallback: () => this.handleAsyncAwaitFallback(),
          priority: 2,
          required: false
        },
        {
          name: 'fetch_api',
          check: () => typeof fetch !== 'undefined',
          fallback: () => this.handleFetchFallback(),
          priority: 3,
          required: false
        },
        {
          name: 'intersection_observer',
          check: () => 'IntersectionObserver' in window,
          fallback: () => this.handleIntersectionObserverFallback(),
          priority: 4,
          required: false
        },
        {
          name: 'request_animation_frame',
          check: () => 'requestAnimationFrame' in window,
          fallback: () => this.handleRAFFallback(),
          priority: 5,
          required: false
        },
        {
          name: 'local_storage',
          check: () => {
            try {
              const test = '__test__'
              localStorage.setItem(test, test)
              localStorage.removeItem(test)
              return true
            } catch {
              return false
            }
          },
          fallback: () => this.handleLocalStorageFallback(),
          priority: 6,
          required: false
        },
        {
          name: 'web_workers',
          check: () => typeof Worker !== 'undefined',
          fallback: () => this.handleWebWorkerFallback(),
          priority: 7,
          required: false
        },
        {
          name: 'webgl',
          check: () => {
            try {
              const canvas = document.createElement('canvas')
              return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            } catch {
              return false
            }
          },
          fallback: () => this.handleWebGLFallback(),
          priority: 8,
          required: false
        },
        {
          name: 'css_grid',
          check: () => CSS.supports('display', 'grid'),
          fallback: () => this.handleCSSGridFallback(),
          priority: 9,
          required: false
        },
        {
          name: 'css_flexbox',
          check: () => CSS.supports('display', 'flex'),
          fallback: () => this.handleCSSFlexboxFallback(),
          priority: 10,
          required: false
        }
      ],
      browserCapabilities: [
        {
          name: 'chrome',
          detect: () => this.browserInfo.name === 'Chrome',
          degrade: () => this.handleOldBrowserFallback(),
          supports: ['es6_modules', 'fetch_api', 'intersection_observer', 'web_workers']
        },
        {
          name: 'firefox',
          detect: () => this.browserInfo.name === 'Firefox',
          degrade: () => this.handleFirefoxFallback(),
          supports: ['es6_modules', 'fetch_api', 'intersection_observer', 'web_workers']
        },
        {
          name: 'safari',
          detect: () => this.browserInfo.name === 'Safari',
          degrade: () => this.handleSafariFallback(),
          supports: ['es6_modules', 'fetch_api', 'intersection_observer', 'web_workers']
        },
        {
          name: 'edge',
          detect: () => this.browserInfo.name === 'Edge',
          degrade: () => this.handleEdgeFallback(),
          supports: ['es6_modules', 'fetch_api', 'intersection_observer', 'web_workers']
        },
        {
          name: 'ie',
          detect: () => this.browserInfo.name === 'Internet Explorer',
          degrade: () => this.handleIEFallback(),
          supports: []
        }
      ],
      enableLogging: process.env.NODE_ENV === 'development',
      showDegradationNotice: false
    }
  }

  /**
   * 检测浏览器信息
   */
  private detectBrowserInfo(): BrowserInfo {
    const ua = navigator.userAgent
    let name = 'Unknown'
    let version = 'Unknown'
    let os = 'Unknown'

    // 检测浏览器
    if (ua.includes('Chrome')) {
      name = 'Chrome'
      const match = ua.match(/Chrome\/(\d+)/)
      version = match ? match[1] : 'Unknown'
    } else if (ua.includes('Firefox')) {
      name = 'Firefox'
      const match = ua.match(/Firefox\/(\d+)/)
      version = match ? match[1] : 'Unknown'
    } else if (ua.includes('Safari')) {
      name = 'Safari'
      const match = ua.match(/Version\/(\d+)/)
      version = match ? match[1] : 'Unknown'
    } else if (ua.includes('Edge')) {
      name = 'Edge'
      const match = ua.match(/Edge\/(\d+)/)
      version = match ? match[1] : 'Unknown'
    } else if (ua.includes('MSIE') || ua.includes('Trident')) {
      name = 'Internet Explorer'
      const match = ua.match(/MSIE (\d+)|Trident.*rv:(\d+)/)
      version = match ? match[1] || match[2] : 'Unknown'
    }

    // 检测操作系统
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS')) os = 'iOS'

    return { name, version, os }
  }

  /**
   * 初始化
   */
  private initialize(): void {
    // 检测浏览器能力
    this.detectBrowserCapabilities()

    // 检测功能支持
    this.checkFeatureSupport()

    // 应用降级策略
    this.applyDegradationStrategies()

    // 添加降级提示
    if (this.config.showDegradationNotice) {
      this.addDegradationNotice()
    }

    this.log('渐进式降级初始化完成', {
      browser: this.browserInfo,
      enabledFeatures: Array.from(this.enabledFeatures),
      disabledFeatures: Array.from(this.disabledFeatures)
    })
  }

  /**
   * 检测浏览器能力
   */
  private detectBrowserCapabilities(): void {
    this.browserInfo = this.detectBrowserInfo()

    this.config.browserCapabilities.forEach(capability => {
      if (capability.detect()) {
        this.log(`检测到浏览器能力: ${capability.name}`)
        capability.supports.forEach(feature => {
          this.enabledFeatures.add(feature)
        })
      }
    })
  }

  /**
   * 检查功能支持
   */
  private checkFeatureSupport(): void {
    this.config.featureStrategies
      .sort((a, b) => a.priority - b.priority)
      .forEach(feature => {
        if (feature.check()) {
          this.enabledFeatures.add(feature.name)
          this.log(`功能支持: ${feature.name}`)
        } else {
          this.disabledFeatures.add(feature.name)
          if (!feature.required) {
            this.log(`功能不支持，将降级: ${feature.name}`)
          } else {
            this.log(`必需功能不支持: ${feature.name}`, 'error')
          }
        }
      })
  }

  /**
   * 应用降级策略
   */
  private applyDegradationStrategies(): void {
    this.config.featureStrategies
      .filter(feature => !feature.check() && !feature.required)
      .forEach(feature => {
        try {
          feature.fallback()
          this.log(`应用降级策略: ${feature.name}`)
        } catch (error) {
          this.log(`降级策略执行失败: ${feature.name}`, 'error', error)
        }
      })
  }

  /**
   * 添加降级提示
   */
  private addDegradationNotice(): void {
    if (this.disabledFeatures.size === 0) return

    const notice = document.createElement('div')
    notice.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50 text-sm'

    // 创建图标
    const icon = document.createElement('svg')
    icon.className = 'w-4 h-4 mr-2 inline-block'
    icon.setAttribute('fill', 'currentColor')
    icon.setAttribute('viewBox', '0 0 20 20')

    const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    iconPath.setAttribute('fill-rule', 'evenodd')
    iconPath.setAttribute('d', 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 11-2 0V6a1 1 0 012-1z')
    iconPath.setAttribute('clip-rule', 'evenodd')
    icon.appendChild(iconPath)

    // 创建文本
    const text = document.createElement('span')
    text.textContent = '您的浏览器不支持某些功能，部分体验可能受限'

    // 创建关闭按钮
    const closeButton = document.createElement('button')
    closeButton.className = 'ml-4 text-yellow-800 hover:text-yellow-900'
    closeButton.textContent = '✕'

    const container = document.createElement('div')
    container.className = 'flex items-center'
    container.appendChild(icon)
    container.appendChild(text)
    container.appendChild(closeButton)

    notice.appendChild(container)

    // 关闭按钮事件
    closeButton.addEventListener('click', () => {
      if (notice.parentElement) {
        notice.parentElement.removeChild(notice)
      }
    })

    document.body.appendChild(notice)

    // 5秒后自动隐藏
    setTimeout(() => {
      if (notice.parentElement) {
        notice.parentElement.removeChild(notice)
      }
    }, 5000)
  }

  // 各种功能的降级策略
  private handleES6ModuleFallback(): void {
    // 使用AMD或全局变量替代ES6模块
    this.log('ES6模块降级到全局变量模式')
  }

  private handleAsyncAwaitFallback(): void {
    // 使用Promise链替代async/await
    this.log('async/await降级到Promise链')
  }

  private handleFetchFallback(): void {
    // 使用XMLHttpRequest替代fetch
    if (!window._fetch) {
      window._fetch = (url: string, options?: RequestInit) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open(options?.method || 'GET', url)
          xhr.onload = () => {
            resolve({
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              text: () => Promise.resolve(xhr.responseText),
              json: () => Promise.resolve(JSON.parse(xhr.responseText))
            } as any)
          }
          xhr.onerror = () => reject(new Error('Network request failed'))
          xhr.send(options?.body)
        })
      }
    }
    this.log('Fetch API降级到XMLHttpRequest')
  }

  private handleIntersectionObserverFallback(): void {
    // 使用scroll事件替代Intersection Observer
    if (!window._IntersectionObserver) {
      window._IntersectionObserver = class {
        constructor(callback: any) {
          this.callback = callback
          this.elements = new Set()
          this.setupScrollListener()
        }

        observe(element: Element) {
          this.elements.add(element)
          this.checkVisibility(element)
        }

        unobserve(element: Element) {
          this.elements.delete(element)
        }

        disconnect() {
          this.elements.clear()
          window.removeEventListener('scroll', this.scrollHandler)
        }

        private setupScrollListener() {
          this.scrollHandler = () => {
            this.elements.forEach(element => {
              this.checkVisibility(element)
            })
          }
          window.addEventListener('scroll', this.scrollHandler, { passive: true })
        }

        private checkVisibility(element: Element) {
          const rect = element.getBoundingClientRect()
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0
          this.callback([{ target: element, isIntersecting: isVisible }])
        }
      } as any
    }
    this.log('Intersection Observer降级到scroll事件')
  }

  private handleRAFFallback(): void {
    // 使用setTimeout替代requestAnimationFrame
    if (!window._requestAnimationFrame) {
      window._requestAnimationFrame = (callback: FrameRequestCallback) => {
        return setTimeout(callback, 16) as any
      }
    }
    this.log('requestAnimationFrame降级到setTimeout')
  }

  private handleLocalStorageFallback(): void {
    // 使用内存存储替代localStorage
    const memoryStore = new Map()

    if (!window._localStorage) {
      window._localStorage = {
        getItem: (key: string) => memoryStore.get(key) || null,
        setItem: (key: string, value: string) => memoryStore.set(key, value),
        removeItem: (key: string) => memoryStore.delete(key),
        clear: () => memoryStore.clear(),
        length: memoryStore.size,
        key: (index: number) => {
          const keys = Array.from(memoryStore.keys())
          return keys[index] || null
        }
      }
    }
    this.log('localStorage降级到内存存储')
  }

  private handleWebWorkerFallback(): void {
    // 使用主线程处理替代Web Worker
    this.log('Web Worker降级到主线程处理')
  }

  private handleWebGLFallback(): void {
    // 使用Canvas 2D替代WebGL
    this.log('WebGL降级到Canvas 2D')
  }

  private handleCSSGridFallback(): void {
    // 使用Flexbox替代CSS Grid
    document.documentElement.classList.add('no-css-grid')
    this.log('CSS Grid降级到Flexbox')
  }

  private handleCSSFlexboxFallback(): void {
    // 使用传统布局替代Flexbox
    document.documentElement.classList.add('no-flexbox')
    this.log('Flexbox降级到传统布局')
  }

  // 浏览器特定的降级策略
  private handleOldBrowserFallback(): void {
    this.log('应用旧浏览器兼容性修复')
    // 添加polyfills等
  }

  private handleFirefoxFallback(): void {
    this.log('应用Firefox特定优化')
  }

  private handleSafariFallback(): void {
    this.log('应用Safari特定优化')
  }

  private handleEdgeFallback(): void {
    this.log('应用Edge特定优化')
  }

  private handleIEFallback(): void {
    this.log('应用IE兼容性修复')
    document.documentElement.classList.add('ie')
    // 添加更多IE特定处理
  }

  /**
   * 日志记录
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info', data?: any): void {
    if (!this.config.enableLogging) return

    const logMessage = `[渐进式降级] ${message}`

    switch (level) {
      case 'info':
        console.log(logMessage, data)
        break
      case 'warn':
        console.warn(logMessage, data)
        break
      case 'error':
        console.error(logMessage, data)
        break
    }
  }

  /**
   * 检查功能是否支持
   */
  isSupported(featureName: string): boolean {
    return this.enabledFeatures.has(featureName)
  }

  /**
   * 检查功能是否被禁用
   */
  isDisabled(featureName: string): boolean {
    return this.disabledFeatures.has(featureName)
  }

  /**
   * 获取支持的功能列表
   */
  getSupportedFeatures(): string[] {
    return Array.from(this.enabledFeatures)
  }

  /**
   * 获取不支持的功能列表
   */
  getUnsupportedFeatures(): string[] {
    return Array.from(this.disabledFeatures)
  }

  /**
   * 获取浏览器信息
   */
  getBrowserInfo(): BrowserInfo {
    return { ...this.browserInfo }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ProgressiveEnhancementConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// 导出单例实例
export const progressiveDegradation = ProgressiveDegradation.getInstance()

/**
 * 功能检测装饰器
 */
export function featureDetection(featureName: string, fallback?: () => void) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      if (progressiveDegradation.isSupported(featureName)) {
        return originalMethod.apply(this, args)
      } else {
        if (fallback) {
          return fallback.apply(this, args)
        } else {
          console.warn(`功能 ${featureName} 不支持，操作被跳过`)
          return null
        }
      }
    }

    return descriptor
  }
}

/**
 * 能力检测工具函数
 */
export const canUse = (featureName: string): boolean => {
  return progressiveDegradation.isSupported(featureName)
}

export const cannotUse = (featureName: string): boolean => {
  return progressiveDegradation.isDisabled(featureName)
}

export const whenSupported = (featureName: string, callback: () => void): void => {
  if (canUse(featureName)) {
    callback()
  } else {
    console.warn(`功能 ${featureName} 不支持，回调被跳过`)
  }
}

export const whenNotSupported = (featureName: string, callback: () => void): void => {
  if (cannotUse(featureName)) {
    callback()
  } else {
    console.warn(`功能 ${featureName} 已支持，降级回调被跳过`)
  }
}