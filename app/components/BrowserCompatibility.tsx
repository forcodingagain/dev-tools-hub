/**
 * 浏览器兼容性组件
 * 提供兼容性警告、polyfill管理和优雅降级功能
 */

import React, { useState, useEffect } from 'react'
import {
  useBrowserCompatibility,
  useBrowserWarnings,
  usePolyfillManager,
  useBrowserOptimizations
} from '~/hooks/useBrowserCompatibility'

interface BrowserCompatibilityProviderProps {
  children: React.ReactNode
  /** 是否启用自动polyfill加载 */
  autoLoadPolyfills?: boolean
  /** 是否显示兼容性警告 */
  showWarnings?: boolean
  /** 是否启用性能优化 */
  enableOptimizations?: boolean
}

/**
 * 浏览器兼容性提供者组件
 */
export function BrowserCompatibilityProvider({
  children,
  autoLoadPolyfills = true,
  showWarnings = true,
  enableOptimizations = true
}: BrowserCompatibilityProviderProps) {
  const {
    browserInfo,
    isLegacyBrowser,
    applyFixes,
    loadPolyfills,
    requiredPolyfills
  } = useBrowserCompatibility({
    autoApplyFixes: true,
    autoLoadPolyfills
  })

  const { warnings, dismissWarning } = useBrowserWarnings()
  const { loadedPolyfills, isLoading: isPolyfillLoading } = usePolyfillManager()
  const { optimizations } = useBrowserOptimizations()

  // 应用CSS类名到body元素
  useEffect(() => {
    if (typeof document === 'undefined') return

    const body = document.body

    // 添加浏览器标识类
    if (browserInfo) {
      body.className = body.className
        .replace(/browser-\w+/g, '')
        .trim()
      body.className += ` browser-${browserInfo.name}`
      body.className += ` browser-v${browserInfo.version.split('.')[0]}`
    }

    // 添加设备类型类
    if (optimizations.enableTouchOptimizations) {
      body.classList.add('touch-device')
    } else {
      body.classList.remove('touch-device')
    }

    // 添加优化类
    if (optimizations.reduceAnimations) {
      body.classList.add('reduce-animations')
    }

    if (optimizations.enableModernCSS) {
      body.classList.add('modern-css')
    }

    // 添加兼容性状态类
    if (isLegacyBrowser) {
      body.classList.add('legacy-browser')
    }

    return () => {
      // 清理类名
      body.className = body.className
        .replace(/browser-\w+/g, '')
        .replace(/browser-v\w+/g, '')
        .replace(/touch-device|reduce-animations|modern-css|legacy-browser/g, '')
        .trim()
    }
  }, [browserInfo, optimizations, isLegacyBrowser])

  // 手动加载polyfills
  useEffect(() => {
    if (!autoLoadPolyfills && requiredPolyfills.length > 0 && loadedPolyfills.length === 0) {
      loadPolyfills(requiredPolyfills)
    }
  }, [autoLoadPolyfills, requiredPolyfills, loadedPolyfills.length, loadPolyfills])

  return (
    <>
      {/* 兼容性警告 */}
      {showWarnings && warnings.length > 0 && (
        <BrowserWarnings
          warnings={warnings}
          onDismiss={dismissWarning}
          isLoading={isPolyfillLoading}
        />
      )}

      {/* 降级提示 */}
      {isLegacyBrowser && (
        <LegacyBrowserNotification />
      )}

      {/* 传递优化上下文 */}
      <BrowserOptimizationContext.Provider value={optimizations}>
        {children}
      </BrowserOptimizationContext.Provider>
    </>
  )
}

/**
 * 浏览器警告组件
 */
interface BrowserWarningsProps {
  warnings: string[]
  onDismiss: (index: number) => void
  isLoading?: boolean
}

function BrowserWarnings({ warnings, onDismiss, isLoading }: BrowserWarningsProps) {
  const [visible, setVisible] = useState(true)

  if (!visible || warnings.length === 0) return null

  return (
    <div
      className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              浏览器兼容性提醒
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              {warnings.map((warning, index) => (
                <p key={index} className="mb-1 last:mb-0">
                  {warning}
                </p>
              ))}
            </div>
            {isLoading && (
              <div className="mt-2 text-xs text-amber-600">
                正在加载兼容性组件...
              </div>
            )}
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="inline-flex bg-amber-50 rounded-md p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600"
                aria-label="关闭警告"
              >
                <span className="sr-only">关闭</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 旧版浏览器通知组件
 */
function LegacyBrowserNotification() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              浏览器版本过低
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                您正在使用的浏览器版本较旧，可能无法完全支持本站的所有功能。
                建议升级到最新版本的浏览器以获得更好的体验。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://www.google.com/chrome/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Chrome
                </a>
                <a
                  href="https://www.mozilla.org/firefox/new/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Firefox
                </a>
                <a
                  href="https://www.microsoft.com/edge/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                  Edge
                </a>
                <a
                  href="https://www.apple.com/safari/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Safari
                </a>
              </div>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              aria-label="关闭通知"
            >
              <span className="sr-only">关闭</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 浏览器优化上下文
 */
export const BrowserOptimizationContext = React.createContext<Record<string, boolean>>({})

/**
 * 使用浏览器优化的Hook
 */
export function useBrowserOptimizations() {
  const context = React.useContext(BrowserOptimizationContext)
  if (!context) {
    throw new Error('useBrowserOptimizations must be used within BrowserCompatibilityProvider')
  }
  return context
}

/**
 * 条件渲染组件 - 基于浏览器兼容性
 */
interface ConditionalRenderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredFeatures?: string[]
  minBrowserVersion?: {
    chrome?: number
    firefox?: number
    safari?: number
    edge?: number
  }
}

export function ConditionalRender({
  children,
  fallback,
  requiredFeatures = [],
  minBrowserVersion = {}
}: ConditionalRenderProps) {
  const { browserInfo, supportsFeature } = useBrowserCompatibility()

  // 检查浏览器版本要求
  const meetsVersionRequirement = !browserInfo || (() => {
    const version = parseFloat(browserInfo.version)
    const minVersion = minBrowserVersion[browserInfo.name as keyof typeof minBrowserVersion]
    return minVersion ? version >= minVersion : true
  })()

  // 检查功能支持要求
  const meetsFeatureRequirements = requiredFeatures.every(feature => supportsFeature(feature))

  if (meetsVersionRequirement && meetsFeatureRequirements) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * 优雅降级组件
 */
interface GracefulDegradationProps {
  modern: React.ReactNode
  fallback: React.ReactNode
  features: string[]
}

export function GracefulDegradation({ modern, fallback, features }: GracefulDegradationProps) {
  const { supportsFeature } = useBrowserCompatibility()

  const allFeaturesSupported = features.every(feature => supportsFeature(feature))

  return <>{allFeaturesSupported ? modern : fallback}</>
}