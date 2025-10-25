import type {
  PerformanceMetrics,
  OperationMetric,
  PerformanceReport,
  PerformanceScore,
  PerformanceRecommendation,
  PerformanceThresholds,
  PerformanceConfig,
  PerformanceMetrics as PerformanceMetricsType
} from '~/types/performance'

/**
 * 性能监控工具类
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private config: PerformanceConfig
  private operations: OperationMetric[] = []
  private sessionStartTime: number
  private sessionId: string

  private constructor() {
    this.sessionStartTime = Date.now()
    this.sessionId = this.generateSessionId()
    this.config = this.getDefaultConfig()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): PerformanceConfig {
    return {
      enabled: true,
      sampleRate: 1.0,
      maxOperations: 100,
      reportInterval: 30000, // 30秒
      thresholds: {
        pageLoadTime: 2000,
        firstByteTime: 800,
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 100,
        cumulativeLayoutShift: 0.1,
        jsonFormatTime: 1000,
        mermaidRenderTime: 3000,
        markdownConvertTime: 2000
      },
      enableReporting: false
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 开始操作计时
   */
  startOperation(name: string, type: OperationMetric['type'], metadata?: Record<string, any>): () => OperationMetric {
    if (!this.config.enabled) {
      return () => ({ name, type, startTime: 0, endTime: 0, duration: 0, success: false })
    }

    const startTime = performance.now()
    const operation: Partial<OperationMetric> = {
      name,
      type,
      startTime,
      metadata
    }

    return (): OperationMetric => {
      const endTime = performance.now()
      const duration = endTime - startTime

      const finalOperation: OperationMetric = {
        ...operation,
        startTime,
        endTime,
        duration,
        success: true
      } as OperationMetric

      this.addOperation(finalOperation)
      return finalOperation
    }
  }

  /**
   * 记录操作失败
   */
  recordFailure(name: string, type: OperationMetric['type'], error: string, duration?: number): void {
    if (!this.config.enabled) return

    const operation: OperationMetric = {
      name,
      type,
      startTime: 0,
      endTime: duration || 0,
      duration: duration || 0,
      success: false,
      error
    }

    this.addOperation(operation)
  }

  /**
   * 添加操作记录
   */
  private addOperation(operation: OperationMetric): void {
    this.operations.push(operation)

    // 限制缓存数量
    if (this.operations.length > this.config.maxOperations) {
      this.operations = this.operations.slice(-this.config.maxOperations)
    }

    // 采样记录
    if (Math.random() > this.config.sampleRate) {
      return
    }

    // 检查性能阈值并给出警告
    this.checkThresholds(operation)
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(operation: OperationMetric): void {
    const thresholds = this.config.thresholds

    switch (operation.type) {
      case 'json_format':
        if (operation.duration > thresholds.jsonFormatTime) {
          console.warn(`JSON格式化性能警告: ${operation.duration.toFixed(2)}ms (阈值: ${thresholds.jsonFormatTime}ms)`)
        }
        break
      case 'mermaid_render':
        if (operation.duration > thresholds.mermaidRenderTime) {
          console.warn(`Mermaid渲染性能警告: ${operation.duration.toFixed(2)}ms (阈值: ${thresholds.mermaidRenderTime}ms)`)
        }
        break
      case 'markdown_convert':
        if (operation.duration > thresholds.markdownConvertTime) {
          console.warn(`Markdown转换性能警告: ${operation.duration.toFixed(2)}ms (阈值: ${thresholds.markdownConvertTime}ms)`)
        }
        break
    }
  }

  /**
   * 获取当前性能指标
   */
  async getCurrentMetrics(): Promise<PerformanceMetricsType> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    const paint = performance.getEntriesByType('paint')
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0

    const lcp = await this.getLargestContentfulPaint()
    const fid = await this.getFirstInputDelay()
    const cls = await this.getCumulativeLayoutShift()

    const pageLoadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0
    const firstByteTime = navigation ? navigation.responseStart - navigation.navigationStart : 0

    return {
      pageLoadTime,
      firstByteTime,
      firstContentfulPaint: fcp,
      largestContentfulPaint: lcp,
      firstInputDelay: fid,
      cumulativeLayoutShift: cls,
      memoryUsage: this.getMemoryUsage(),
      operationMetrics: this.getOperationMetrics()
    }
  }

  /**
   * 获取最大内容绘制时间
   */
  private async getLargestContentfulPaint(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        })

        observer.observe({ entryTypes: ['largest-contentful-paint'] })

        // 超时处理
        setTimeout(() => {
          observer.disconnect()
          resolve(0)
        }, 5000)
      } else {
        resolve(0)
      }
    })
  }

  /**
   * 获取首次输入延迟
   */
  private async getFirstInputDelay(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const firstEntry = entries[0]
          resolve(firstEntry.processingStart - firstEntry.startTime)
        })

        observer.observe({ entryTypes: ['first-input'] })

        // 超时处理
        setTimeout(() => {
          observer.disconnect()
          resolve(0)
        }, 10000)
      } else {
        resolve(0)
      }
    })
  }

  /**
   * 获取累计布局偏移
   */
  private async getCumulativeLayoutShift(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
        })

        observer.observe({ entryTypes: ['layout-shift'] })

        // 延迟返回以收集更多CLS值
        setTimeout(() => {
          observer.disconnect()
          resolve(clsValue)
        }, 10000)
      } else {
        resolve(0)
      }
    })
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): MemoryInfo | undefined {
    return 'memory' in performance ? (performance as any).memory : undefined
  }

  /**
   * 获取操作指标
   */
  private getOperationMetrics(): Record<string, OperationMetric> {
    const metrics: Record<string, OperationMetric> = {}

    // 按操作类型分组，获取最新的操作
    const latestOperations: Record<string, OperationMetric> = {}

    for (const operation of this.operations) {
      if (!latestOperations[operation.type] || operation.endTime > latestOperations[operation.type].endTime) {
        latestOperations[operation.type] = operation
      }
    }

    return latestOperations
  }

  /**
   * 生成性能报告
   */
  async generateReport(): Promise<PerformanceReport> {
    const metrics = await this.getCurrentMetrics()
    const score = this.calculateScore(metrics)
    const recommendations = this.generateRecommendations(metrics, score)

    return {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      metrics,
      operations: [...this.operations],
      score,
      recommendations
    }
  }

  /**
   * 计算性能评分
   */
  private calculateScore(metrics: PerformanceMetricsType): PerformanceScore {
    const thresholds = this.config.thresholds

    const loadingScore = Math.max(0, Math.min(100,
      100 - (metrics.pageLoadTime / thresholds.pageLoadTime) * 100))

    const interactivityScore = Math.max(0, Math.min(100,
      100 - (metrics.firstInputDelay / thresholds.firstInputDelay) * 100))

    const runtimeScore = Math.max(0, Math.min(100,
      100 - (metrics.cumulativeLayoutShift / thresholds.cumulativeLayoutShift) * 100))

    const memoryScore = metrics.memoryUsage ?
      Math.max(0, Math.min(100, 100 - (metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100)) : 100

    const overall = (loadingScore + interactivityScore + runtimeScore + memoryScore) / 4

    return {
      overall: Math.round(overall),
      loading: Math.round(loadingScore),
      interactivity: Math.round(interactivityScore),
      runtime: Math.round(runtimeScore),
      memory: Math.round(memoryScore)
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(metrics: PerformanceMetricsType, score: PerformanceScore): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = []
    const thresholds = this.config.thresholds

    // 页面加载时间建议
    if (metrics.pageLoadTime > thresholds.pageLoadTime) {
      recommendations.push({
        type: 'critical',
        title: '页面加载时间过长',
        description: `当前页面加载时间为 ${metrics.pageLoadTime}ms，超过了建议的 ${thresholds.pageLoadTime}ms`,
        impactedMetrics: ['pageLoadTime', 'firstContentfulPaint'],
        suggestions: [
          '优化图片和资源加载',
          '使用代码分割减少初始包大小',
          '启用缓存策略'
        ]
      })
    }

    // CLS建议
    if (metrics.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
      recommendations.push({
        type: 'warning',
        title: '布局稳定性需要改善',
        description: `当前CLS值为 ${metrics.cumulativeLayoutShift.toFixed(3)}，超过了建议的 ${thresholds.cumulativeLayoutShift}`,
        impactedMetrics: ['cumulativeLayoutShift'],
        suggestions: [
          '为图片和视频设置明确的尺寸',
          '避免动态插入内容',
          '使用transform动画而不是改变布局属性'
        ]
      })
    }

    // 内存使用建议
    if (metrics.memoryUsage && metrics.memoryUsage.usedJSHeapSize > metrics.memoryUsage.jsHeapSizeLimit * 0.8) {
      recommendations.push({
        type: 'warning',
        title: '内存使用量较高',
        description: '当前内存使用量超过了建议的80%阈值',
        impactedMetrics: ['memoryUsage'],
        suggestions: [
          '清理不必要的事件监听器',
          '优化大型数据结构的存储',
          '使用对象池模式减少GC压力'
        ]
      })
    }

    return recommendations
  }

  /**
   * 清除操作历史
   */
  clearOperations(): void {
    this.operations = []
  }

  /**
   * 获取操作历史
   */
  getOperations(): OperationMetric[] {
    return [...this.operations]
  }

  /**
   * 上报性能数据
   */
  async reportMetrics(): Promise<void> {
    if (!this.config.enableReporting || !this.config.reportEndpoint) {
      return
    }

    try {
      const report = await this.generateReport()
      await fetch(this.config.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })
    } catch (error) {
      console.warn('性能数据上报失败:', error)
    }
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance()

/**
 * 性能监控装饰器
 */
export function measurePerformance(type: OperationMetric['type'], name?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const operationName = name || `${target.constructor.name}.${propertyName}`
      const endOperation = performanceMonitor.startOperation(operationName, type)

      try {
        const result = await method.apply(this, args)
        endOperation()
        return result
      } catch (error) {
        const operation = endOperation()
        performanceMonitor.recordFailure(operationName, type, (error as Error).message, operation.duration)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 异步函数性能监控工具
 */
export async function measureAsyncFunction<T>(
  fn: () => Promise<T>,
  name: string,
  type: OperationMetric['type']
): Promise<{ result: T; metric: OperationMetric }> {
  const endOperation = performanceMonitor.startOperation(name, type)

  try {
    const result = await fn()
    const metric = endOperation()
    return { result, metric }
  } catch (error) {
    const metric = endOperation()
    performanceMonitor.recordFailure(name, type, (error as Error).message, metric.duration)
    throw error
  }
}