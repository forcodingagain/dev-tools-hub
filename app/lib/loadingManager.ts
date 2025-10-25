/**
 * 智能加载管理器
 * 提供加载状态管理、性能监控和智能预加载功能
 */

import {
  LoadingState,
  LoadingConfig,
  LoadingMetrics,
  SmartLoadingManager as ISmartLoadingManager
} from '~/types/loading'

/**
 * 智能加载管理器实现
 */
export class SmartLoadingManager implements ISmartLoadingManager {
  private static instance: SmartLoadingManager
  private metrics: Map<string, LoadingMetrics[]> = new Map()
  private activeLoadings: Map<string, LoadingMetrics> = new Map()
  private loadingPromises: Map<string, Promise<any>> = new Map()
  private config: LoadingConfig = {}

  private constructor() {}

  static getInstance(): SmartLoadingManager {
    if (!SmartLoadingManager.instance) {
      SmartLoadingManager.instance = new SmartLoadingManager()
    }
    return SmartLoadingManager.instance
  }

  /**
   * 开始监控加载
   */
  startMonitoring(name: string): void {
    const metric: LoadingMetrics = {
      startTime: performance.now(),
      type: name,
      success: false
    }

    this.activeLoadings.set(name, metric)

    // 如果该类型的指标数组不存在，则创建
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
  }

  /**
   * 结束监控加载
   */
  endMonitoring(name: string, success = true, error?: string): void {
    const metric = this.activeLoadings.get(name)
    if (!metric) return

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime
    metric.success = success
    metric.error = error

    // 将指标添加到历史记录
    const typeMetrics = this.metrics.get(name)!
    typeMetrics.push(metric)

    // 保持最近100次记录
    if (typeMetrics.length > 100) {
      typeMetrics.shift()
    }

    // 清理活动加载
    this.activeLoadings.delete(name)
    this.loadingPromises.delete(name)
  }

  /**
   * 获取加载指标
   */
  getMetrics(name?: string): LoadingMetrics[] {
    if (name) {
      return this.metrics.get(name) || []
    }

    const allMetrics: LoadingMetrics[] = []
    this.metrics.forEach(metrics => {
      allMetrics.push(...metrics)
    })
    return allMetrics
  }

  /**
   * 获取平均加载时间
   */
  getAverageLoadTime(type?: string): number {
    const metrics = this.getMetrics(type)
    if (metrics.length === 0) return 0

    const successfulMetrics = metrics.filter(m => m.success && m.duration)
    if (successfulMetrics.length === 0) return 0

    const total = successfulMetrics.reduce((sum, m) => sum + m.duration!, 0)
    return total / successfulMetrics.length
  }

  /**
   * 预测加载时间
   */
  predictLoadTime(type: string): number {
    return this.getAverageLoadTime(type)
  }

  /**
   * 创建受控的异步操作
   */
  async createControlledPromise<T>(
    name: string,
    promiseFactory: () => Promise<T>,
    config?: LoadingConfig
  ): Promise<T> {
    // 如果已经在加载中，返回现有的promise
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)
    }

    this.startMonitoring(name)
    this.config = config || {}

    const promise = promiseFactory()
      .then(result => {
        this.endMonitoring(name, true)
        return result
      })
      .catch(error => {
        this.endMonitoring(name, false, error.message)
        throw error
      })

    this.loadingPromises.set(name, promise)
    return promise
  }

  /**
   * 取消加载
   */
  cancelLoading(name: string): void {
    this.activeLoadings.delete(name)
    this.loadingPromises.delete(name)
    this.endMonitoring(name, false, 'Cancelled')
  }

  /**
   * 获取当前活动加载列表
   */
  getActiveLoadings(): string[] {
    return Array.from(this.activeLoadings.keys())
  }

  /**
   * 检查是否正在加载
   */
  isLoading(name?: string): boolean {
    if (name) {
      return this.activeLoadings.has(name)
    }
    return this.activeLoadings.size > 0
  }

  /**
   * 获取加载进度（基于历史数据估算）
   */
  getProgress(name: string): number {
    const metric = this.activeLoadings.get(name)
    if (!metric) return 0

    const averageTime = this.predictLoadTime(name)
    if (averageTime === 0) return 0

    const elapsed = performance.now() - metric.startTime
    return Math.min((elapsed / averageTime) * 100, 95) // 最多显示95%
  }

  /**
   * 清理旧的指标数据
   */
  cleanup(olderThan = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan

    this.metrics.forEach((metrics, key) => {
      const filtered = metrics.filter(m => m.startTime > cutoff)
      if (filtered.length === 0) {
        this.metrics.delete(key)
      } else {
        this.metrics.set(key, filtered)
      }
    })
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const stats: Record<string, any> = {}

    this.metrics.forEach((metrics, type) => {
      const successful = metrics.filter(m => m.success && m.duration)
      const failed = metrics.filter(m => !m.success)

      if (successful.length > 0) {
        const durations = successful.map(m => m.duration!)
        stats[type] = {
          count: metrics.length,
          successCount: successful.length,
          failureCount: failed.length,
          successRate: (successful.length / metrics.length) * 100,
          averageTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
          minTime: Math.min(...durations),
          maxTime: Math.max(...durations),
          lastLoad: successful[successful.length - 1]?.startTime || 0
        }
      }
    })

    return stats
  }
}

// 导出单例实例
export const smartLoadingManager = SmartLoadingManager.getInstance()

/**
 * 加载状态管理器
 */
export class LoadingStateManager {
  private static instance: LoadingStateManager
  private listeners: Set<(state: LoadingState, text: string) => void> = new Set()
  private currentState: LoadingState = 'idle'
  private currentText = ''

  private constructor() {}

  static getInstance(): LoadingStateManager {
    if (!LoadingStateManager.instance) {
      LoadingStateManager.instance = new LoadingStateManager()
    }
    return LoadingStateManager.instance
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: LoadingState, text: string) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 更新状态
   */
  setState(state: LoadingState, text = ''): void {
    this.currentState = state
    this.currentText = text
    this.notifyListeners()
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.currentState, this.currentText)
    })
  }

  /**
   * 获取当前状态
   */
  getState(): { state: LoadingState; text: string } {
    return {
      state: this.currentState,
      text: this.currentText
    }
  }

  /**
   * 显示加载
   */
  showLoading(text = '加载中...'): void {
    this.setState('loading', text)
  }

  /**
   * 隐藏加载
   */
  hideLoading(): void {
    this.setState('idle', '')
  }

  /**
   * 显示成功
   */
  showSuccess(text = '操作成功'): void {
    this.setState('success', text)
    setTimeout(() => this.setState('idle', ''), 2000)
  }

  /**
   * 显示错误
   */
  showError(text = '操作失败'): void {
    this.setState('error', text)
    setTimeout(() => this.setState('idle', ''), 3000)
  }
}

// 导出单例实例
export const loadingStateManager = LoadingStateManager.getInstance()

/**
 * 骨架屏生成器
 */
export class SkeletonGenerator {
  /**
   * 生成骨架屏样式
   */
  static generateSkeletonStyle(config: {
    animation?: 'pulse' | 'wave' | 'shimmer' | 'fade'
    color?: string
    highlightColor?: string
    speed?: 'slow' | 'normal' | 'fast'
  } = {}): React.CSSProperties {
    const {
      animation = 'shimmer',
      color = '#e5e7eb',
      highlightColor = '#f3f4f6',
      speed = 'normal'
    } = config

    const speedMap = {
      slow: '3s',
      normal: '2s',
      fast: '1s'
    }

    const baseStyle: React.CSSProperties = {
      backgroundColor: color,
      borderRadius: '0.375rem'
    }

    if (animation === 'shimmer') {
      return {
        ...baseStyle,
        backgroundImage: `linear-gradient(90deg, ${color} 0%, ${highlightColor} 50%, ${color} 100%)`,
        backgroundSize: '200% 100%',
        animation: `shimmer ${speedMap[speed]} infinite`
      }
    }

    if (animation === 'pulse') {
      return {
        ...baseStyle,
        animation: `pulse ${speedMap[speed]} infinite`
      }
    }

    if (animation === 'wave') {
      return {
        ...baseStyle,
        backgroundImage: `linear-gradient(90deg, transparent 0%, ${highlightColor} 20%, transparent 40%)`,
        backgroundSize: '200% 100%',
        animation: `wave ${speedMap[speed]} infinite`
      }
    }

    return baseStyle
  }

  /**
   * 生成骨架屏类名
   */
  static generateSkeletonClasses(config: {
    animation?: 'pulse' | 'wave' | 'shimmer' | 'fade'
    speed?: 'slow' | 'normal' | 'fast'
  } = {}): string {
    const { animation = 'shimmer', speed = 'normal' } = config

    const classes = ['skeleton']

    if (animation) {
      classes.push(`skeleton-${animation}`)
    }

    if (speed !== 'normal') {
      classes.push(`skeleton-${speed}`)
    }

    return classes.join(' ')
  }
}

/**
 * 延迟加载管理器
 */
export class LazyLoadManager {
  private static instance: LazyLoadManager
  private observers: Map<string, IntersectionObserver> = new Map()
  private callbacks: Map<string, () => void> = new Map()

  private constructor() {}

  static getInstance(): LazyLoadManager {
    if (!LazyLoadManager.instance) {
      LazyLoadManager.instance = new LazyLoadManager()
    }
    return LazyLoadManager.instance
  }

  /**
   * 观察元素
   */
  observe(
    element: Element,
    callback: () => void,
    options: IntersectionObserverInit = {}
  ): string {
    const id = Math.random().toString(36).substr(2, 9)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback()
            this.unobserve(id)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(element)
    this.observers.set(id, observer)
    this.callbacks.set(id, callback)

    return id
  }

  /**
   * 取消观察
   */
  unobserve(id: string): void {
    const observer = this.observers.get(id)
    if (observer) {
      observer.disconnect()
      this.observers.delete(id)
      this.callbacks.delete(id)
    }
  }

  /**
   * 清理所有观察者
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.callbacks.clear()
  }
}

// 导出单例实例
export const lazyLoadManager = LazyLoadManager.getInstance()