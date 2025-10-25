import React from 'react'

interface SkipLinkProps {
  /** 跳转目标ID */
  targetId: string
  /** 链接文本 */
  children: string
  /** 自定义类名 */
  className?: string
}

/**
 * 跳过链接组件
 * 帮助键盘用户快速跳转到主要内容区域
 */
export function SkipLink({ targetId, children, className }: SkipLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView()
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-blue-600 text-white px-4 py-2 rounded-md z-50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-all duration-200
        ${className || ''}
      `}
    >
      {children}
    </a>
  )
}