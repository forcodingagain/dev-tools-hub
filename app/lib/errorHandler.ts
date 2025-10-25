import type {
  AppError,
  ErrorType,
  ErrorSeverity,
  ErrorSource,
  ErrorReport,
  ErrorRecoveryStrategy,
  ErrorHandlingConfig,
  UserFeedback,
  BrowserInfo
} from '~/types/error'

/**
 * 全局错误处理器
 */
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private config: ErrorHandlingConfig
  private errors: AppError[] = []
  private sessionId: string
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy[]> = new Map()
  private isRecovering: boolean = false

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.config = this.getDefaultConfig()
    this.setupGlobalErrorHandlers()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): ErrorHandlingConfig {
    return {
      enabled: true,
      maxErrors: 100,
      reportInterval: 30000,
      sampleRate: 1.0,
      showDetailsInDev: true,
      enableAutoRecovery: true,
      enableUserFeedback: false
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // 未捕获的JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'runtime',
        code: 'UNCAUGHT_JS_ERROR',
        message: event.message || '未知JavaScript错误',
        userMessage: '页面运行时发生了错误',
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        stack: event.error?.stack,
        severity: 'high',
        recoverable: false,
        source: 'system'
      })
    })

    // 未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'runtime',
        code: 'UNHANDLED_PROMISE_REJECTION',
        message: event.reason?.message || '未知Promise错误',
        userMessage: '异步操作执行失败',
        details: {
          reason: event.reason
        },
        stack: event.reason?.stack,
        severity: 'medium',
        recoverable: true,
        source: 'system'
      })
    })

    // 网络错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as HTMLElement).tagName === 'SCRIPT') {
        this.handleError({
          type: 'network',
          code: 'SCRIPT_LOAD_ERROR',
          message: `脚本加载失败: ${(event.target as HTMLScriptElement).src}`,
          userMessage: '页面资源加载失败，请刷新页面重试',
          severity: 'high',
          recoverable: true,
          source: 'network'
        })
      }
    }, true)

    // 页面卸载前上报错误
    window.addEventListener('beforeunload', () => {
      if (this.errors.length > 0) {
        this.reportErrors()
      }
    })
  }

  /**
   * 处理错误
   */
  handleError(errorData: Partial<AppError>): void {
    if (!this.config.enabled) return

    // 采样
    if (Math.random() > this.config.sampleRate) return

    const error: AppError = {
      id: this.generateErrorId(),
      type: errorData.type || 'unknown',
      code: errorData.code || 'UNKNOWN_ERROR',
      message: errorData.message || '未知错误',
      userMessage: errorData.userMessage || '操作失败，请稍后重试',
      details: errorData.details,
      stack: errorData.stack,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      severity: errorData.severity || 'medium',
      recoverable: errorData.recoverable ?? true,
      source: errorData.source || 'system',
      context: errorData.context
    }

    this.errors.push(error)

    // 限制错误数量
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(-this.config.maxErrors)
    }

    // 尝试自动恢复
    if (this.config.enableAutoRecovery && error.recoverable) {
      this.attemptRecovery(error)
    }

    // 控制台输出
    this.logError(error)

    // 触发错误事件
    this.dispatchErrorEvent(error)
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppError): void {
    const logMethod = error.severity === 'critical' ? 'error' :
                      error.severity === 'high' ? 'error' :
                      error.severity === 'medium' ? 'warn' : 'info'

    console[logMethod](`[${error.type.toUpperCase()}] ${error.userMessage}`, {
      errorId: error.id,
      code: error.code,
      details: error.details,
      stack: this.config.showDetailsInDev ? error.stack : undefined
    })
  }

  /**
   * 分发错误事件
   */
  private dispatchErrorEvent(error: AppError): void {
    const event = new CustomEvent('appError', {
      detail: error
    })
    window.dispatchEvent(event)
  }

  /**
   * 尝试恢复
   */
  private async attemptRecovery(error: AppError): Promise<void> {
    if (this.isRecovering) return

    this.isRecovering = true

    try {
      const strategies = this.getRecoveryStrategies(error.type)

      for (const strategy of strategies.filter(s => s.enabled)) {
        if (strategy.currentRetries < strategy.maxRetries) {
          console.log(`尝试恢复策略: ${strategy.name}`)

          const success = await strategy.execute()
          strategy.currentRetries++

          if (success) {
            console.log(`恢复成功: ${strategy.name}`)
            this.dispatchRecoveryEvent(error, strategy)
            break
          }
        }
      }
    } catch (recoveryError) {
      console.error('恢复过程中发生错误:', recoveryError)
    } finally {
      this.isRecovering = false
    }
  }

  /**
   * 获取恢复策略
   */
  private getRecoveryStrategies(errorType: ErrorType): ErrorRecoveryStrategy[] {
    const strategies = this.recoveryStrategies.get(errorType) || []

    // 默认恢复策略
    const defaultStrategies: ErrorRecoveryStrategy[] = [
      {
        name: 'reload_page',
        description: '重新加载页面',
        execute: async () => {
          window.location.reload()
          return true
        },
        maxRetries: 1,
        currentRetries: 0,
        enabled: errorType === 'runtime' || errorType === 'network'
      },
      {
        name: 'clear_cache',
        description: '清除缓存并重试',
        execute: async () => {
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map(name => caches.delete(name)))
          }
          return true
        },
        maxRetries: 1,
        currentRetries: 0,
        enabled: errorType === 'network' || errorType === 'parse'
      }
    ]

    return [...strategies, ...defaultStrategies]
  }

  /**
   * 分发恢复事件
   */
  private dispatchRecoveryEvent(error: AppError, strategy: ErrorRecoveryStrategy): void {
    const event = new CustomEvent('errorRecovery', {
      detail: { error, strategy }
    })
    window.dispatchEvent(event)
  }

  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(errorType: ErrorType, strategy: ErrorRecoveryStrategy): void {
    if (!this.recoveryStrategies.has(errorType)) {
      this.recoveryStrategies.set(errorType, [])
    }
    this.recoveryStrategies.get(errorType)!.push(strategy)
  }

  /**
   * 获取浏览器信息
   */
  private getBrowserInfo(): BrowserInfo {
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
    }

    // 检测操作系统
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS')) os = 'iOS'

    return {
      name,
      version,
      os,
      mobile: /Mobile|Android|iPhone|iPad/.test(ua)
    }
  }

  /**
   * 生成错误报告
   */
  async generateReport(): Promise<ErrorReport> {
    const browserInfo = this.getBrowserInfo()

    return {
      id: this.generateReportId(),
      errors: [...this.errors],
      sessionInfo: {
        sessionId: this.sessionId,
        startTime: this.errors.length > 0 ? this.errors[0].timestamp : Date.now(),
        duration: Date.now() - (this.errors.length > 0 ? this.errors[0].timestamp : Date.now()),
        pageViews: 1, // 简化实现
        userAgent: navigator.userAgent,
        browserInfo
      },
      systemInfo: {
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        memory: (performance as any).memory
      },
      timestamp: Date.now()
    }
  }

  /**
   * 生成报告ID
   */
  private generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 上报错误
   */
  async reportErrors(): Promise<void> {
    if (!this.config.enabled || !this.config.reportEndpoint || this.errors.length === 0) {
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

      // 上报成功后清空错误列表
      this.errors = []
    } catch (error) {
      console.warn('错误上报失败:', error)
    }
  }

  /**
   * 收集用户反馈
   */
  async collectUserFeedback(errorId: string, feedback: Omit<UserFeedback, 'id' | 'errorId' | 'timestamp' | 'userAgent'>): Promise<UserFeedback> {
    const userFeedback: UserFeedback = {
      id: this.generateFeedbackId(),
      errorId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...feedback
    }

    // TODO: 保存用户反馈到本地存储或发送到服务器
    console.log('用户反馈已收集:', userFeedback)

    return userFeedback
  }

  /**
   * 生成反馈ID
   */
  private generateFeedbackId(): string {
    return `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取错误列表
   */
  getErrors(): AppError[] {
    return [...this.errors]
  }

  /**
   * 清空错误列表
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * 获取配置
   */
  getConfig(): ErrorHandlingConfig {
    return { ...this.config }
  }

  /**
   * 检查是否正在恢复
   */
  isCurrentlyRecovering(): boolean {
    return this.isRecovering
  }
}

// 导出单例实例
export const globalErrorHandler = GlobalErrorHandler.getInstance()

/**
 * 错误处理工具函数
 */
export function createAppError(
  type: ErrorType,
  code: string,
  message: string,
  userMessage?: string,
  severity: ErrorSeverity = 'medium',
  recoverable: boolean = true,
  details?: Record<string, any>
): AppError {
  return {
    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    code,
    message,
    userMessage: userMessage || message,
    details,
    severity,
    recoverable,
    source: 'user_action',
    timestamp: Date.now(),
    sessionId: globalErrorHandler.getConfig().enabled ?
      (globalErrorHandler as any).sessionId : 'unknown',
    pageUrl: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  }
}

/**
 * 网络错误处理
 */
export function handleNetworkError(error: any): AppError {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createAppError(
      'network',
      'NETWORK_ERROR',
      '网络请求失败',
      '网络连接失败，请检查网络设置',
      'high',
      true,
      { originalError: error.message }
    )
  }

  return createAppError(
    'network',
    'UNKNOWN_NETWORK_ERROR',
    '未知网络错误',
    '网络操作失败，请稍后重试',
    'medium',
    true,
    { originalError: error }
  )
}

/**
 * 验证错误处理
 */
export function handleValidationError(field: string, value: any, rule: string): AppError {
  return createAppError(
    'validation',
    'VALIDATION_ERROR',
    `验证失败: ${field} 不符合 ${rule} 规则`,
    `输入的 ${field} 格式不正确`,
    'low',
    true,
    { field, value, rule }
  )
}

/**
 * 解析错误处理
 */
export function handleParseError(content: string, format: string): AppError {
  return createAppError(
    'parse',
    'PARSE_ERROR',
    `${format} 解析失败`,
    `内容格式错误，请检查输入的 ${format} 格式`,
    'medium',
    true,
    { content: content.substring(0, 100), format }
  )
}