export default function MarkdownTool() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Markdown在线工具
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              实时预览Markdown文档，支持转换为HTML、图片、TXT等多种格式
            </p>
          </header>

          <main>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-8">
              <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">Markdown工具正在开发中...</p>
                <p className="text-gray-500">即将支持实时预览和多格式转换功能</p>
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