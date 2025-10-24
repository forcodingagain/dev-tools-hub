import { useState } from "react"
import { useNavigationState, useNavigationActions } from "../../contexts/NavigationContext"
import { DropdownMenu } from "./DropdownMenu"

interface MobileNavigationProps {
  className?: string
}

export function MobileNavigation({ className = "" }: MobileNavigationProps) {
  const { isDropdownOpen } = useNavigationState()
  const { openDropdown, closeDropdown } = useNavigationActions()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (!isMobileMenuOpen) {
      openDropdown()
    } else {
      closeDropdown()
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    closeDropdown()
  }

  return (
    <div className={`md:hidden ${className}`}>
      {/* 移动端菜单按钮 */}
      <button
        onClick={toggleMobileMenu}
        className="no-tap-highlight inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        aria-controls="mobile-menu"
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* 移动端下拉菜单 */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
          {/* 遮罩层，帮助用户聚焦在菜单上 */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* 菜单内容 */}
          <div className="relative bg-white">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">在线工具</h2>
              <DropdownMenu className="w-full min-w-0" />
            </div>

            {/* 菜单底部信息 */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                选择一个工具开始使用
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}