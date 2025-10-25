import React, { useEffect, useRef } from 'react'

interface LiveRegionProps {
  /** 通知类型 */
  politeness?: 'off' | 'polite' | 'assertive'
  /** 是否原子化 */
  atomic?: boolean
  /** 是否显示内容（视觉上） */
  visible?: boolean
  /** 通知内容 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * 屏幕阅读器通知区域组件
 * 用于向屏幕阅读器用户发送状态变化通知
 */
export function LiveRegion({
  politeness = 'polite',
  atomic = false,
  visible = false,
  children,
  className
}: LiveRegionProps) {
  const announcementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (announcementRef.current) {
      // 内容变化时通知屏幕阅读器
      const content = announcementRef.current.textContent || ''
      if (content) {
        // 触发屏幕阅读器读取
        announcementRef.current.setAttribute('aria-live', politeness)
        announcementRef.current.setAttribute('aria-atomic', String(atomic))
      }
    }
  }, [children, politeness, atomic])

  return (
    <div
      ref={announcementRef}
      aria-live={politeness}
      aria-atomic={atomic}
      className={`
        ${visible ? '' : 'sr-only'}
        ${className || ''}
      `}
      role="status"
    >
      {children}
    </div>
  )
}

/**
 * 状态通知组件
 */
export function StatusAnnouncement({
  message,
  visible = false
}: {
  message: string
  visible?: boolean
}) {
  return (
    <LiveRegion politeness="polite" visible={visible}>
      {message}
    </LiveRegion>
  )
}

/**
 * 错误通知组件
 */
export function ErrorAnnouncement({
  message,
  visible = false
}: {
  message: string
  visible?: boolean
}) {
  return (
    <LiveRegion politeness="assertive" visible={visible}>
      错误: {message}
    </LiveRegion>
  )
}

/**
 * 成功通知组件
 */
export function SuccessAnnouncement({
  message,
  visible = false
}: {
  message: string
  visible?: boolean
}) {
  return (
    <LiveRegion politeness="polite" visible={visible}>
      成功: {message}
    </LiveRegion>
  )
}