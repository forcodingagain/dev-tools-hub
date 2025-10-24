import { Link, useLocation } from "@remix-run/react"

export function Navigation() {
  const location = useLocation()

  const isActivePath = (path: string) => location.pathname === path

  return (
    <nav className="hidden md:flex space-x-6">
      <Link
        to="/json"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActivePath('/json')
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        JSON工具
      </Link>
      <Link
        to="/mermaid"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActivePath('/mermaid')
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        Mermaid工具
      </Link>
      <Link
        to="/markdown"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActivePath('/markdown')
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        Markdown工具
      </Link>
    </nav>
  )
}