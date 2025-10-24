import { Link, useLocation } from "@remix-run/react"
import { useState, useEffect, useRef } from "react"
import { TOOLS } from "../../lib/constants"
import { useNavigationActions, useNavigationState, useNavigation } from "../../contexts/NavigationContext"
import {
  calculateDropdownPosition,
  adjustDropdownPosition,
  useClickOutside,
  useEscapeKey
} from "../../lib/dropdown-positioning"
import { DropdownMenu } from "./DropdownMenu"

export function Header() {
  const location = useLocation()
  const { dropdownRef, menuItemRef } = useNavigation()
  const { isDropdownOpen } = useNavigationState()
  const { openDropdown, closeDropdown } = useNavigationActions()

  const [dropdownPosition, setDropdownPosition] = useState<React.CSSProperties>({})

  const isActivePath = (path: string) => location.pathname === path

  // 计算下拉菜单位置
  useEffect(() => {
    if (isDropdownOpen) {
      const position = calculateDropdownPosition(menuItemRef)
      if (position) {
        const adjustedPosition = adjustDropdownPosition(position)
        setDropdownPosition({
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${Math.max(position.width, 200)}px`, // 最小宽度200px
          zIndex: 50,
        })
      }
    }
  }, [isDropdownOpen, menuItemRef])

  // 处理点击外部关闭
  useClickOutside(dropdownRef, menuItemRef, isDropdownOpen, closeDropdown)

  // 处理ESC键关闭
  useEscapeKey(isDropdownOpen, closeDropdown)

  const handleMouseEnter = () => {
    openDropdown()
  }

  const handleMouseLeave = () => {
    // 延迟关闭，让用户有时间移动到下拉菜单
    setTimeout(() => {
      closeDropdown()
    }, 150)
  }

  const handleDropdownMouseEnter = () => {
    // 鼠标进入下拉菜单时，取消延迟关闭
    // (通过重新设置状态来取消timeout)
    openDropdown()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            在线工具库
          </Link>

          <nav className="flex items-center space-x-8">
            <div className="relative">
              <button
                ref={menuItemRef}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <span>在线工具</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
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

              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  style={dropdownPosition}
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <DropdownMenu />
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}