import { Link, useLocation } from "@remix-run/react"
import { useState, useRef, useEffect } from "react"
import { TOOLS } from "../../lib/constants"
import { useNavigationActions, useNavigationState, useNavigation } from "../../contexts/NavigationContext"
import { DropdownMenu } from "./DropdownMenu"
import { MobileNavigation } from "./MobileNavigation"

export function Header() {
  const location = useLocation()
  const { dropdownRef, menuItemRef } = useNavigation()
  const { isDropdownOpen } = useNavigationState()
  const { openDropdown, closeDropdown } = useNavigationActions()
  const [announcement, setAnnouncement] = useState<string>("")

  const isActivePath = (path: string) => location.pathname === path

  // 处理屏幕阅读器通知
  useEffect(() => {
    const handleAnnounceNavigation = (event: CustomEvent) => {
      setAnnouncement(`已导航到${event.detail.tool}页面`)
      setTimeout(() => setAnnouncement(""), 2000)
    }

    const handleCloseDropdown = () => {
      closeDropdown()
    }

    document.addEventListener('announceNavigation', handleAnnounceNavigation as EventListener)
    document.addEventListener('closeDropdown', handleCloseDropdown)

    return () => {
      document.removeEventListener('announceNavigation', handleAnnounceNavigation as EventListener)
      document.removeEventListener('closeDropdown', handleCloseDropdown)
    }
  }, [closeDropdown])

  // 鼠标悬停处理 - 使用延迟避免快速移动时闪烁
  const handleMouseEnter = () => {
    openDropdown()
  }

  const handleMouseLeave = () => {
    // 延迟关闭，给用户时间移动到下拉菜单
    setTimeout(() => {
      closeDropdown()
    }, 200)
  }

  const handleDropdownMouseEnter = () => {
    // 鼠标进入下拉菜单时保持打开状态
    openDropdown()
  }

  // 键盘支持
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isDropdownOpen) {
        closeDropdown()
      } else {
        openDropdown()
      }
    } else if (event.key === 'ArrowDown' && !isDropdownOpen) {
      event.preventDefault()
      openDropdown()
    } else if (event.key === 'Escape' && isDropdownOpen) {
      event.preventDefault()
      closeDropdown()
    }
  }

  return (
    <header className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-b border-blue-100 relative z-50">
      {/* 屏幕阅读器通知区域 */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="no-tap-highlight text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors focus:outline-none focus:ring-0 rounded px-2 py-1"
            aria-label="返回首页"
          >
            在线工具库
          </Link>

          <nav className="flex items-center space-x-8" aria-label="主导航">
            {/* 桌面端导航 */}
            <div className="hidden md:block relative">
              <button
                ref={menuItemRef}
                className={`no-tap-highlight flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors py-2 px-3 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-0 ${
                  isDropdownOpen ? 'bg-gray-100' : ''
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => isDropdownOpen ? closeDropdown() : openDropdown()}
                onKeyDown={handleKeyDown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
                aria-label="在线工具菜单，按Enter或空格键打开"
              >
                <span>在线工具</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 下拉菜单 - 使用CSS绝对定位，避免状态驱动的重渲染 */}
              <div
                ref={dropdownRef}
                className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 min-w-[200px] transition-all duration-200 ease-in-out origin-top ${
                  isDropdownOpen
                    ? 'opacity-100 scale-100 visible pointer-events-auto'
                    : 'opacity-0 scale-95 invisible pointer-events-none'
                }`}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <DropdownMenu />
              </div>
            </div>

            {/* 移动端导航 */}
            <MobileNavigation />
          </nav>
        </div>
      </div>
    </header>
  )
}