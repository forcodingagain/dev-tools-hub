/**
 * 骨架屏组件
 * 提供各种类型的骨架屏组件，用于在内容加载时显示占位符
 */

import React from 'react'
import { useSkeleton } from '~/hooks/useLoading'
import { SkeletonBlock, SkeletonConfig } from '~/types/loading'

interface SkeletonProps {
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 圆角 */
  borderRadius?: string
  /** 是否显示 */
  show?: boolean
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 基础骨架屏组件
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '0.375rem',
  show = true,
  config,
  className = '',
  style
}: SkeletonProps) {
  const { getSkeletonStyle } = useSkeleton(config)

  if (!show) return null

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        ...getSkeletonStyle(),
        ...style
      }}
      aria-hidden="true"
    />
  )
}

/**
 * 文本骨架屏
 */
interface TextSkeletonProps {
  /** 行数 */
  lines?: number
  /** 每行高度 */
  lineHeight?: string | number
  /** 最后一行宽度比例 */
  lastLineWidth?: number
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function TextSkeleton({
  lines = 3,
  lineHeight = '1rem',
  lastLineWidth = 0.7,
  config,
  className = ''
}: TextSkeletonProps) {
  const { getSkeletonStyle } = useSkeleton(config)

  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? `${lastLineWidth * 100}%` : '100%'}
          config={config}
        />
      ))}
    </div>
  )
}

/**
 * 标题骨架屏
 */
interface TitleSkeletonProps {
  /** 级别 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** 宽度 */
  width?: string | number
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function TitleSkeleton({
  level = 1,
  width = '60%',
  config,
  className = ''
}: TitleSkeletonProps) {
  const sizeMap = {
    1: { height: '2.5rem', borderRadius: '0.5rem' },
    2: { height: '2rem', borderRadius: '0.5rem' },
    3: { height: '1.75rem', borderRadius: '0.375rem' },
    4: { height: '1.5rem', borderRadius: '0.375rem' },
    5: { height: '1.25rem', borderRadius: '0.25rem' },
    6: { height: '1.125rem', borderRadius: '0.25rem' }
  }

  const { height, borderRadius } = sizeMap[level]

  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      config={config}
      className={`font-bold ${className}`}
    />
  )
}

/**
 * 头像骨架屏
 */
interface AvatarSkeletonProps {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  /** 形状 */
  shape?: 'circle' | 'square'
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function AvatarSkeleton({
  size = 'md',
  shape = 'circle',
  config,
  className = ''
}: AvatarSkeletonProps) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  }

  const actualSize = typeof size === 'number' ? size : sizeMap[size]
  const borderRadius = shape === 'circle' ? '50%' : '0.5rem'

  return (
    <Skeleton
      width={actualSize}
      height={actualSize}
      borderRadius={borderRadius}
      config={config}
      className={className}
    />
  )
}

/**
 * 按钮骨架屏
 */
interface ButtonSkeletonProps {
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 变体 */
  variant?: 'default' | 'outline' | 'ghost'
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function ButtonSkeleton({
  width = '120px',
  height = '2.5rem',
  variant = 'default',
  config,
  className = ''
}: ButtonSkeletonProps) {
  const borderRadiusMap = {
    default: '0.5rem',
    outline: '0.5rem',
    ghost: '0.375rem'
  }

  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadiusMap[variant]}
      config={config}
      className={`inline-block ${className}`}
    />
  )
}

/**
 * 卡片骨架屏
 */
interface CardSkeletonProps {
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 头像尺寸 */
  avatarSize?: 'sm' | 'md' | 'lg'
  /** 标题行数 */
  titleLines?: number
  /** 描述行数 */
  descriptionLines?: number
  /** 是否显示底部 */
  showFooter?: boolean
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function CardSkeleton({
  showAvatar = true,
  avatarSize = 'md',
  titleLines = 1,
  descriptionLines = 3,
  showFooter = true,
  config,
  className = ''
}: CardSkeletonProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 space-y-4 ${className}`} aria-hidden="true">
      {/* 头部 */}
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <AvatarSkeleton size={avatarSize} config={config} />
          <div className="flex-1">
            <Skeleton width="60%" height="1rem" config={config} />
            <Skeleton width="40%" height="0.875rem" config={config} className="mt-2" />
          </div>
        </div>
      )}

      {/* 标题 */}
      {titleLines > 0 && (
        <div className="space-y-2">
          {Array.from({ length: titleLines }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === 0 ? '70%' : '50%'}
              height="1.25rem"
              config={config}
            />
          ))}
        </div>
      )}

      {/* 描述 */}
      {descriptionLines > 0 && (
        <TextSkeleton lines={descriptionLines} config={config} />
      )}

      {/* 底部 */}
      {showFooter && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Skeleton width="80px" height="1rem" config={config} />
          <Skeleton width="100px" height="2rem" borderRadius="0.5rem" config={config} />
        </div>
      )}
    </div>
  )
}

/**
 * 表格骨架屏
 */
interface TableSkeletonProps {
  /** 行数 */
  rows?: number
  /** 列数 */
  columns?: number
  /** 是否显示表头 */
  showHeader?: boolean
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  config,
  className = ''
}: TableSkeletonProps) {
  return (
    <div className={`w-full ${className}`} aria-hidden="true">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* 表头 */}
        {showHeader && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={`header-${index}`} height="1rem" config={config} />
              ))}
            </div>
          </div>
        )}

        {/* 表格内容 */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="p-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton
                    key={`cell-${rowIndex}-${colIndex}`}
                    height="0.875rem"
                    width={colIndex === columns - 1 ? '60%' : '100%'}
                    config={config}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 列表骨架屏
 */
interface ListSkeletonProps {
  /** 项目数量 */
  items?: number
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 每个项目文本行数 */
  textLines?: number
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function ListSkeleton({
  items = 3,
  showAvatar = true,
  textLines = 2,
  config,
  className = ''
}: ListSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`} aria-hidden="true">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          {showAvatar && (
            <AvatarSkeleton size="md" config={config} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height="1rem" config={config} />
            {textLines > 1 && (
              <Skeleton width="90%" height="0.875rem" config={config} />
            )}
            {textLines > 2 && (
              <Skeleton width="60%" height="0.875rem" config={config} />
            )}
          </div>
          <Skeleton width="80px" height="2rem" borderRadius="0.5rem" config={config} />
        </div>
      ))}
    </div>
  )
}

/**
 * 自定义骨架屏块
 */
interface CustomSkeletonProps {
  /** 骨架屏块配置 */
  blocks: SkeletonBlock[]
  /** 配置 */
  config?: SkeletonConfig
  /** 样式类名 */
  className?: string
}

export function CustomSkeleton({
  blocks,
  config,
  className = ''
}: CustomSkeletonProps) {
  const renderBlock = (block: SkeletonBlock, key: string) => {
    const { type, width, height, borderRadius, style, children } = block

    const baseProps = {
      key,
      width,
      height,
      borderRadius,
      config,
      style
    }

    switch (type) {
      case 'text':
        return <Skeleton {...baseProps} />
      case 'avatar':
        return <Skeleton {...baseProps} borderRadius="50%" />
      case 'button':
        return <Skeleton {...baseProps} borderRadius="0.5rem" />
      case 'image':
        return <Skeleton {...baseProps} />
      case 'card':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {children?.map((child, index) => renderBlock(child, `${key}-child-${index}`))}
          </div>
        )
      case 'custom':
        return <Skeleton {...baseProps} />
      default:
        return null
    }
  }

  return (
    <div className={className} aria-hidden="true">
      {blocks.map((block, index) => renderBlock(block, `block-${index}`))}
    </div>
  )
}

/**
 * 骨架屏容器
 * 在内容加载时显示骨架屏，加载完成后显示实际内容
 */
interface SkeletonContainerProps {
  /** 是否正在加载 */
  loading: boolean
  /** 骨架屏配置 */
  skeletonConfig?: SkeletonConfig
  /** 骨架屏类型 */
  type?: 'text' | 'card' | 'list' | 'table' | 'custom'
  /** 自定义骨架屏 */
  customSkeleton?: React.ReactNode
  /** 骨架屏属性 */
  skeletonProps?: any
  /** 子元素 */
  children: React.ReactNode
  /** 样式类名 */
  className?: string
}

export function SkeletonContainer({
  loading,
  skeletonConfig,
  type = 'text',
  customSkeleton,
  skeletonProps = {},
  children,
  className = ''
}: SkeletonContainerProps) {
  if (loading) {
    if (customSkeleton) {
      return <div className={className}>{customSkeleton}</div>
    }

    const skeletonComponents = {
      text: <TextSkeleton config={skeletonConfig} {...skeletonProps} />,
      card: <CardSkeleton config={skeletonConfig} {...skeletonProps} />,
      list: <ListSkeleton config={skeletonConfig} {...skeletonProps} />,
      table: <TableSkeleton config={skeletonConfig} {...skeletonProps} />,
      custom: <CustomSkeleton blocks={[]} config={skeletonConfig} {...skeletonProps} />
    }

    return <div className={className}>{skeletonComponents[type]}</div>
  }

  return <div className={className}>{children}</div>
}