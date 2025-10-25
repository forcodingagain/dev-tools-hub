/**
 * 加载状态相关Hook
 * 提供加载状态管理、骨架屏控制和智能预加载功能
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  LoadingState,
  LoadingConfig,
  SkeletonConfig,
  LoadingContext,
  LazyLoadConfig,
  SmartPreloadConfig
} from '~/types/loading'
import {
  smartLoadingManager,
  loadingStateManager,
  lazyLoadManager
} from '~/lib/loadingManager'

/**
 * 全局加载状态Hook
 */
export function useLoading(): LoadingContext {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<LoadingState>('idle')
  const [loadingText, setLoadingText] = useState('')

  // 监听加载状态管理器的变化
  useEffect(() => {
    const unsubscribe = loadingStateManager.subscribe((newStatus, newText) => {
      const isCurrentlyLoading = newStatus === 'loading'
      setIsLoading(isCurrentlyLoading)
      setStatus(newStatus)
      setLoadingText(newText)

      if (!isCurrentlyLoading) {
        setProgress(0)
      }
    })

    // 初始化状态
    const currentState = loadingStateManager.getState()
    setIsLoading(currentState.state === 'loading')
    setStatus(currentState.state)
    setLoadingText(currentState.text)

    return unsubscribe
  }, [])

  // 更新进度的effect
  useEffect(() => {
    if (!isLoading) return

    const updateProgress = () => {
      const activeLoadings = smartLoadingManager.getActiveLoadings()
      if (activeLoadings.length > 0) {
        const totalProgress = activeLoadings.reduce((sum, name) => {
          return sum + smartLoadingManager.getProgress(name)
        }, 0)
        setProgress(Math.round(totalProgress / activeLoadings.length))
      }
    }

    const interval = setInterval(updateProgress, 100)
    return () => clearInterval(interval)
  }, [isLoading])

  const setLoading = useCallback((loading: boolean, text = '') => {
    if (loading) {
      loadingStateManager.showLoading(text)
    } else {
      loadingStateManager.hideLoading()
    }
  }, [])

  const setProgressCallback = useCallback((newProgress: number, text = '') => {
    setProgress(Math.max(0, Math.min(100, newProgress)))
    if (text) {
      setLoadingText(text)
    }
  }, [])

  const setStatusCallback = useCallback((newStatus: LoadingState, text = '') => {
    loadingStateManager.setState(newStatus, text)
  }, [])

  const showLoading = useCallback((config?: LoadingConfig) => {
    const text = config?.loadingText || '加载中...'
    loadingStateManager.showLoading(text)
  }, [])

  const hideLoading = useCallback(() => {
    loadingStateManager.hideLoading()
  }, [])

  return {
    isLoading,
    progress,
    status,
    loadingText,
    setLoading,
    setProgress: setProgressCallback,
    setStatus: setStatusCallback,
    showLoading,
    hideLoading
  }
}

/**
 * 异步操作Hook
 */
export function useAsyncOperation<T = any>(
  name: string,
  config?: LoadingConfig
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async (
    operation: () => Promise<T>,
    customConfig?: LoadingConfig
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    const finalConfig = { ...config, ...customConfig }

    // 直接使用loadingStateManager，避免循环依赖
    const loadingText = finalConfig?.loadingText || '加载中...'
    loadingStateManager.showLoading(loadingText)

    try {
      const result = await smartLoadingManager.createControlledPromise(
        name,
        operation,
        finalConfig
      )
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return null
    } finally {
      setLoading(false)
      loadingStateManager.hideLoading()
    }
  }, [name, config])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    error,
    loading,
    execute,
    reset
  }
}

/**
 * 骨架屏Hook
 */
export function useSkeleton(config: SkeletonConfig = {}) {
  const [isVisible, setIsVisible] = useState(true)
  const {
    animation = 'shimmer',
    color = '#e5e7eb',
    highlightColor = '#f3f4f6',
    speed = 'normal',
    borderRadius = '0.375rem'
  } = config

  const showSkeleton = useCallback(() => {
    setIsVisible(true)
  }, [])

  const hideSkeleton = useCallback(() => {
    setIsVisible(false)
  }, [])

  const getSkeletonStyle = useCallback(() => ({
    backgroundColor: color,
    borderRadius,
    ...(animation === 'shimmer' && {
      backgroundImage: `linear-gradient(90deg, ${color} 0%, ${highlightColor} 50%, ${color} 100%)`,
      backgroundSize: '200% 100%',
      animation: `shimmer ${speed === 'slow' ? '3s' : speed === 'fast' ? '1s' : '2s'} infinite`
    }),
    ...(animation === 'pulse' && {
      animation: `pulse ${speed === 'slow' ? '3s' : speed === 'fast' ? '1s' : '2s'} infinite`
    })
  }), [animation, color, highlightColor, speed, borderRadius])

  return {
    isVisible,
    showSkeleton,
    hideSkeleton,
    getSkeletonStyle
  }
}

/**
 * 延迟加载Hook
 */
export function useLazyLoad(
  config: LazyLoadConfig = {}
) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const elementRef = useRef<Element | null>(null)

  const {
    rootMargin = '50px',
    threshold = 0.1,
    delay = 0,
    retryCount = 3
  } = config

  const load = useCallback(async (loadFunction: () => Promise<any>) => {
    if (isLoaded || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      await loadFunction()
      setIsLoaded(true)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Load failed')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, isLoading, delay])

  const observe = useCallback((element: Element) => {
    elementRef.current = element

    const observerId = lazyLoadManager.observe(element, () => {
      // 元素进入视野，触发加载
      // 这里只是示例，实际的加载逻辑需要在具体使用时实现
    }, { rootMargin, threshold })

    return () => {
      lazyLoadManager.unobserve(observerId)
    }
  }, [rootMargin, threshold])

  const retry = useCallback(() => {
    if (elementRef.current && retryCount > 0) {
      setIsLoaded(false)
      setError(null)
      // 重新观察元素
    }
  }, [retryCount])

  return {
    isLoaded,
    isLoading,
    error,
    load,
    observe,
    retry
  }
}

/**
 * 智能预加载Hook
 */
export function useSmartPreload(config: SmartPreloadConfig = {}) {
  const [preloadedItems, setPreloadedItems] = useState<Set<string>>(new Set())
  const [preloading, setPreloading] = useState<Set<string>>(new Set())

  const {
    basedOnUserBehavior = true,
    preloadOnIdle = true,
    preloadOnHover = true,
    preloadOnVisible = false,
    preloadDelay = 1000,
    maxPreloads = 5
  } = config

  const preload = useCallback(async (
    name: string,
    loadFunction: () => Promise<any>
  ) => {
    if (preloadedItems.has(name) || preloading.has(name)) return
    if (preloadedItems.size >= maxPreloads) return

    setPreloading(prev => new Set([...prev, name]))

    try {
      if (preloadDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, preloadDelay))
      }

      await loadFunction()
      setPreloadedItems(prev => new Set([...prev, name]))
    } catch (error) {
      console.warn(`Failed to preload ${name}:`, error)
    } finally {
      setPreloading(prev => {
        const next = new Set(prev)
        next.delete(name)
        return next
      })
    }
  }, [preloadedItems, preloading, preloadDelay, maxPreloads])

  const preloadOnIdleCallback = useCallback(() => {
    if (!preloadOnIdle) return

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // 在空闲时预加载内容
      })
    } else {
      setTimeout(() => {
        // 降级方案
      }, 100)
    }
  }, [preloadOnIdle])

  // 悬停预加载
  const hoverPreload = useCallback((
    name: string,
    loadFunction: () => Promise<any>
  ) => {
    if (!preloadOnHover) return

    const timeout = setTimeout(() => {
      preload(name, loadFunction)
    }, 200) // 200ms延迟

    return () => clearTimeout(timeout)
  }, [preloadOnHover, preload])

  // 基于用户行为的预加载
  useEffect(() => {
    if (!basedOnUserBehavior) return

    // 分析用户行为模式并智能预加载
    const analyzeBehavior = () => {
      // 这里可以实现复杂的用户行为分析
      // 例如：用户经常访问的页面、点击的按钮等
    }

    const interval = setInterval(analyzeBehavior, 5000)
    return () => clearInterval(interval)
  }, [basedOnUserBehavior])

  return {
    preload,
    preloadOnIdle: preloadOnIdleCallback,
    hoverPreload,
    preloadedItems: Array.from(preloadedItems),
    preloading: Array.from(preloading)
  }
}

/**
 * 加载性能监控Hook
 */
export function useLoadingMetrics() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    const updateMetrics = () => {
      const allMetrics = smartLoadingManager.getMetrics()
      const performanceStats = smartLoadingManager.getPerformanceStats()

      setMetrics(allMetrics.slice(-20)) // 显示最近20条记录
      setStats(performanceStats)
    }

    updateMetrics()

    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [])

  const getAverageLoadTime = useCallback((type?: string) => {
    return smartLoadingManager.getAverageLoadTime(type)
  }, [])

  const predictLoadTime = useCallback((type: string) => {
    return smartLoadingManager.predictLoadTime(type)
  }, [])

  return {
    metrics,
    stats,
    getAverageLoadTime,
    predictLoadTime
  }
}

/**
 * 骨架屏块Hook
 */
export function useSkeletonBlocks(blocks: any[] = []) {
  const [visibleBlocks, setVisibleBlocks] = useState<Set<number>>(new Set())

  const showBlock = useCallback((index: number) => {
    setVisibleBlocks(prev => new Set([...prev, index]))
  }, [])

  const hideBlock = useCallback((index: number) => {
    setVisibleBlocks(prev => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }, [])

  const showAllBlocks = useCallback(() => {
    const allIndices = blocks.map((_, index) => index)
    setVisibleBlocks(new Set(allIndices))
  }, [blocks])

  const hideAllBlocks = useCallback(() => {
    setVisibleBlocks(new Set())
  }, [])

  return {
    visibleBlocks,
    showBlock,
    hideBlock,
    showAllBlocks,
    hideAllBlocks
  }
}