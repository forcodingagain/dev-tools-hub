import { AppLayout } from "../components/layout/AppLayout"

export default function MermaidTool() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Mermaid在线工具
          </h1>
          <p className="text-gray-600 mb-8">
            绘制流程图、时序图、类图等多种图表类型，实时预览和导出
          </p>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center text-gray-500 py-12">
              <p>Mermaid工具正在开发中...</p>
              <p className="text-sm mt-2">即将支持多种图表类型的绘制和导出功能</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}