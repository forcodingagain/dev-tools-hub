import { AppLayout } from "../components/layout/AppLayout"

export default function MarkdownTool() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Markdown在线工具
          </h1>
          <p className="text-gray-600 mb-8">
            实时预览Markdown文档，支持转换为HTML、图片、TXT格式
          </p>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center text-gray-500 py-12">
              <p>Markdown工具正在开发中...</p>
              <p className="text-sm mt-2">即将支持实时预览和多格式转换功能</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}