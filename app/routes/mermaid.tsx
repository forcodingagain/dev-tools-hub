export default function MermaidTool() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mermaid在线工具
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              绘制流程图、时序图、类图等多种图表类型，实时预览和导出高清图片
            </p>
          </header>

          <main>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-8">
              <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">Mermaid工具正在开发中...</p>
                <p className="text-gray-500">即将支持多种图表类型的绘制和导出功能</p>
              </div>
            </div>
          </main>

          <footer className="text-center mt-16 text-gray-500 text-sm">
            <p>© 2025 在线工具库 - 专为开发者设计</p>
          </footer>
        </div>
      </div>
    </div>
  )
}