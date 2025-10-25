import type { LoaderFunctionArgs } from "@remix-run/node"

/**
 * 通配符路由 - 处理未匹配的路径请求
 * 主要用于处理Chrome开发者工具等静态资源请求
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // 对于Chrome开发者工具和其他系统请求，返回404但不报错
  if (pathname.includes('.well-known') ||
      pathname.includes('chrome.devtools') ||
      pathname.includes('favicon') ||
      pathname.endsWith('.json') && pathname.includes('.')) {
    return new Response("Not Found", { status: 404 })
  }

  // 对于其他未匹配的路径，也返回404
  return new Response("Not Found", { status: 404 })
}

// 不渲染任何内容，因为这些通常是API请求或静态资源请求
export default function CatchAllRoute() {
  return null
}