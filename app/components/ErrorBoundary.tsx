import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { globalErrorHandler, createAppError } from '~/lib/errorHandler'
import type { AppError, ErrorBoundaryState } from '~/types/error'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error: AppError; retry: () => void }>
  onError?: (error: AppError, errorInfo: ErrorInfo) => void
  showRetry?: boolean
  customMessage?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.generateErrorId()

    const appError: AppError = {
      id: errorId,
      type: 'render',
      code: 'RENDER_ERROR',
      message: error.message,
      userMessage: this.props.customMessage || '页面渲染出现错误，请刷新页面重试',
      details: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        retryCount: this.retryCount
      },
      stack: error.stack,
      timestamp: Date.now(),
      sessionId: 'unknown', // 将在全局处理器中更新
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      severity: 'high',
      recoverable: true,
      source: 'system'
    }

    this.setState({
      error,
      errorInfo,
      errorId,
      attemptedRecovery: false
    })

    // 上报到全局错误处理器
    globalErrorHandler.handleError(appError)

    // 调用自定义错误处理
    this.props.onError?.(appError, errorInfo)
  }

  private generateErrorId(): string {
    return `boundary-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        attemptedRecovery: true
      })
    } else {
      // 超过最大重试次数，提供其他选项
      this.showAdvancedOptions()
    }
  }

  private showAdvancedOptions = () => {
    // 可以显示更多选项，如刷新页面、清除缓存等
    const confirmed = window.confirm(
      '多次重试失败。是否刷新页面？'
    )
    if (confirmed) {
      window.location.reload()
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportError = async () => {
    if (this.state.errorId) {
      const feedback = await globalErrorHandler.collectUserFeedback(
        this.state.errorId,
        {
          comment: prompt('请描述问题发生时的操作步骤：') || '',
          email: prompt('您的邮箱（可选）：') || undefined
        }
      )

      if (feedback.comment) {
        alert('感谢您的反馈，我们会尽快处理这个问题。')
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // 使用自定义fallback组件
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        const appError = this.createAppErrorFromState()
        return <FallbackComponent error={appError} retry={this.handleRetry} />
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <CardTitle className="text-red-800">页面出现错误</CardTitle>
              <CardDescription className="text-red-600">
                {this.state.error?.message || '未知错误'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <Alert>
                  <AlertTitle>开发模式错误详情</AlertTitle>
                  <AlertDescription>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-gray-600 space-y-2">
                <p>我们对此问题表示抱歉。请尝试以下操作：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>点击重试按钮重新加载组件</li>
                  <li>刷新页面重新开始</li>
                  <li>如果问题持续存在，请报告此错误</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-2">
                {(this.props.showRetry !== false) && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full"
                    disabled={this.retryCount >= this.maxRetries}
                  >
                    {this.retryCount >= this.maxRetries
                      ? '重试次数已用完'
                      : `重试 (${this.retryCount}/${this.maxRetries})`
                    }
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={this.handleReload}>
                    刷新页面
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome}>
                    返回首页
                  </Button>
                </div>

                <Button variant="outline" onClick={this.handleReportError}>
                  报告错误
                </Button>
              </div>

              {this.state.attemptedRecovery && (
                <Alert>
                  <AlertDescription>
                    系统正在尝试自动恢复...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }

  private createAppErrorFromState(): AppError {
    return {
      id: this.state.errorId || 'unknown',
      type: 'render',
      code: 'RENDER_ERROR',
      message: this.state.error?.message || '未知渲染错误',
      userMessage: this.props.customMessage || '页面渲染出现错误',
      details: {
        componentStack: this.state.errorInfo?.componentStack,
        errorBoundary: true,
        retryCount: this.retryCount
      },
      stack: this.state.error?.stack,
      timestamp: Date.now(),
      sessionId: 'unknown',
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      severity: 'high',
      recoverable: true,
      source: 'system'
    }
  }
}

/**
 * 简单的错误fallback组件
 */
interface SimpleErrorFallbackProps {
  error: AppError
  retry: () => void
}

export function SimpleErrorFallback({ error, retry }: SimpleErrorFallbackProps) {
  return (
    <div className="p-6 text-center">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">操作失败</h3>
      <p className="text-gray-600 mb-4">{error.userMessage}</p>
      <Button onClick={retry} className="mr-2">
        重试
      </Button>
    </div>
  )
}

/**
 * 网络错误边界组件
 */
export function NetworkErrorBoundary({ children }: { children: ReactNode }) {
  const fallback = ({ error, retry }: SimpleErrorFallbackProps) => (
    <div className="p-6 text-center">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
          <svg
            className="w-8 h-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">网络连接问题</h3>
      <p className="text-gray-600 mb-4">无法连接到服务器，请检查网络连接</p>
      <div className="space-x-2">
        <Button onClick={retry}>重试</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          刷新页面
        </Button>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback} customMessage="网络连接出现问题">
      {children}
    </ErrorBoundary>
  )
}

/**
 * Hook: 错误边界上下文
 */
import { createContext, useContext, useState, useCallback } from 'react'

interface ErrorContextType {
  errors: AppError[]
  addError: (error: AppError) => void
  clearErrors: () => void
  isRecovering: boolean
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([])
  const [isRecovering, setIsRecovering] = useState(false)

  const addError = useCallback((error: AppError) => {
    setErrors(prev => [...prev.slice(-9), error]) // 保留最近10个错误
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  return (
    <ErrorContext.Provider value={{ errors, addError, clearErrors, isRecovering }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError(): ErrorContextType {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}