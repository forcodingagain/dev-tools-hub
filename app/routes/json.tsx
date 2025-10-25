import { useState, useCallback, useEffect, useRef } from "react"
import { formatJson, validateJson, minifyJson, getJsonStats, checkJsonSize } from "~/lib/json"
import { copyToClipboard } from "~/lib/clipboard"
import { debounce } from "~/lib/debounce"
import type { JsonToolState, JsonFormatterOptions, ValidationResult } from "~/types/json"

export default function JsonTool() {
  const [state, setState] = useState<JsonToolState>({
    input: '',
    output: '',
    processing: false,
    validation: { valid: true },
    options: {
      indent: 2,
      sortKeys: false
    }
  })

  const [copyResult, setCopyResult] = useState<string>('')
  const maxFileSize = 5 * 1024 * 1024 // 5MB

  // 防抖处理输入
  const debouncedProcess = useCallback(
    debounce((input: string) => {
      processJson(input)
    }, 500),
    []
  )

  // 处理JSON输入
  const processJson = useCallback((input: string) => {
    setState(prev => ({ ...prev, processing: true, error: undefined }))

    try {
      // 检查文件大小
      const sizeCheck = checkJsonSize(input, maxFileSize)
      if (!sizeCheck.valid) {
        setState(prev => ({
          ...prev,
          processing: false,
          error: sizeCheck.error,
          validation: { valid: false },
          output: ''
        }))
        return
      }

      // 验证JSON
      const validation = validateJson(input)

      if (!validation.valid) {
        setState(prev => ({
          ...prev,
          processing: false,
          validation,
          error: 'JSON语法错误',
          output: ''
        }))
        return
      }

      // 格式化JSON
      const formatResult = formatJson(input, state.options)

      if (formatResult.success) {
        // 获取统计信息
        const statsResult = getJsonStats(input)

        setState(prev => ({
          ...prev,
          processing: false,
          validation: { valid: true },
          output: formatResult.formatted || '',
          stats: statsResult.stats,
          error: undefined
        }))
      } else {
        setState(prev => ({
          ...prev,
          processing: false,
          validation,
          error: formatResult.error?.message,
          output: ''
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        processing: false,
        error: `处理失败: ${(error as Error).message}`,
        validation: { valid: false },
        output: ''
      }))
    }
  }, [state.options, maxFileSize])

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setState(prev => ({ ...prev, input: value }))
    debouncedProcess(value)
  }

  // 处理选项变化
  const handleOptionChange = (option: Partial<JsonFormatterOptions>) => {
    setState(prev => ({ ...prev, options: { ...prev.options, ...option } }))
  }

  // 复制到剪贴板
  const handleCopy = async () => {
    if (!state.output) return

    try {
      const result = await copyToClipboard(state.output)
      setCopyResult(result.message)

      if (result.success) {
        setTimeout(() => setCopyResult(''), 3000)
      }
    } catch (error) {
      setCopyResult('复制失败')
    }
  }

  // 压缩JSON
  const handleMinify = () => {
    if (!state.input) return

    const result = minifyJson(state.input)
    if (result.success) {
      setState(prev => ({ ...prev, output: result.formatted || '' }))
    }
  }

  // 清空输入
  const handleClear = () => {
    setState(prev => ({
      ...prev,
      input: '',
      output: '',
      validation: { valid: true },
      error: undefined,
      stats: undefined
    }))
  }

  // 格式化JSON
  const handleFormat = () => {
    if (state.input) {
      processJson(state.input)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              JSON在线工具
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              格式化和验证JSON数据，支持语法高亮和错误提示，帮助您快速处理JSON格式
            </p>
          </header>

          <main className="space-y-6">
            {/* 选项栏 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">格式化选项</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 缩进选项 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    缩进空格数
                  </label>
                  <select
                    value={state.options.indent}
                    onChange={(e) => handleOptionChange({ indent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>2 空格</option>
                    <option value={4}>4 空格</option>
                    <option value={8}>8 空格</option>
                    <option value={0}>不缩进（压缩）</option>
                  </select>
                </div>

                {/* 排序键选项 */}
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.options.sortKeys}
                      onChange={(e) => handleOptionChange({ sortKeys: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      按字母顺序排序键
                    </span>
                  </label>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleFormat}
                    disabled={!state.input || state.processing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state.processing ? '处理中...' : '格式化'}
                  </button>
                  <button
                    onClick={handleMinify}
                    disabled={!state.input || state.processing}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    压缩
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>

            {/* 主要内容区 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 输入区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">输入 JSON</h3>
                  {state.stats && (
                    <span className="text-sm text-gray-500">
                      {state.stats.characters} 字符
                    </span>
                  )}
                </div>

                <textarea
                  value={state.input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="在此粘贴或输入 JSON 数据..."
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                />

                {/* 错误显示 */}
                {state.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{state.error}</p>
                    {state.validation.error && (
                      <p className="text-xs text-red-600 mt-1">
                        行 {state.validation.error.line}, 列 {state.validation.error.column}
                      </p>
                    )}
                  </div>
                )}

                {/* 统计信息 */}
                {state.stats && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">字符数:</span>
                        <span className="ml-2 font-medium">{state.stats.characters}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">文件大小:</span>
                        <span className="ml-2 font-medium">
                          {(state.stats.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                      {state.stats.keys !== undefined && (
                        <div>
                          <span className="text-gray-600">键数量:</span>
                          <span className="ml-2 font-medium">{state.stats.keys}</span>
                        </div>
                      )}
                      {state.stats.depth !== undefined && (
                        <div>
                          <span className="text-gray-600">深度:</span>
                          <span className="ml-2 font-medium">{state.stats.depth}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 输出区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">格式化结果</h3>
                  <button
                    onClick={handleCopy}
                    disabled={!state.output}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    复制结果
                  </button>
                </div>

                <textarea
                  value={state.output}
                  readOnly
                  placeholder="格式化后的 JSON 将显示在这里..."
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                />

                {/* 复制结果提示 */}
                {copyResult && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">{copyResult}</p>
                  </div>
                )}

                {/* 验证成功提示 */}
                {state.validation.valid && state.output && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      ✓ JSON 格式正确，已成功格式化
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">支持的功能</h4>
                  <ul className="space-y-1">
                    <li>• JSON 格式化和美化</li>
                    <li>• JSON 语法验证</li>
                    <li>• 键字母排序</li>
                    <li>• JSON 压缩</li>
                    <li>• 复制到剪贴板</li>
                    <li>• 错误位置定位</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">限制说明</h4>
                  <ul className="space-y-1">
                    <li>• 最大文件大小: 5MB</li>
                    <li>• 所有数据本地处理</li>
                    <li>• 不发送到服务器</li>
                    <li>• 支持复杂嵌套结构</li>
                    <li>• 自动检测语法错误</li>
                    <li>• 实时格式化处理</li>
                  </ul>
                </div>
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