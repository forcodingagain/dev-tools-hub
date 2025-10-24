import { AppLayout } from "../components/layout/AppLayout"

export default function JsonTool() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            JSON在线工具
          </h1>
          <p className="text-gray-600 mb-8">
            格式化和验证JSON数据，支持语法高亮和错误提示
          </p>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center text-gray-500 py-12">
              <p>JSON工具正在开发中...</p>
              <p className="text-sm mt-2">即将支持JSON格式化、验证和复制功能</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}