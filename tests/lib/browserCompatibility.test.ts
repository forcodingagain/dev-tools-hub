/**
 * 浏览器兼容性库测试
 * 测试特性检测、polyfill管理和兼容性处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Browser Compatibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Feature Detection', () => {
    it('detects WebGL support', () => {
      // 模拟WebGL检测
      const mockCanvas = document.createElement('canvas')
      const mockContext = {
        getParameter: vi.fn()
      }

      const mockGetContext = vi.fn().mockReturnValue(mockContext)
      vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as any)
      mockCanvas.getContext = mockGetContext

      const hasWebGL = !!mockCanvas.getContext('webgl') || !!mockCanvas.getContext('experimental-webgl')
      expect(hasWebGL).toBe(true)
      expect(mockGetContext).toHaveBeenCalledWith('webgl')
    })

    it('detects LocalStorage support', () => {
      const testKey = 'test'
      const testValue = 'test'

      try {
        localStorage.setItem(testKey, testValue)
        const value = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        expect(value).toBe(testValue)
      } catch (e) {
        expect(true).toBe(false) // 不应该到达这里
      }
    })

    it('detects SessionStorage support', () => {
      const testKey = 'test'
      const testValue = 'test'

      try {
        sessionStorage.setItem(testKey, testValue)
        const value = sessionStorage.getItem(testKey)
        sessionStorage.removeItem(testKey)
        expect(value).toBe(testValue)
      } catch (e) {
        expect(true).toBe(false) // 不应该到达这里
      }
    })

    it('detects IndexedDB support', () => {
      const hasIndexedDB = 'indexedDB' in window && indexedDB !== null
      expect(hasIndexedDB).toBe(true)
    })

    it('detects Web Workers support', () => {
      const hasWebWorkers = typeof Worker !== 'undefined'
      expect(hasWebWorkers).toBe(true)
    })

    it('detects Service Workers support', () => {
      const hasServiceWorkers = 'serviceWorker' in navigator
      expect(hasServiceWorkers).toBe(true)
    })

    it('detects WebAssembly support', () => {
      const hasWebAssembly = typeof WebAssembly !== 'undefined'
      expect(hasWebAssembly).toBe(true)
    })

    it('detects WebSockets support', () => {
      const hasWebSockets = typeof WebSocket !== 'undefined'
      expect(hasWebSockets).toBe(true)
    })

    it('detects Geolocation support', () => {
      const hasGeolocation = 'geolocation' in navigator
      expect(hasGeolocation).toBe(true)
    })

    it('detects Camera access support', () => {
      const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
      expect(hasCamera).toBe(true)
    })

    it('detects Microphone access support', () => {
      const hasMicrophone = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
      expect(hasMicrophone).toBe(true)
    })

    it('detects Fullscreen API support', () => {
      const hasFullscreen = 'fullscreenEnabled' in document || 'webkitFullscreenEnabled' in document
      expect(hasFullscreen).toBe(true)
    })

    it('detects Notification API support', () => {
      const hasNotifications = 'Notification' in window
      expect(hasNotifications).toBe(true)
    })

    it('detects Share API support', () => {
      const hasShareAPI = 'share' in navigator
      expect(hasShareAPI).toBe(true)
    })

    it('detects Clipboard API support', () => {
      const hasClipboardAPI = 'clipboard' in navigator
      expect(hasClipboardAPI).toBe(true)
    })

    it('detects Vibration API support', () => {
      const hasVibrationAPI = 'vibrate' in navigator
      expect(hasVibrationAPI).toBe(true)
    })
  })

  describe('Browser Information', () => {
    it('detects browser name and version', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        writable: true
      })

      const getBrowserInfo = (ua: string) => {
        const isChrome = /Chrome/.test(ua) && !/Chromium|Edge|OPR|Opera/.test(ua)
        const isFirefox = /Firefox/.test(ua)
        const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edge|OPR|Opera/.test(ua)
        const isEdge = /Edge/.test(ua) || /Edg/.test(ua)
        const isOpera = /OPR|Opera/.test(ua)

        if (isChrome) return { name: 'Chrome', version: ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown' }
        if (isFirefox) return { name: 'Firefox', version: ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown' }
        if (isSafari) return { name: 'Safari', version: ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown' }
        if (isEdge) return { name: 'Edge', version: ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown' }
        if (isOpera) return { name: 'Opera', version: ua.match(/(?:OPR|Opera)\/(\d+\.\d+)/)?.[1] || 'Unknown' }

        return { name: 'Unknown', version: 'Unknown' }
      }

      const browserInfo = getBrowserInfo(userAgent)
      expect(browserInfo.name).toBe('Chrome')
      expect(browserInfo.version).toBe('120.0')
    })

    it('detects operating system', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        writable: true
      })

      const getOS = (ua: string) => {
        if (/Windows/.test(ua)) {
          if (/Windows NT 10.0/.test(ua)) return 'Windows 10'
          if (/Windows NT 6.3/.test(ua)) return 'Windows 8.1'
          if (/Windows NT 6.2/.test(ua)) return 'Windows 8'
          if (/Windows NT 6.1/.test(ua)) return 'Windows 7'
          return 'Windows'
        }
        if (/Mac OS X/.test(ua)) return 'macOS'
        if (/Linux/.test(ua)) return 'Linux'
        if (/Android/.test(ua)) return 'Android'
        if (/iOS|iPhone|iPad|iPod/.test(ua)) return 'iOS'
        return 'Unknown'
      }

      const os = getOS(userAgent)
      expect(os).toBe('Windows 10')
    })

    it('detects device type', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'

      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        writable: true
      })

      const getDeviceType = (ua: string) => {
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(ua)) {
          if (/iPad/.test(ua)) return 'tablet'
          return 'mobile'
        }
        return 'desktop'
      }

      const deviceType = getDeviceType(userAgent)
      expect(deviceType).toBe('mobile')
    })

    it('detects screen resolution', () => {
      Object.defineProperty(screen, 'width', {
        value: 1920,
        writable: true
      })

      Object.defineProperty(screen, 'height', {
        value: 1080,
        writable: true
      })

      const resolution = `${screen.width}x${screen.height}`
      expect(resolution).toBe('1920x1080')
    })

    it('detects pixel density', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true
      })

      expect(window.devicePixelRatio).toBe(2)
    })
  })

  describe('Compatibility Checks', () => {
    it('checks ES6 support safely', () => {
      // 使用安全的特性检测方法
      const hasES6 = (() => {
        try {
          // 检查箭头函数支持
          const arrowFunction = (() => { return true })
          // 检查解构赋值支持
          const { test } = { test: true }
          // 检查模板字符串支持
          const template = `test`
          return arrowFunction && test && template === 'test'
        } catch (e) {
          return false
        }
      })()

      expect(hasES6).toBe(true)
    })

    it('checks ES2017 support (async/await) safely', () => {
      // 使用安全的异步函数检测
      const hasAsyncAwait = (() => {
        try {
          // 检查是否支持async语法
          const asyncFunction = Object.getPrototypeOf(async function(){}).constructor
          return typeof asyncFunction === 'function'
        } catch (e) {
          return false
        }
      })()

      expect(hasAsyncAwait).toBe(true)
    })

    it('checks CSS Grid support', () => {
      const hasCSSGrid = CSS.supports('display', 'grid')
      expect(hasCSSGrid).toBe(true)
    })

    it('checks Flexbox support', () => {
      const hasFlexbox = CSS.supports('display', 'flex')
      expect(hasFlexbox).toBe(true)
    })

    it('checks CSS Custom Properties support', () => {
      const hasCustomProperties = CSS.supports('color', 'var(--test)')
      expect(hasCustomProperties).toBe(true)
    })

    it('checks Intersection Observer support', () => {
      const hasIntersectionObserver = 'IntersectionObserver' in window
      expect(hasIntersectionObserver).toBe(true)
    })

    it('checks Resize Observer support', () => {
      const hasResizeObserver = 'ResizeObserver' in window
      expect(hasResizeObserver).toBe(true)
    })

    it('checks Mutation Observer support', () => {
      const hasMutationObserver = 'MutationObserver' in window
      expect(hasMutationObserver).toBe(true)
    })

    it('checks requestAnimationFrame support', () => {
      const hasRAF = 'requestAnimationFrame' in window
      expect(hasRAF).toBe(true)
    })

    it('checks CSS transitions support', () => {
      const hasTransitions = CSS.supports('transition', 'all 0.3s')
      expect(hasTransitions).toBe(true)
    })

    it('checks CSS animations support', () => {
      const hasAnimations = CSS.supports('animation', 'test 0.3s')
      expect(hasAnimations).toBe(true)
    })
  })

  describe('Polyfill Management', () => {
    it('loads polyfills for missing features', async () => {
      // 模拟缺少某些特性的情况
      const originalFetch = window.fetch
      delete (window as any).fetch

      const loadPolyfill = async (feature: string) => {
        const polyfills: Record<string, () => Promise<void>> = {
          'fetch': async () => {
            // 模拟加载fetch polyfill
            window.fetch = originalFetch
          }
        }

        if (polyfills[feature]) {
          await polyfills[feature]()
        }
      }

      await loadPolyfill('fetch')
      expect(window.fetch).toBe(originalFetch)
    })

    it('provides fallbacks for unsupported APIs', () => {
      // 模拟Clipboard API不支持的情况
      const originalClipboard = navigator.clipboard
      delete (navigator as any).clipboard

      const clipboardFallback = {
        writeText: (text: string) => {
          // 创建临时textarea元素
          const textarea = document.createElement('textarea')
          textarea.value = text
          document.body.appendChild(textarea)
          textarea.select()
          const success = document.execCommand('copy')
          document.body.removeChild(textarea)
          return success ? Promise.resolve() : Promise.reject(new Error('Copy failed'))
        },
        readText: () => Promise.reject(new Error('Read not supported'))
      }

      Object.defineProperty(navigator, 'clipboard', {
        value: clipboardFallback,
        writable: true
      })

      expect(navigator.clipboard).toBeDefined()
      expect(typeof navigator.clipboard.writeText).toBe('function')
    })

    it('handles graceful degradation', () => {
      const featureDetection = {
        hasWebGL: false,
        hasLocalStorage: false,
        hasServiceWorker: true
      }

      const features = {
        graphics: featureDetection.hasWebGL ? 'webgl' : 'canvas',
        storage: featureDetection.hasLocalStorage ? 'localStorage' : 'memory',
        offline: featureDetection.hasServiceWorker ? 'service-worker' : 'app-cache'
      }

      expect(features.graphics).toBe('canvas')
      expect(features.storage).toBe('memory')
      expect(features.offline).toBe('service-worker')
    })
  })

  describe('Performance Adaptation', () => {
    it('adjusts performance based on device capabilities', () => {
      const deviceInfo = {
        cores: 4,
        memory: 8, // GB
        connection: '4g',
        gpu: false
      }

      const getPerformanceSettings = (info: typeof deviceInfo) => {
        return {
          animations: info.cores >= 4 && !info.gpu,
          particles: info.cores >= 8,
          shadows: info.gpu || info.cores >= 4,
          quality: info.memory >= 8 ? 'high' : info.memory >= 4 ? 'medium' : 'low',
          preloadImages: info.connection === '4g' || info.connection === 'wifi'
        }
      }

      const settings = getPerformanceSettings(deviceInfo)
      expect(settings.animations).toBe(true)
      expect(settings.particles).toBe(false)
      expect(settings.shadows).toBe(true)
      expect(settings.quality).toBe('high')
      expect(settings.preloadImages).toBe(true)
    })

    it('enables reduced motion for performance', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      expect(prefersReducedMotion).toBe(true)
    })

    it('adapts to network conditions', () => {
      const connection = {
        effectiveType: 'slow-2g',
        downlink: 0.1,
        rtt: 2000,
        saveData: true
      }

      Object.defineProperty(navigator, 'connection', {
        value: connection,
        writable: true
      })

      const getNetworkStrategy = (conn: typeof connection) => {
        return {
          imageQuality: conn.saveData ? 'low' : conn.effectiveType === '4g' ? 'high' : 'medium',
          autoLoadVideos: conn.effectiveType === '4g' && !conn.saveData,
          lazyLoadDistance: conn.effectiveType === 'slow-2g' ? 800 : 400,
          compressionEnabled: conn.saveData || conn.effectiveType === 'slow-2g'
        }
      }

      const strategy = getNetworkStrategy(connection)
      expect(strategy.imageQuality).toBe('low')
      expect(strategy.autoLoadVideos).toBe(false)
      expect(strategy.lazyLoadDistance).toBe(800)
      expect(strategy.compressionEnabled).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('handles feature detection errors gracefully', () => {
      const detectFeature = (featureName: string) => {
        try {
          switch (featureName) {
            case 'webgl':
              return !!document.createElement('canvas').getContext('webgl')
            case 'webgl2':
              return !!document.createElement('canvas').getContext('webgl2')
            default:
              return false
          }
        } catch (error) {
          console.warn(`Failed to detect ${featureName}:`, error)
          return false
        }
      }

      // 模拟错误情况
      const originalCreateElement = document.createElement
      document.createElement = vi.fn().mockImplementation(() => {
        throw new Error('Canvas creation failed')
      }) as any

      const hasWebGL = detectFeature('webgl')
      expect(hasWebGL).toBe(false)

      // 恢复原始方法
      document.createElement = originalCreateElement
    })

    it('provides meaningful error messages', () => {
      const getErrorMessage = (feature: string, error: Error) => {
        const messages: Record<string, string> = {
          'localStorage': '您的浏览器不支持本地存储，某些功能可能无法正常使用',
          'webgl': '您的浏览器不支持WebGL，无法显示3D内容',
          'serviceWorker': '您的浏览器不支持Service Worker，离线功能不可用'
        }

        return messages[feature] || `功能 ${feature} 不可用: ${error.message}`
      }

      const error = new Error('SecurityError')
      const message = getErrorMessage('localStorage', error)
      expect(message).toContain('本地存储')
    })
  })

  describe('Browser Update Notifications', () => {
    it('identifies outdated browsers', () => {
      const browserVersions = {
        chrome: { min: 90, current: 85 },
        firefox: { min: 88, current: 87 },
        safari: { min: 14, current: 13 },
        edge: { min: 90, current: 95 }
      }

      const needsUpdate = Object.entries(browserVersions)
        .filter(([_, versions]) => versions.current < versions.min)
        .map(([browser]) => browser)

      expect(needsUpdate).toContain('chrome')
      expect(needsUpdate).toContain('safari')
      expect(needsUpdate).not.toContain('edge')
    })

    it('generates update recommendations', () => {
      const recommendations = {
        chrome: '请更新到最新版本的Chrome浏览器以获得最佳体验',
        firefox: '请更新Firefox到最新版本',
        safari: '请在Mac App Store中更新Safari',
        edge: '请更新Microsoft Edge到最新版本'
      }

      const getRecommendation = (browser: string) => {
        return recommendations[browser as keyof typeof recommendations] || '请更新您的浏览器'
      }

      expect(getRecommendation('chrome')).toContain('Chrome')
      expect(getRecommendation('safari')).toContain('Mac App Store')
    })
  })
})