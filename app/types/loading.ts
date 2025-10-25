/**
 * 加载状态相关类型定义
 */

// 加载状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 加载配置接口
export interface LoadingConfig {
  /** 最小显示时间（毫秒） */
  minDisplayTime?: number
  /** 最大显示时间（毫秒） */
  maxDisplayTime?: number
  /** 是否显示骨架屏 */
  showSkeleton?: boolean
  /** 自定义加载文本 */
  loadingText?: string
  /** 自定义错误文本 */
  errorText?: string
  /** 是否可取消 */
  cancelable?: boolean
  /** 取消回调 */
  onCancel?: () => void
}

// 骨架屏配置接口
export interface SkeletonConfig {
  /** 动画类型 */
  animation?: 'pulse' | 'wave' | 'shimmer' | 'fade'
  /** 骨架屏颜色 */
  color?: string
  /** 高亮颜色 */
  highlightColor?: string
  /** 动画速度 */
  speed?: 'slow' | 'normal' | 'fast'
  /** 圆角大小 */
  borderRadius?: string
  /** 重复次数 */
  repeat?: number
}

// 骨架屏块类型
export interface SkeletonBlock {
  /** 块类型 */
  type: 'text' | 'avatar' | 'button' | 'image' | 'card' | 'custom'
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 圆角 */
  borderRadius?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 子骨架屏块 */
  children?: SkeletonBlock[]
}

// 进度条配置接口
export interface ProgressConfig {
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 是否显示状态文本 */
  showStatusText?: boolean
  /** 颜色 */
  color?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 高度 */
  height?: number
  /** 动画 */
  animated?: boolean
}

// 加载上下文接口
export interface LoadingContext {
  /** 全局加载状态 */
  isLoading: boolean
  /** 加载进度 */
  progress: number
  /** 加载状态 */
  status: LoadingState
  /** 加载文本 */
  loadingText: string
  /** 设置加载状态 */
  setLoading: (loading: boolean, text?: string) => void
  /** 设置进度 */
  setProgress: (progress: number, text?: string) => void
  /** 设置状态 */
  setStatus: (status: LoadingState, text?: string) => void
  /** 显示加载 */
  showLoading: (config?: LoadingConfig) => void
  /** 隐藏加载 */
  hideLoading: () => void
}

// 延迟加载配置接口
export interface LazyLoadConfig {
  /** 根边距 */
  rootMargin?: string
  /** 阈值 */
  threshold?: number
  /** 延迟时间（毫秒） */
  delay?: number
  /** 占位符 */
  placeholder?: React.ReactNode
  /** 错误占位符 */
  errorPlaceholder?: React.ReactNode
  /** 重试次数 */
  retryCount?: number
}

// 智能预加载配置接口
export interface SmartPreloadConfig {
  /** 基于用户行为的预加载 */
  basedOnUserBehavior?: boolean
  /** 空闲时间预加载 */
  preloadOnIdle?: boolean
  /** 鼠标悬停预加载 */
  preloadOnHover?: boolean
  /** 可见性预加载 */
  preloadOnVisible?: boolean
  /** 预加载延迟时间（毫秒） */
  preloadDelay?: number
  /** 最大预加载数量 */
  maxPreloads?: number
}

// 加载性能指标接口
export interface LoadingMetrics {
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 持续时间 */
  duration?: number
  /** 加载类型 */
  type: string
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
}

// 智能加载管理器接口
export interface SmartLoadingManager {
  /** 开始监控 */
  startMonitoring: (name: string) => void
  /** 结束监控 */
  endMonitoring: (name: string, success?: boolean, error?: string) => void
  /** 获取指标 */
  getMetrics: (name?: string) => LoadingMetrics[]
  /** 获取平均加载时间 */
  getAverageLoadTime: (type?: string) => number
  /** 预测加载时间 */
  predictLoadTime: (type: string) => number
}