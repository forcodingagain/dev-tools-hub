/**
 * 浏览器兼容性Hook
 * 提供浏览器兼容性检测和处理的React Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BrowserCompatibilityManager,
  BrowserInfo,
  CompatibilityResult,
  FeatureSupport,
  browserCompatibility,
  browserUtils
} from '~/lib/browserCompatibility'

// Hook选项接口
export interface UseBrowserCompatibilityOptions {
  /** 是否自动应用兼容性修复 */
  autoApplyFixes?: boolean
  /** 是否自动加载polyfills */
  autoLoadPolyfills?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
}

// Hook返回值接口
export interface UseBrowserCompatibilityReturn {
  /** 浏览器信息 */
  browserInfo: BrowserInfo | null
  /** 兼容性检查结果 */
  compatibility: CompatibilityResult | null
  /** 是否为旧版浏览器 */
  isLegacyBrowser: boolean
  /** 是否为移动设备 */
  isMobile: boolean
  /** 是否为桌面设备 */
  isDesktop: boolean
  /** 检查功能支持 */
  supportsFeature: (featureName: string) => boolean
  /** 获取降级方案 */
  getFallback: (featureName: string) => string | null
  /** 应用兼容性修复 */
  applyFixes: () => void
  /** 加载polyfills */
  loadPolyfills: (features?: string[]) => Promise<void>
  /** 功能支持列表 */
  supportedFeatures: FeatureSupport[]
  /** 不支持的功能列表 */
  unsupportedFeatures: FeatureSupport[]
  /** 需要的polyfills列表 */
  requiredPolyfills: string[]
  /** 兼容性建议 */
  recommendations: string[]
}

/**
 * 浏览器兼容性Hook
 */
export function useBrowserCompatibility(
  options: UseBrowserCompatibilityOptions = {}
): UseBrowserCompatibilityReturn {
  const {
    autoApplyFixes = true,
    autoLoadPolyfills = true,
    enablePerformanceMonitoring = false
  } = options

  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const managerRef = useRef<BrowserCompatibilityManager>(browserCompatibility)

  const performanceTimerRef = useRef<number | null>(null)

  // 初始化兼容性检查
  useEffect(() => {
    const initCompatibility = async () => {
      if (enablePerformanceMonitoring && performanceTimerRef.current) {
        performance.mark('compatibility-check-start')
      }

      try {
        const manager = managerRef.current
        const info = manager.getBrowserInfo()
        const report = manager.getCompatibilityReport()

        setBrowserInfo(info)
        setCompatibility(report)

        // 自动应用修复
        if (autoApplyFixes) {
          manager.applyCompatibilityFixes()
        }

        // 自动加载polyfills
        if (autoLoadPolyfills && report.polyfills.length > 0) {
          try {
            await manager.loadPolyfills(report.polyfills)
          } catch (error) {
            console.warn('Failed to load polyfills:', error)
          }
        }

        if (enablePerformanceMonitoring && performanceTimerRef.current) {
          performance.mark('compatibility-check-end')
          performance.measure(
            'compatibility-check-duration',
            'compatibility-check-start',
            'compatibility-check-end'
          )
        }
      } catch (error) {
        console.error('Browser compatibility check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initCompatibility()

    return () => {
      if (performanceTimerRef.current) {
        performance.clearMarks?.('compatibility-check-start')
        performance.clearMarks?.('compatibility-check-end')
        performance.clearMeasures?.('compatibility-check-duration')
      }
    }
  }, [autoApplyFixes, autoLoadPolyfills, enablePerformanceMonitoring])

  // 检查功能支持
  const supportsFeature = useCallback((featureName: string): boolean => {
    return managerRef.current.checkFeatureSupport()
      .some(f => f.name === featureName && f.supported)
  }, [])

  // 获取降级方案
  const getFallback = useCallback((featureName: string): string | null => {
    const features = managerRef.current.checkFeatureSupport()
    const feature = features.find(f => f.name === featureName)
    return feature?.fallback || null
  }, [])

  // 应用兼容性修复
  const applyFixes = useCallback(() => {
    managerRef.current.applyCompatibilityFixes()
  }, [])

  // 加载polyfills
  const loadPolyfills = useCallback(async (features?: string[]) => {
    const polyfills = features || compatibility?.polyfills || []
    if (polyfills.length > 0) {
      await managerRef.current.loadPolyfills(polyfills)
    }
  }, [compatibility?.polyfills])

  // 计算派生状态
  const isLegacyBrowser = browserUtils.isLegacyBrowser()
  const isMobile = browserUtils.isMobile()
  const isDesktop = browserUtils.isDesktop()
  const supportedFeatures = compatibility?.features.filter(f => f.supported) || []
  const unsupportedFeatures = compatibility?.features.filter(f => !f.supported) || []
  const requiredPolyfills = compatibility?.polyfills || []
  const recommendations = compatibility?.recommendations || []

  return {
    browserInfo,
    compatibility,
    isLegacyBrowser,
    isMobile,
    isDesktop,
    supportsFeature,
    getFallback,
    applyFixes,
    loadPolyfills,
    supportedFeatures,
    unsupportedFeatures,
    requiredPolyfills,
    recommendations
  }
}

/**
 * 功能检测Hook
 */
export function useFeatureDetection(features: string[]): Record<string, boolean> {
  const [supportStatus, setSupportStatus] = useState<Record<string, boolean>>({})
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const manager = managerRef.current
    const allFeatures = manager.checkFeatureSupport()

    const status: Record<string, boolean> = {}
    features.forEach(featureName => {
      const feature = allFeatures.find(f => f.name === featureName)
      status[featureName] = feature?.supported ?? false
    })

    setSupportStatus(status)
    setIsChecking(false)
  }, [features])

  return supportStatus
}

/**
 * 响应式设计Hook
 */
export function useResponsiveDesign() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')

  useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window === 'undefined') return

      const width = window.innerWidth

      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }

      setOrientation(width > window.innerHeight ? 'landscape' : 'portrait')
    }

    updateScreenSize()

    window.addEventListener('resize', updateScreenSize)
    window.addEventListener('orientationchange', updateScreenSize)

    return () => {
      window.removeEventListener('resize', updateScreenSize)
      window.removeEventListener('orientationchange', updateScreenSize)
    }
  }, [])

  return {
    screenSize,
    orientation,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  }
}

/**
 * 浏览器警告Hook
 */
export function useBrowserWarnings() {
  const [warnings, setWarnings] = useState<string[]>([])
  const { isLegacyBrowser, browserInfo, compatibility } = useBrowserCompatibility()

  useEffect(() => {
    const newWarnings: string[] = []

    if (isLegacyBrowser && browserInfo) {
      newWarnings.push(
        `您正在使用较旧版本的${browserInfo.name} (${browserInfo.version})，某些功能可能无法正常工作。建议升级到最新版本。`
      )
    }

    if (compatibility?.unsupportedFeatures.length) {
      const criticalFeatures = compatibility.unsupportedFeatures.filter(f =>
        f.name.includes('localstorage') ||
        f.name.includes('fetch') ||
        f.name.includes('promise')
      )

      if (criticalFeatures.length > 0) {
        newWarnings.push(
          '您的浏览器不支持某些核心功能，可能会影响应用体验。'
        )
      }
    }

    setWarnings(newWarnings)
  }, [isLegacyBrowser, browserInfo, compatibility])

  const dismissWarning = useCallback((index: number) => {
    setWarnings(prev => prev.filter((_, i) => i !== index))
  }, [])

  return {
    warnings,
    hasWarnings: warnings.length > 0,
    dismissWarning,
    clearAllWarnings: () => setWarnings([])
  }
}

/**
 * Polyfill管理Hook
 */
export function usePolyfillManager() {
  const [loadedPolyfills, setLoadedPolyfills] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { compatibility, loadPolyfills } = useBrowserCompatibility({ autoLoadPolyfills: false })

  const loadSpecificPolyfills = useCallback(async (polyfills: string[]) => {
    setIsLoading(true)
    try {
      await loadPolyfills(polyfills)
      setLoadedPolyfills(prev => [...prev, ...polyfills])
    } catch (error) {
      console.error('Failed to load polyfills:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadPolyfills])

  const isPolyfillLoaded = useCallback((polyfill: string) => {
    return loadedPolyfills.includes(polyfill)
  }, [loadedPolyfills])

  return {
    loadedPolyfills,
    isLoading,
    requiredPolyfills: compatibility?.polyfills || [],
    loadSpecificPolyfills,
    isPolyfillLoaded
  }
}

/**
 * 浏览器性能优化Hook
 */
export function useBrowserOptimizations() {
  const { isMobile, browserInfo } = useBrowserCompatibility()
  const [optimizations, setOptimizations] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const opts: Record<string, boolean> = {
      // 移动设备优化
      reduceAnimations: isMobile,
      enableTouchOptimizations: isMobile,
      disableHoverEffects: isMobile,

      // 基于浏览器版本的优化
      enableModernCSS: !browserInfo || (
        (browserInfo.name === 'chrome' && parseFloat(browserInfo.version) >= 60) ||
        (browserInfo.name === 'firefox' && parseFloat(browserInfo.version) >= 55) ||
        (browserInfo.name === 'safari' && parseFloat(browserInfo.version) >= 12) ||
        (browserInfo.name === 'edge' && parseFloat(browserInfo.version) >= 79)
      ),

      // 性能优化
      enableIntersectionObserver: typeof IntersectionObserver !== 'undefined',
      enableResizeObserver: typeof ResizeObserver !== 'undefined',
      enableRequestIdleCallback: typeof requestIdleCallback !== 'undefined',

      // 存储优化
      useLocalStorage: browserUtils.supportsFeature('localstorage'),
      useSessionStorage: browserUtils.supportsFeature('sessionstorage'),
    }

    setOptimizations(opts)
  }, [isMobile, browserInfo])

  const getOptimizationValue = useCallback((key: string): boolean => {
    return optimizations[key] ?? false
  }, [optimizations])

  return {
    optimizations,
    getOptimizationValue,
    shouldReduceAnimations: optimizations.reduceAnimations ?? false,
    shouldEnableTouchOptimizations: optimizations.enableTouchOptimizations ?? false,
    shouldUseModernCSS: optimizations.enableModernCSS ?? true
  }
}