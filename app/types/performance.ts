/**
 * 性能指标类型定义
 */

export interface PerformanceMetrics {
  /** 页面加载时间 */
  pageLoadTime: number
  /** 首字节时间 */
  firstByteTime: number
  /** 首次内容绘制时间 */
  firstContentfulPaint: number
  /** 最大内容绘制时间 */
  largestContentfulPaint: number
  /** 首次输入延迟 */
  firstInputDelay: number
  /** 累计布局偏移 */
  cumulativeLayoutShift: number
  /** 内存使用情况 */
  memoryUsage?: MemoryInfo
  /** 操作特定指标 */
  operationMetrics?: Record<string, OperationMetric>
}

export interface OperationMetric {
  /** 操作名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间 */
  duration: number
  /** 操作类型 */
  type: 'json_format' | 'mermaid_render' | 'markdown_convert' | 'navigation'
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 附加数据 */
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  /** 报告生成时间 */
  timestamp: number
  /** 会话ID */
  sessionId: string
  /** 页面URL */
  pageUrl: string
  /** 用户代理 */
  userAgent: string
  /** 基础性能指标 */
  metrics: PerformanceMetrics
  /** 操作历史 */
  operations: OperationMetric[]
  /** 性能评分 */
  score: PerformanceScore
  /** 建议优化项 */
  recommendations: PerformanceRecommendation[]
}

export interface PerformanceScore {
  /** 总体评分 (0-100) */
  overall: number
  /** 加载性能评分 */
  loading: number
  /** 交互性能评分 */
  interactivity: number
  /** 运行时性能评分 */
  runtime: number
  /** 内存使用评分 */
  memory: number
}

export interface PerformanceRecommendation {
  /** 建议类型 */
  type: 'critical' | 'warning' | 'info'
  /** 建议标题 */
  title: string
  /** 建议描述 */
  description: string
  /** 影响的指标 */
  impactedMetrics: string[]
  /** 建议的优化方案 */
  suggestions: string[]
}

export interface PerformanceThresholds {
  /** 页面加载时间阈值 (毫秒) */
  pageLoadTime: number
  /** 首字节时间阈值 (毫秒) */
  firstByteTime: number
  /** FCP阈值 (毫秒) */
  firstContentfulPaint: number
  /** LCP阈值 (毫秒) */
  largestContentfulPaint: number
  /** FID阈值 (毫秒) */
  firstInputDelay: number
  /** CLS阈值 */
  cumulativeLayoutShift: number
  /** JSON格式化时间阈值 (毫秒) */
  jsonFormatTime: number
  /** Mermaid渲染时间阈值 (毫秒) */
  mermaidRenderTime: number
  /** Markdown转换时间阈值 (毫秒) */
  markdownConvertTime: number
}

export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled: boolean
  /** 采样率 (0-1) */
  sampleRate: number
  /** 最大缓存的操作数量 */
  maxOperations: number
  /** 自动上报间隔 (毫秒) */
  reportInterval: number
  /** 性能阈值配置 */
  thresholds: PerformanceThresholds
  /** 是否上报到分析服务 */
  enableReporting: boolean
  /** 上报端点 */
  reportEndpoint?: string
}