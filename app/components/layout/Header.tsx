import { Link, useLocation } from "@remix-run/react"
import { useState, useRef } from "react"
import { TOOLS } from "../../lib/constants"

export function Header() {
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuItemRef = useRef<HTMLButtonElement>(null)
  const [announcement, setAnnouncement] = useState<string>("")

  const isActivePath = (path: string) => location.pathname === path

  // 处理工具点击
  const handleToolClick = (toolPath: string) => {
    setIsDropdownOpen(false)

    // 通知屏幕阅读器导航已完成
    const tool = TOOLS.find(t => t.path === toolPath)
    setAnnouncement(`已导航到${tool?.name || '工具'}页面`)
    setTimeout(() => setAnnouncement(""), 2000)
  }

  // 鼠标悬停处理 - 使用延迟避免快速移动时闪烁
  const handleMouseEnter = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // 确保hover样式正确
    if (e) {
      e.currentTarget.style.textDecoration = 'none';
      e.currentTarget.style.color = '#374151';
    }
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    // 延迟关闭，给用户时间移动到下拉菜单
    setTimeout(() => {
      setIsDropdownOpen(false)
    }, 800)
  }

  const handleDropdownMouseEnter = () => {
    // 鼠标进入下拉菜单时保持打开状态
    setIsDropdownOpen(true)
  }

  // 键盘支持
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsDropdownOpen(!isDropdownOpen)
    } else if (event.key === 'ArrowDown' && !isDropdownOpen) {
      event.preventDefault()
      setIsDropdownOpen(true)
    } else if (event.key === 'Escape' && isDropdownOpen) {
      event.preventDefault()
      setIsDropdownOpen(false)
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
            className="no-tap-highlight text-xl font-bold text-gray-700 transition-colors focus:outline-none focus:ring-0 rounded px-2 py-1 logo-link"
            style={{
              textDecoration: 'none'
            }}
            aria-label="返回首页"
          >
            在线工具库
          </Link>

          <nav className="flex items-center space-x-8" aria-label="主导航">
            {/* 桌面端导航 */}
            <div className="hidden md:block relative">
              <button
                ref={menuItemRef}
                className={`no-tap-highlight flex items-center space-x-1 text-gray-700 font-medium transition-all duration-200 py-2 px-3 rounded-md hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-0 tools-menu-button ${
                  isDropdownOpen ? 'bg-blue-50 text-blue-600' : ''
                }`}
                style={{
                  textDecoration: 'none',
                  color: '#374151',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
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
                  className={`w-4 h-4 transition-transform duration-300 ease-in-out ml-1 ${
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
                <svg
                  className="w-3 h-3 text-gray-400 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-label="下拉菜单指示器"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* 下拉菜单 - 使用新的 shadcn/ui 风格组件 */}
              <div
                className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 transition-all duration-200 ease-in-out origin-top ${
                  isDropdownOpen
                    ? 'opacity-100 scale-100 visible pointer-events-auto'
                    : 'opacity-0 scale-95 invisible pointer-events-none'
                }`}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={() => {
                  // 下拉菜单自己的鼠标离开事件
                  setTimeout(() => {
                    closeDropdown()
                  }, 300)
                }}
              >
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-h-96 overflow-y-auto">
                  {TOOLS.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      onClick={() => {
                        handleToolClick(tool.path)
                        closeDropdown()
                      }}
                      className={`flex items-center px-4 py-3 text-sm transition-colors duration-150 focus:outline-none focus:bg-gray-100 cursor-pointer no-underline ${
                        isActivePath(tool.path)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 mr-3 ${
                          tool.color === 'blue' ? 'bg-blue-500' :
                          tool.color === 'green' ? 'bg-green-500' :
                          tool.color === 'purple' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {tool.description}
                        </div>
                      </div>
                      {isActivePath(tool.path) && (
                        <svg
                          className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 移动端导航 - 暂时移除 */}
            {/* <MobileNavigation /> */}
          </nav>
        </div>
      </div>
    </header>
  )
}