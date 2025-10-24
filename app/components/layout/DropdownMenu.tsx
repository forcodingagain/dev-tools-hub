import { Link } from "@remix-run/react"
import { useLocation } from "@remix-run/react"
import { useRef, useEffect } from "react"
import { TOOLS } from "../../lib/constants"
import { useNavigationState, useNavigationActions } from "../../contexts/NavigationContext"
import { useToolNavigation } from "../../lib/navigation-utils"

interface DropdownMenuProps {
  className?: string
}

export function DropdownMenu({ className = "" }: DropdownMenuProps) {
  const location = useLocation()
  const { isDropdownOpen } = useNavigationState()
  const { navigateToTool } = useToolNavigation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActivePath = (path: string) => location.pathname === path

  // 键盘导航支持
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isDropdownOpen) return

    const items = Array.from(
      dropdownRef.current?.querySelectorAll('[role="menuitem"]') || []
    )
    const currentIndex = items.indexOf(
      document.activeElement as HTMLElement
    )

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % items.length
        items[nextIndex]?.focus()
        break
      case 'ArrowUp':
        event.preventDefault()
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        items[prevIndex]?.focus()
        break
      case 'Home':
        event.preventDefault()
        items[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        items[items.length - 1]?.focus()
        break
      case 'Escape':
        event.preventDefault()
        // 通知Header组件关闭下拉菜单
        const escapeEvent = new CustomEvent('closeDropdown')
        document.dispatchEvent(escapeEvent)
        break
    }
  }

  // 处理菜单项点击
  const handleToolClick = (toolPath: string) => {
    navigateToTool(toolPath)

    // 通知屏幕阅读器导航已完成
    const announcement = new CustomEvent('announceNavigation', {
      detail: { tool: getToolNameFromPath(toolPath) }
    })
    document.dispatchEvent(announcement)
  }

  // 从路径获取工具名称
  const getToolNameFromPath = (path: string): string => {
    const tool = TOOLS.find(t => t.path === path)
    return tool?.name || '工具'
  }

  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      // 下拉菜单打开时，聚焦到第一个菜单项
      const firstItem = dropdownRef.current.querySelector('[role="menuitem"]') as HTMLElement
      firstItem?.focus()
    }
  }, [isDropdownOpen])

  // 移除条件渲染，让组件始终存在但通过CSS控制显示

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[200px] ${
        className.includes('w-full') ? 'w-full' : 'min-w-[200px]'
      } ${className}`}
      role="menu"
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <div className="py-1" role="presentation">
        {TOOLS.map((tool, index) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.path)}
            className={`no-tap-highlight w-full text-left px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-0 ${
              isActivePath(tool.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            role="menuitem"
            tabIndex={isDropdownOpen ? 0 : -1}
            aria-current={isActivePath(tool.path) ? 'page' : undefined}
            data-tool-path={tool.path}
            data-tool-index={index}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  tool.color === 'blue' ? 'bg-blue-500' :
                  tool.color === 'green' ? 'bg-green-500' :
                  tool.color === 'purple' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900" aria-label={tool.name}>
                  {tool.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {tool.description}
                </div>
              </div>
              {isActivePath(tool.path) && (
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-label="当前页面"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}