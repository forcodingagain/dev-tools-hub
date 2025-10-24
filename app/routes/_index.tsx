import { Link } from "@remix-run/react"

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            在线工具库
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            专为开发者打造的一站式在线工具集合，提供JSON格式化、Mermaid图表绘制、Markdown预览转换等常用工具
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link
            to="/json"
            className="tool-card group block"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                JSON在线工具
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                格式化和验证JSON数据，支持语法高亮显示和错误提示，帮助您快速处理JSON格式
              </p>
            </div>
          </Link>

          <Link
            to="/mermaid"
            className="tool-card group block"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mermaid在线工具
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                绘制流程图、时序图、类图等多种图表类型，实时预览和导出高清图片
              </p>
            </div>
          </Link>

          <Link
            to="/markdown"
            className="tool-card group block"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Markdown在线工具
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                实时预览Markdown文档，支持转换为HTML、图片、TXT等多种格式
              </p>
            </div>
          </Link>
        </main>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>© 2025 在线工具库 - 专为开发者设计</p>
        </footer>
      </div>
    </div>
  )
}