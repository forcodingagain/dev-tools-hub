import React, { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "@remix-run/react"

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DropdownMenu({ trigger, children, className = "" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const isActivePath = (path: string) => location.pathname === path

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // 选择菜单项时关闭下拉菜单
  const handleMenuItemClick = () => {
    setIsOpen(false)
  }

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {trigger}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 下拉内容 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg z-50 py-1 min-w-[200px]"
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  as?: React.ElementType
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function DropdownMenuItem({
  as: Component = "a",
  href,
  onClick,
  icon,
  children,
  className = "",
  disabled = false
}: DropdownMenuItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick?.()
    }
  }

  const commonClasses = `
    flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150
    focus:outline-none focus:bg-gray-100
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim()

  const content = (
    <>
      {icon && <span className="w-4 h-4 mr-3 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </>
  )

  if (as === Link && href) {
    return (
      <Link
        to={href}
        onClick={handleClick}
        className={commonClasses}
      >
        {content}
      </Link>
    )
  }

  return (
    <Component
      onClick={handleClick}
      className={commonClasses}
      href={as === "a" ? href : undefined}
    >
      {content}
    </Component>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className = "" }: DropdownMenuSeparatorProps) {
  return (
    <div
      className={`my-1 h-px bg-gray-200 ${className}`}
      role="separator"
    />
  )
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

export function DropdownMenuLabel({ children, className = "" }: DropdownMenuLabelProps) {
  return (
    <div
      className={`px-4 py-2 text-sm font-medium text-gray-500 ${className}`}
    >
      {children}
    </div>
  )
}