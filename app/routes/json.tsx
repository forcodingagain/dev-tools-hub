export default function JsonTool() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              JSON在线工具
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              格式化和验证JSON数据，支持语法高亮和错误提示，帮助您快速处理JSON格式
            </p>
          </header>

          <main>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-8">
              <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">JSON工具正在开发中...</p>
                <p className="text-gray-500">即将支持JSON格式化、验证和复制功能</p>
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