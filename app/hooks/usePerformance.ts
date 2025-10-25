import { useEffect, useState, useCallback, useRef } from 'react'
import { performanceMonitor, measureAsyncFunction } from '~/lib/performance'
import type {
  PerformanceMetrics,
  PerformanceReport,
  OperationMetric,
  PerformanceScore
} from '~/types/performance'

/**
 * 性能监控Hook
 */
export function usePerformance(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [score, setScore] = useState<PerformanceScore | null>(null)
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const reportIntervalRef = useRef<NodeJS.Timeout>()

  /**
   * 开始监控
   */
  const startMonitoring = useCallback(() => {
    if (!enabled) return

    setIsMonitoring(true)
    performanceMonitor.updateConfig({ enabled: true })

    // 定期更新指标
    const updateMetrics = async () => {
      try {
        const currentMetrics = await performanceMonitor.getCurrentMetrics()
        setMetrics(currentMetrics)

        // 计算评分
        const reportData = await performanceMonitor.generateReport()
        setScore(reportData.score)
      } catch (error) {
        console.warn('性能指标获取失败:', error)
      }
    }

    // 立即更新一次
    updateMetrics()

    // 定期更新
    reportIntervalRef.current = setInterval(updateMetrics, 5000)
  }, [enabled])

  /**
   * 停止监控
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    performanceMonitor.updateConfig({ enabled: false })

    if (reportIntervalRef.current) {
      clearInterval(reportIntervalRef.current)
    }
  }, [])

  /**
   * 记录操作
   */
  const measureOperation = useCallback(<T>(
    fn: () => Promise<T>,
    name: string,
    type: OperationMetric['type']
  ) => {
    if (!enabled) {
      return fn()
    }

    return measureAsyncFunction(fn, name, type).then(({ result }) => result)
  }, [enabled])

  /**
   * 生成性能报告
   */
  const generateReport = useCallback(async () => {
    if (!enabled) return null

    try {
      const reportData = await performanceMonitor.generateReport()
      setReport(reportData)
      return reportData
    } catch (error) {
      console.warn('性能报告生成失败:', error)
      return null
    }
  }, [enabled])

  /**
   * 上报性能数据
   */
  const reportMetrics = useCallback(async () => {
    if (!enabled) return

    try {
      await performanceMonitor.reportMetrics()
    } catch (error) {
      console.warn('性能数据上报失败:', error)
    }
  }, [enabled])

  // 组件挂载时自动开始监控
  useEffect(() => {
    if (enabled) {
      startMonitoring()
    }

    return () => {
      stopMonitoring()
    }
  }, [enabled, startMonitoring, stopMonitoring])

  return {
    metrics,
    score,
    report,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureOperation,
    generateReport,
    reportMetrics
  }
}

/**
 * 操作性能监控Hook
 */
export function useOperationPerformance(name: string, type: OperationMetric['type']) {
  const [lastOperation, setLastOperation] = useState<OperationMetric | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsRunning(true)

    try {
      const { result, metric } = await measureAsyncFunction(fn, name, type)
      setLastOperation(metric)
      return result
    } finally {
      setIsRunning(false)
    }
  }, [name, type])

  return {
    execute,
    lastOperation,
    isRunning
  }
}

/**
 * 页面加载性能Hook
 */
export function usePageLoadPerformance() {
  const [loadMetrics, setLoadMetrics] = useState<{
    domContentLoaded: number
    loadComplete: number
    firstPaint: number
    firstContentfulPaint: number
  } | null>(null)

  useEffect(() => {
    const measurePageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      if (navigation && paint.length > 0) {
        const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0
        const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0

        setLoadMetrics({
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint,
          firstContentfulPaint
        })
      }
    }

    // 页面加载完成后测量
    if (document.readyState === 'complete') {
      measurePageLoad()
    } else {
      window.addEventListener('load', measurePageLoad)
      return () => window.removeEventListener('load', measurePageLoad)
    }
  }, [])

  return loadMetrics
}

/**
 * 内存使用监控Hook
 */
export function useMemoryMonitoring(interval: number = 5000) {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    limit: number
    trend: 'increasing' | 'decreasing' | 'stable'
  } | null>(null)

  const previousUsed = useRef<number>(0)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory as MemoryInfo

        const currentUsed = memory.usedJSHeapSize
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'

        if (previousUsed.current > 0) {
          const change = currentUsed - previousUsed.current
          if (change > 1024 * 1024) { // 1MB
            trend = 'increasing'
          } else if (change < -1024 * 1024) {
            trend = 'decreasing'
          }
        }

        previousUsed.current = currentUsed

        setMemoryInfo({
          used: currentUsed,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          trend
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, interval)

    return () => clearInterval(interval)
  }, [interval])

  return memoryInfo
}

/**
 * 性能警告Hook
 */
export function usePerformanceWarnings() {
  const [warnings, setWarnings] = useState<string[]>([])

  useEffect(() => {
    const checkPerformanceWarnings = () => {
      const newWarnings: string[] = []

      // 检查长任务
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // 长于50ms的任务
              newWarnings.push(`检测到长任务: ${entry.duration.toFixed(2)}ms`)
            }
          }
        })

        observer.observe({ entryTypes: ['longtask'] })

        return () => observer.disconnect()
      }

      setWarnings(newWarnings)
    }

    const interval = setInterval(checkPerformanceWarnings, 10000)
    checkPerformanceWarnings()

    return () => clearInterval(interval)
  }, [])

  return warnings
}