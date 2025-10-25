import { useState, useCallback, useEffect, useRef } from "react"
import {
  convertMarkdownToHtml,
  convertMarkdownToText,
  validateMarkdown,
  getMarkdownStats,
  generateMarkdownExample,
  getSupportedThemes,
  exportMarkdown,
  MARKDOWN_PRESETS
} from "~/lib/markdown"
import { copyToClipboard } from "~/lib/clipboard"
import { debounce } from "~/lib/debounce"
import type {
  MarkdownToolState,
  MarkdownExportFormat,
  MarkdownRenderOptions,
  MarkdownStats
} from "~/types/markdown"

export default function MarkdownTool() {
  const [state, setState] = useState<MarkdownToolState>({
    input: '',
    htmlOutput: '',
    textOutput: '',
    processing: false,
    validation: { valid: true, characterCount: 0, estimatedTime: 0 },
    options: {
      theme: 'github',
      githubFlavored: true,
      tables: true,
      tasklists: true,
      smartLists: true,
      smartQuotes: true,
      footnotes: false,
      highlight: true
    },
    exportFormat: 'html',
    history: []
  })

  const [copyResult, setCopyResult] = useState<string>('')
  const [autoPreview, setAutoPreview] = useState(true)
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'text'>('preview')

  // 生成安全的预览HTML
  const generatePreviewHTML = (htmlContent: string): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              background: white;
              color: #24292e;
            }
            pre {
              background: #f6f8fa;
              padding: 16px;
              border-radius: 6px;
              overflow-x: auto;
            }
            code {
              background: #f6f8fa;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, monospace;
            }
            blockquote {
              border-left: 4px solid #dfe2e5;
              padding-left: 16px;
              margin: 16px 0;
              color: #6a737d;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 16px 0;
            }
            th, td {
              border: 1px solid #dfe2e5;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background: #f6f8fa;
              font-weight: 600;
            }
            .task-list-item {
              list-style: none;
              margin-left: -1.5em;
            }
            .task-list-item input {
              margin-right: 0.5em;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `
  }

  // 防抖预览处理
  const debouncedPreview = useCallback(
    debounce((input: string) => {
      if (autoPreview && input.trim()) {
        processMarkdown(input)
      }
    }, 600),
    [autoPreview]
  )

  // 处理Markdown转换
  const processMarkdown = useCallback(async (markdown: string) => {
    setState(prev => ({ ...prev, processing: true, error: undefined }))

    try {
      // 验证输入
      const validation = validateMarkdown(markdown)
      if (!validation.valid) {
        setState(prev => ({
          ...prev,
          processing: false,
          error: validation.error?.message,
          validation
        }))
        return
      }

      // 获取统计信息
      const stats = getMarkdownStats(markdown)

      // 并行转换HTML和文本
      const [htmlResult, textResult] = await Promise.all([
        convertMarkdownToHtml(markdown, state.options),
        convertMarkdownToText(markdown)
      ])

      // 更新状态
      setState(prev => ({
        ...prev,
        processing: false,
        htmlOutput: htmlResult.html || '',
        textOutput: textResult.text || '',
        validation,
        stats,
        error: htmlResult.error?.message || textResult.error?.message
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        processing: false,
        error: `Markdown处理错误: ${(error as Error).message}`,
        validation: { valid: false, characterCount: markdown.length, estimatedTime: 0 }
      }))
    }
  }, [state.options])

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setState(prev => ({ ...prev, input: value }))

    if (autoPreview) {
      debouncedPreview(value)
    }
  }

  // 处理选项变化
  const handleOptionChange = (option: Partial<MarkdownRenderOptions>) => {
    setState(prev => ({ ...prev, options: { ...prev.options, ...option } }))

    // 如果有输入内容，立即重新处理
    if (state.input) {
      processMarkdown(state.input)
    }
  }

  // 手动预览
  const handlePreview = () => {
    if (state.input) {
      processMarkdown(state.input)
    }
  }

  // 插入示例代码
  const handleInsertExample = (presetType: string) => {
    const example = generateMarkdownExample(presetType)
    setState(prev => ({ ...prev, input: example }))

    if (autoPreview) {
      setTimeout(() => processMarkdown(example), 100)
    }
  }

  // 清空输入
  const handleClear = () => {
    setState(prev => ({
      ...prev,
      input: '',
      htmlOutput: '',
      textOutput: '',
      validation: { valid: true, characterCount: 0, estimatedTime: 0 },
      error: undefined,
      stats: undefined
    }))
  }

  // 导出功能
  const handleExport = async (format: MarkdownExportFormat) => {
    if (!state.input) return

    try {
      const exportOptions = {
        format,
        filename: `markdown-export-${Date.now()}.${format}`,
        width: 800,
        height: 600,
        quality: 0.9,
        backgroundColor: '#ffffff',
        ...state.options
      }

      const result = await exportMarkdown(state.input, exportOptions)

      if (result.success) {
        setCopyResult(`已导出为${format.toUpperCase()}格式`)
        setTimeout(() => setCopyResult(''), 3000)
      } else {
        setCopyResult(result.error?.message || '导出失败')
      }
    } catch (error) {
      setCopyResult('导出失败')
    }
  }

  // 复制HTML
  const handleCopyHtml = async () => {
    if (!state.htmlOutput) return

    try {
      const result = await copyToClipboard(state.htmlOutput)
      setCopyResult(result.message)

      if (result.success) {
        setTimeout(() => setCopyResult(''), 3000)
      }
    } catch (error) {
      setCopyResult('复制失败')
    }
  }

  // 复制文本
  const handleCopyText = async () => {
    if (!state.textOutput) return

    try {
      const result = await copyToClipboard(state.textOutput)
      setCopyResult(result.message)

      if (result.success) {
        setTimeout(() => setCopyResult(''), 3000)
      }
    } catch (error) {
      setCopyResult('复制失败')
    }
  }

  // 获取可用主题
  const availableThemes = getSupportedThemes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Markdown在线工具
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              实时预览Markdown文档，支持转换为HTML、图片、TXT等多种格式
            </p>
          </header>

          <main className="space-y-6">
            {/* 工具栏 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* 预设选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预设样式
                  </label>
                  <select
                    onChange={(e) => {
                      handleInsertExample(e.target.value)
                      // 同时应用预设的选项
                      const preset = MARKDOWN_PRESETS[e.target.value]
                      if (preset) {
                        handleOptionChange(preset.options)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">选择预设...</option>
                    {Object.entries(MARKDOWN_PRESETS).map(([type, preset]) => (
                      <option key={type} value={type}>{preset.name}</option>
                    ))}
                  </select>
                </div>

                {/* 主题选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    渲染主题
                  </label>
                  <select
                    value={state.options.theme}
                    onChange={(e) => handleOptionChange({ theme: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {availableThemes.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>

                {/* 自动预览开关 */}
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPreview}
                      onChange={(e) => setAutoPreview(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      自动预览
                    </span>
                  </label>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreview}
                    disabled={!state.input || state.processing}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state.processing ? '处理中...' : '预览'}
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    清空
                  </button>
                </div>

                {/* 导出按钮 */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExport('html')}
                    disabled={!state.htmlOutput}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    导出HTML
                  </button>
                  <button
                    onClick={() => handleExport('png')}
                    disabled={!state.htmlOutput}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    导出图片
                  </button>
                  <button
                    onClick={() => handleExport('text')}
                    disabled={!state.textOutput}
                    className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    导出TXT
                  </button>
                </div>
              </div>
            </div>

            {/* 主要内容区 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 输入区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">输入 Markdown</h3>
                  {state.stats && (
                    <span className="text-sm text-gray-500">
                      {state.stats.characters} 字符
                    </span>
                  )}
                </div>

                <textarea
                  value={state.input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="在此输入 Markdown 内容...

示例：
# 标题
## 二级标题

- 列表项1
- 列表项2

**粗体文本** 和 *斜体文本*

&#96;&#96;&#96;javascript
console.log('Hello, Markdown!');
&#96;&#96;&#96;"
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
                />

                {/* 错误显示 */}
                {state.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{state.error}</p>
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
                        <span className="text-gray-600">单词数:</span>
                        <span className="ml-2 font-medium">{state.stats.words}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">标题数:</span>
                        <span className="ml-2 font-medium">{state.stats.headings}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">链接数:</span>
                        <span className="ml-2 font-medium">{state.stats.links}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">图片数:</span>
                        <span className="ml-2 font-medium">{state.stats.images}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">代码块:</span>
                        <span className="ml-2 font-medium">{state.stats.codeBlocks}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">表格数:</span>
                        <span className="ml-2 font-medium">{state.stats.tables}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输出区域 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">预览结果</h3>
                  <div className="flex items-center space-x-2">
                    {/* 标签页切换 */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          activeTab === 'preview'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        预览
                      </button>
                      <button
                        onClick={() => setActiveTab('html')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          activeTab === 'html'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setActiveTab('text')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          activeTab === 'text'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        文本
                      </button>
                    </div>

                    {/* 复制按钮 */}
                    {activeTab === 'html' && (
                      <button
                        onClick={handleCopyHtml}
                        disabled={!state.htmlOutput}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        复制HTML
                      </button>
                    )}
                    {activeTab === 'text' && (
                      <button
                        onClick={handleCopyText}
                        disabled={!state.textOutput}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        复制文本
                      </button>
                    )}
                  </div>
                </div>

                {/* 内容显示区域 */}
                <div className="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
                  {activeTab === 'preview' && state.htmlOutput && (
                    <iframe
                      srcDoc={generatePreviewHTML(state.htmlOutput)}
                      className="w-full h-full border-0 bg-white"
                      sandbox="allow-same-origin"
                      title="Markdown Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                    />
                  )}
                  {activeTab === 'html' && state.htmlOutput && (
                    <textarea
                      value={state.htmlOutput}
                      readOnly
                      className="w-full h-full p-4 font-mono text-sm resize-none border-0 bg-transparent"
                    />
                  )}
                  {activeTab === 'text' && state.textOutput && (
                    <textarea
                      value={state.textOutput}
                      readOnly
                      className="w-full h-full p-4 font-mono text-sm resize-none border-0 bg-transparent"
                    />
                  )}
                  {!state.htmlOutput && !state.textOutput && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">Markdown预览将显示在这里</p>
                      </div>
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
                {state.validation.valid && state.htmlOutput && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      ✓ Markdown 渲染成功
                      {state.stats && state.stats.words > 0 && (
                        <span className="ml-2">({state.stats.words} 个单词)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">支持的Markdown语法</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 标题：# ## ### ######</li>
                    <li>• 粗体：**文本** 或 __文本__</li>
                    <li>• 斜体：*文本* 或 _文本_</li>
                    <li>• 代码：`行内代码` 和 &#96;&#96;&#96;代码块&#96;&#96;&#96;</li>
                    <li>• 链接：[文本](URL)</li>
                    <li>• 图片：![描述](URL)</li>
                    <li>• 列表：- 无序，1. 有序</li>
                    <li>• 引用：&gt; 引用文本</li>
                    <li>• 表格：| 列1 | 列2 |</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">功能特性</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 实时预览渲染</li>
                    <li>• 多种主题样式</li>
                    <li>• HTML导出功能</li>
                    <li>• PNG/JPG图片导出</li>
                    <li>• 纯文本转换</li>
                    <li>• 复制到剪贴板</li>
                    <li>• 文档大小限制（500KB）</li>
                    <li>• 语法错误检测</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>限制说明:</strong> 最大支持 500KB 文档，复杂文档可能影响渲染性能。建议将大型文档拆分为多个小文档。
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