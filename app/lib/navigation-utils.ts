import { useNavigate, useLocation } from "@remix-run/react"

export function useToolNavigation() {
  const navigate = useNavigate()

  const navigateToTool = (toolPath: string) => {
    navigate(toolPath, {
      replace: false, // 不替换历史记录，保持浏览器导航功能
    })
  }

  const navigateToHome = () => {
    navigate("/", {
      replace: false,
    })
  }

  const goBack = () => {
    navigate(-1)
  }

  return {
    navigateToTool,
    navigateToHome,
    goBack,
  }
}

export function useActiveTool() {
  const location = useLocation()

  const getActiveTool = () => {
    const path = location.pathname
    if (path.startsWith('/json')) return 'json'
    if (path.startsWith('/mermaid')) return 'mermaid'
    if (path.startsWith('/markdown')) return 'markdown'
    return null
  }

  return getActiveTool()
}

export function isToolPage(pathname: string): boolean {
  return ['/json', '/mermaid', '/markdown'].some(tool =>
    pathname === tool || pathname.startsWith(`${tool}/`)
  )
}

export function getToolFromPath(pathname: string): string | null {
  if (pathname === '/' || !isToolPage(pathname)) return null

  if (pathname.startsWith('/json')) return 'json'
  if (pathname.startsWith('/mermaid')) return 'mermaid'
  if (pathname.startsWith('/markdown')) return 'markdown'

  return null
}