/**
 * 全局加载屏幕组件
 * 提供统一的加载状态显示界面
 */

import React, { useEffect } from 'react'
import { useLoading } from '~/hooks/useLoading'

interface LoadingScreenProps {
  /** 是否启用 */
  enabled?: boolean
  /** 最小显示时间（毫秒） */
  minDisplayTime?: number
  /** 自定义加载文本 */
  loadingText?: string
  /** 是否显示进度条 */
  showProgress?: boolean
  /** 是否显示背景遮罩 */
  showBackdrop?: boolean
  /** 自定义样式类名 */
  className?: string
}

/**
 * 全局加载屏幕
 */
export function LoadingScreen({
  enabled = true,
  minDisplayTime = 500,
  loadingText,
  showProgress = true,
  showBackdrop = true,
  className = ''
}: LoadingScreenProps) {
  const { isLoading, status, progress, loadingText: stateLoadingText } = useLoading()
  const [shouldShow, setShouldShow] = React.useState(false)
  const [showProgressBar, setShowProgressBar] = React.useState(false)
  const startTimeRef = React.useRef<number | null>(null)

  // 控制显示逻辑
  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now()
      // 立即显示加载屏幕
      setShouldShow(true)
      setShowProgressBar(false)

      // 延迟显示进度条
      const progressTimer = setTimeout(() => {
        setShowProgressBar(true)
      }, 200)

      return () => clearTimeout(progressTimer)
    } else {
      // 加载完成，确保至少显示最小时间
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current
        const remainingTime = Math.max(0, minDisplayTime - elapsed)

        if (remainingTime > 0) {
          const timer = setTimeout(() => {
            setShouldShow(false)
            setShowProgressBar(false)
          }, remainingTime)

          return () => clearTimeout(timer)
        }
      }

      setShouldShow(false)
      setShowProgressBar(false)
    }
  }, [isLoading, minDisplayTime])

  if (!enabled || !shouldShow) {
    return null
  }

  const displayText = loadingText || stateLoadingText || '加载中...'
  const isLoadingState = status === 'loading'
  const isSuccessState = status === 'success'
  const isErrorState = status === 'error'

  return (
    <>
      {/* 背景遮罩 */}
      {showBackdrop && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40" />
      )}

      {/* 加载内容 */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={displayText}
      >
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
          {/* 状态图标 */}
          <div className="flex justify-center mb-4">
            {isLoadingState && (
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-l-blue-400 rounded-full animate-spin animation-delay-150" />
              </div>
            )}

            {isSuccessState && (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {isErrorState && (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* 加载文本 */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {displayText}
            </h3>

            {isLoadingState && (
              <p className="text-sm text-gray-500">
                请稍候，正在处理您的请求...
              </p>
            )}

            {isSuccessState && (
              <p className="text-sm text-green-600">
                操作已成功完成
              </p>
            )}

            {isErrorState && (
              <p className="text-sm text-red-600">
                操作失败，请重试
              </p>
            )}
          </div>

          {/* 进度条 */}
          {showProgressBar && isLoadingState && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>进度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="h-full bg-white bg-opacity-30 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* 取消按钮 */}
          {isLoadingState && minDisplayTime === 0 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  // 这里可以添加取消逻辑
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                取消操作
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </>
  )
}

/**
 * 内联加载指示器
 */
interface InlineLoadingProps {
  /** 加载状态 */
  loading: boolean
  /** 文本 */
  text?: string
  /** 大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 颜色 */
  color?: 'primary' | 'secondary' | 'success' | 'error'
  /** 样式类名 */
  className?: string
}

export function InlineLoading({
  loading,
  text,
  size = 'md',
  color = 'primary',
  className = ''
}: InlineLoadingProps) {
  if (!loading) return null

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'border-blue-200 border-t-blue-600',
    secondary: 'border-gray-200 border-t-gray-600',
    success: 'border-green-200 border-t-green-600',
    error: 'border-red-200 border-t-red-600'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`border-2 ${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`} />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
}

/**
 * 迷你加载指示器
 */
interface MiniLoadingProps {
  /** 加载状态 */
  loading: boolean
  /** 颜色 */
  color?: string
  /** 样式类名 */
  className?: string
}

export function MiniLoading({
  loading,
  color = '#3b82f6',
  className = ''
}: MiniLoadingProps) {
  if (!loading) return null

  return (
    <div className={`inline-block ${className}`}>
      <div
        className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
        style={{ color }}
      />
    </div>
  )
}

/**
 * 进度条组件
 */
interface ProgressBarProps {
  /** 进度值 */
  progress: number
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 是否显示状态文本 */
  showStatusText?: boolean
  /** 状态文本 */
  statusText?: string
  /** 颜色 */
  color?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 高度 */
  height?: number
  /** 是否动画 */
  animated?: boolean
  /** 样式类名 */
  className?: string
}

export function ProgressBar({
  progress,
  showPercentage = true,
  showStatusText = false,
  statusText,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  height = 8,
  animated = true,
  className = ''
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className={`w-full ${className}`}>
      {(showPercentage || showStatusText) && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{statusText || ''}</span>
          {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
        </div>
      )}

      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          backgroundColor,
          height: `${height}px`
        }}
      >
        <div
          className="h-full transition-all duration-300 ease-out relative"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color
          }}
        >
          {animated && (
            <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}