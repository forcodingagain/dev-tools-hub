import { Link } from "@remix-run/react"
import { useLocation } from "@remix-run/react"
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

  const isActivePath = (path: string) => location.pathname === path

  if (!isDropdownOpen) return null

  const handleToolClick = (toolPath: string) => {
    navigateToTool(toolPath)
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[200px] ${className}`}>
      <div className="py-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.path)}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              isActivePath(tool.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            role="menuitem"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                tool.color === 'blue' ? 'bg-blue-500' :
                tool.color === 'green' ? 'bg-green-500' :
                tool.color === 'purple' ? 'bg-purple-500' :
                'bg-gray-500'
              }`} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">{tool.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {tool.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}