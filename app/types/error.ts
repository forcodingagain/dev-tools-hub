/**
 * 错误处理类型定义
 */

export interface AppError {
  /** 错误ID */
  id: string
  /** 错误类型 */
  type: ErrorType
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 用户友好的错误消息 */
  userMessage: string
  /** 错误详情 */
  details?: Record<string, any>
  /** 错误堆栈 */
  stack?: string
  /** 时间戳 */
  timestamp: number
  /** 用户会话ID */
  sessionId: string
  /** 页面URL */
  pageUrl: string
  /** 用户代理 */
  userAgent: string
  /** 严重程度 */
  severity: ErrorSeverity
  /** 是否可恢复 */
  recoverable: boolean
  /** 错误来源 */
  source: ErrorSource
  /** 上下文信息 */
  context?: Record<string, any>
}

export type ErrorType =
  | 'network'
  | 'validation'
  | 'parse'
  | 'render'
  | 'runtime'
  | 'memory'
  | 'permission'
  | 'timeout'
  | 'offline'
  | 'browser_compatibility'
  | 'unknown'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export type ErrorSource = 'user_action' | 'system' | 'third_party' | 'browser' | 'network'

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
  attemptedRecovery?: boolean
}

export interface ErrorReport {
  /** 报告ID */
  id: string
  /** 错误列表 */
  errors: AppError[]
  /** 会话信息 */
  sessionInfo: {
    sessionId: string
    startTime: number
    duration: number
    pageViews: number
    userAgent: string
    browserInfo: BrowserInfo
  }
  /** 系统信息 */
  systemInfo: {
    platform: string
    language: string
    cookieEnabled: boolean
    onLine: boolean
    screenResolution: string
    viewportSize: string
    memory?: MemoryInfo
  }
  /** 报告时间 */
  timestamp: number
}

export interface BrowserInfo {
  name: string
  version: string
  os: string
  mobile: boolean
}

export interface ErrorRecoveryStrategy {
  /** 策略名称 */
  name: string
  /** 策略描述 */
  description: string
  /** 执行恢复的函数 */
  execute: () => Promise<boolean>
  /** 重试次数限制 */
  maxRetries: number
  /** 当前重试次数 */
  currentRetries: number
  /** 是否启用 */
  enabled: boolean
}

export interface ErrorHandlingConfig {
  /** 是否启用错误监控 */
  enabled: boolean
  /** 错误上报端点 */
  reportEndpoint?: string
  /** 最大错误缓存数量 */
  maxErrors: number
  /** 自动上报间隔 */
  reportInterval: number
  /** 采样率 */
  sampleRate: number
  /** 开发模式下显示错误详情 */
  showDetailsInDev: boolean
  /** 启用自动恢复策略 */
  enableAutoRecovery: boolean
  /** 用户反馈收集 */
  enableUserFeedback: boolean
}

export interface UserFeedback {
  /** 反馈ID */
  id: string
  /** 关联的错误ID */
  errorId: string
  /** 用户评论 */
  comment: string
  /** 用户邮箱 */
  email?: string
  /** 反馈时间 */
  timestamp: number
  /** 用户代理 */
  userAgent: string
}

export interface FallbackComponent {
  /** 组件名称 */
  name: string
  /** 渲染函数 */
  render: (error: AppError, retry: () => void) => React.ReactNode
  /** 是否显示重试按钮 */
  showRetry: boolean
  /** 重试处理函数 */
  onRetry?: () => Promise<void>
}

export interface ErrorContext {
  /** 当前错误 */
  error?: AppError
  /** 错误历史 */
  errors: AppError[]
  /** 是否正在恢复 */
  isRecovering: boolean
  /** 用户反馈 */
  feedback?: UserFeedback
  /** 恢复策略 */
  recoveryStrategies: ErrorRecoveryStrategy[]
}