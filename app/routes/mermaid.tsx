import { useState, useCallback, useEffect, useRef } from "react"
import {
  validateMermaid,
  getMermaidStats,
  detectChartType,
  generateChartExample,
  getSupportedThemes,
  CHART_TYPE_CONFIGS
} from "~/lib/mermaid"
import { copyToClipboard } from "~/lib/clipboard"
import { debounce } from "~/lib/debounce"
import type {
  MermaidToolState,
  MermaidChartType,
  MermaidTheme,
  MermaidRenderOptions
} from "~/types/mermaid"

export default function MermaidTool() {
  const [state, setState] = useState<MermaidToolState>({
    input: '',
    output: '',
    rendering: false,
    validation: { valid: true },
    options: {
      theme: 'default',
      autoLayout: true
    }
  })

  const [copyResult, setCopyResult] = useState<string>('')
  const [autoRender, setAutoRender] = useState(true)
  const svgRef = useRef<HTMLDivElement>(null)

  // 初始化Mermaid
  useEffect(() => {
    // 确保在客户端环境下才初始化
    if (typeof window !== 'undefined') {
      initMermaid()
    }
  }, [])

  // 动态初始化Mermaid
  const initMermaid = async () => {
    try {
      const mermaid = (await import('mermaid')).default
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#e5e7eb',
          lineColor: '#6b7280',
          secondaryColor: '#10b981',
          tertiaryColor: '#8b5cf6'
        },
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        securityLevel: 'loose'
      })
    } catch (error) {
      console.error('Failed to initialize Mermaid:', error)
    }
  }

  // 防抖渲染处理
  const debouncedRender = useCallback(
    debounce((input: string) => {
      if (autoRender && input.trim()) {
        renderChart(input)
      }
    }, 800),
    [autoRender]
  )

  // 渲染图表
  const renderChart = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, rendering: true, error: undefined }))

    try {
      // 动态导入mermaid
      const mermaid = (await import('mermaid')).default

      // 验证输入
      if (!code.trim()) {
        setState(prev => ({
          ...prev,
          rendering: false,
          error: '输入内容不能为空',
          validation: { valid: false, error: { message: '输入内容不能为空', type: 'syntax' } }
        }))
        return
      }

      // 生成唯一ID
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // 渲染图表
      const { svg } = await mermaid.render(id, code)

      // 获取统计信息
      const stats = getMermaidStats(code)

      setState(prev => ({
        ...prev,
        rendering: false,
        output: svg,
        validation: { valid: true, chartType: stats.chartType, nodeCount: stats.nodeCount },
        stats,
        error: undefined
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        rendering: false,
        error: `Mermaid渲染错误: ${(error as Error).message}`,
        validation: { valid: false, error: { message: (error as Error).message, type: 'render' } },
        output: ''
      }))
    }
  }, [])

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setState(prev => ({ ...prev, input: value }))

    if (autoRender) {
      debouncedRender(value)
    }
  }

  // 处理选项变化
  const handleOptionChange = (option: Partial<MermaidRenderOptions>) => {
    setState(prev => ({ ...prev, options: { ...prev.options, ...option } }))

    // 如果有输入内容，立即重新渲染
    if (state.input) {
      renderChart(state.input)
    }
  }

  // 手动渲染
  const handleRender = () => {
    if (state.input) {
      renderChart(state.input)
    }
  }

  // 复制SVG
  const handleCopySvg = async () => {
    if (!state.output) return

    try {
      // 提取SVG内容
      const svgMatch = state.output.match(/<svg[\s\S]*?<\/svg>/)
      const svgContent = svgMatch ? svgMatch[0] : state.output

      const result = await copyToClipboard(svgContent)
      setCopyResult(result.message)

      if (result.success) {
        setTimeout(() => setCopyResult(''), 3000)
      }
    } catch (error) {
      setCopyResult('复制失败')
    }
  }

  // 插入示例代码
  const handleInsertExample = (chartType: MermaidChartType) => {
    const example = generateChartExample(chartType)
    setState(prev => ({ ...prev, input: example }))

    if (autoRender) {
      setTimeout(() => renderChart(example), 100)
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

  // 导出SVG
  const handleExportSvg = () => {
    if (!state.output) return

    try {
      const svgMatch = state.output.match(/<svg[\s\S]*?<\/svg>/)
      const svgContent = svgMatch ? svgMatch[0] : state.output

      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mermaid-chart-${Date.now()}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setCopyResult('导出失败')
    }
  }

  // 获取可用主题
  const availableThemes = state.validation.chartType
    ? getSupportedThemes(state.validation.chartType)
    : ['default', 'base', 'dark', 'forest', 'neutral', 'null']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mermaid在线工具
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              绘制流程图、时序图、类图等多种图表类型，实时预览和导出高清图片
            </p>
          </header>

          <main className="space-y-6">
            {/* 工具栏 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* 图表类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    图表类型示例
                  </label>
                  <select
                    onChange={(e) => handleInsertExample(e.target.value as MermaidChartType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">选择示例...</option>
                    {Object.entries(CHART_TYPE_CONFIGS).map(([type, config]) => (
                      <option key={type} value={type}>{config.name}</option>
                    ))}
                  </select>
                </div>

                {/* 主题选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主题样式
                  </label>
                  <select
                    value={state.options.theme}
                    onChange={(e) => handleOptionChange({ theme: e.target.value as MermaidTheme })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {availableThemes.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>

                {/* 自动渲染开关 */}
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRender}
                      onChange={(e) => setAutoRender(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      自动渲染
                    </span>
                  </label>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleRender}
                    disabled={!state.input || state.rendering}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state.rendering ? '渲染中...' : '渲染图表'}
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
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">输入 Mermaid 代码</h3>
                  {state.stats && (
                    <span className="text-sm text-gray-500">
                      {state.stats.characters} 字符
                    </span>
                  )}
                </div>

                <textarea
                  value={state.input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="在此输入 Mermaid 图表代码...

示例：
graph TD
    A[开始] --> B{判断}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E"
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm resize-none"
                />

                {/* 错误显示 */}
                {state.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{state.error}</p>
                    {state.validation.error?.line && (
                      <p className="text-xs text-red-600 mt-1">
                        行 {state.validation.error.line}
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
                        <span className="text-gray-600">行数:</span>
                        <span className="ml-2 font-medium">{state.stats.lines}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">节点数:</span>
                        <span className="ml-2 font-medium">{state.stats.nodeCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">边数:</span>
                        <span className="ml-2 font-medium">{state.stats.edgeCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">图表类型:</span>
                        <span className="ml-2 font-medium">
                          {state.stats.chartType && CHART_TYPE_CONFIGS[state.stats.chartType]?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">预计渲染:</span>
                        <span className="ml-2 font-medium">
                          {state.stats.estimatedRenderTime}ms
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输出区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">渲染结果</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopySvg}
                      disabled={!state.output}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      复制SVG
                    </button>
                    <button
                      onClick={handleExportSvg}
                      disabled={!state.output}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      导出SVG
                    </button>
                  </div>
                </div>

                {/* 图表显示区域 */}
                <div
                  ref={svgRef}
                  className="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 overflow-auto flex items-center justify-center"
                >
                  {state.output ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {/* 安全地渲染SVG - 使用iframe避免XSS */}
                      {state.output.includes('<svg') ? (
                        <iframe
                          srcDoc={state.output}
                          className="w-full h-full border-0 bg-transparent"
                          sandbox="allow-same-origin"
                          title="Mermaid Chart"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <p className="text-sm">图表内容格式错误</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm">渲染的图表将显示在这里</p>
                    </div>
                  )}
                </div>

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
                      ✓ Mermaid 图表渲染成功
                      {state.stats && state.stats.nodeCount > 0 && (
                        <span className="ml-2">({state.stats.nodeCount} 个节点)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">支持的图表类型</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {Object.entries(CHART_TYPE_CONFIGS).map(([type, config]) => (
                      <div key={type} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{config.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">功能特性</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 实时渲染预览</li>
                    <li>• 多种主题样式</li>
                    <li>• SVG 导出功能</li>
                    <li>• 语法错误检测</li>
                    <li>• 节点数量限制（200个）</li>
                    <li>• 自动布局优化</li>
                    <li>• 复制到剪贴板</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>限制说明:</strong> 最多支持 200 个节点，复杂图表可能影响渲染性能。建议将大型图表拆分为多个小图表。
                </p>
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