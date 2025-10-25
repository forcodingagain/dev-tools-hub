import { useState, useCallback, useEffect, useRef } from "react"
import { formatJson, validateJson, minifyJson, getJsonStats, checkJsonSize } from "~/lib/json"
import { copyToClipboard } from "~/lib/clipboard"
import { debounce } from "~/lib/debounce"
import { useOperationPerformance } from "~/hooks/usePerformance"
import {
  useKeyboardNavigation,
  useScreenReader,
  useFocusManagement,
  useAccessibleForm,
  useAriaLabels,
  useSkipLink
} from "~/hooks/useAccessibility"
import { useAsyncOperation, useLoading } from "~/hooks/useLoading"
import type { JsonToolState, JsonFormatterOptions, ValidationResult } from "~/types/json"
import { SkipLink } from "~/components/ui/skipLink"
import { LiveRegion } from "~/components/ui/liveRegion"
import { ErrorAnnouncement } from "~/components/ui/ErrorAnnouncement"
import { SuccessAnnouncement } from "~/components/ui/SuccessAnnouncement"
import { LoadingScreen, InlineLoading } from "~/components/LoadingScreen"
import { SkeletonContainer, TextSkeleton, CardSkeleton } from "~/components/Skeleton"

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

  // 性能监控和加载状态
  const { execute: executeFormat, isRunning: isFormatting } = useOperationPerformance(
    'JSON格式化',
    'json_format'
  )

  const { execute: executeFormatWithLoading, loading: isLoading } = useAsyncOperation(
    'json-format',
    { loadingText: '正在格式化JSON...' }
  )

  const { isLoading: isGlobalLoading, showLoading, hideLoading } = useLoading()

  // 计算总的加载状态，避免加载屏幕一直显示
  const isAnyLoading = isLoading || isFormatting || isGlobalLoading

  // 可访问性功能
  const { announce, announceError, announceSuccess, announceLoading } = useScreenReader()
  const { containerRef } = useKeyboardNavigation({
    enableTabNavigation: true,
    enableArrowNavigation: false,
    enableEnterSpaceActivation: true,
    onFocus: (element) => {
      const elementType = element.tagName.toLowerCase()
      announce(`聚焦到${elementType === 'textarea' ? '文本区域' : elementType}`)
    }
  })

  const { createFieldProps } = useAccessibleForm()
  const { generateLabel, labels } = useAriaLabels()
  const { skipLinkId } = useSkipLink()

  // 防抖处理输入
  const debouncedProcess = useCallback(
    debounce((input: string) => {
      processJson(input)
    }, 500),
    []
  )

  // 处理JSON输入
  const processJson = useCallback(async (input: string) => {
    setState(prev => ({ ...prev, processing: true, error: undefined }))
    announceLoading('开始处理JSON')
    showLoading('正在处理JSON...')

    try {
      await executeFormatWithLoading(async () => {
        // 检查文件大小
        const sizeCheck = checkJsonSize(input, maxFileSize)
        if (!sizeCheck.valid) {
          const errorMessage = `文件大小超过限制: ${sizeCheck.error}`
          announceError(errorMessage)
          setState(prev => ({
            ...prev,
            processing: false,
            error: errorMessage,
            validation: { valid: false },
            output: ''
          }))
          return
        }

        // 验证JSON
        const validation = validateJson(input)

        if (!validation.valid) {
          const errorMessage = `JSON语法错误: 行${validation.error?.line}, 列${validation.error?.column}`
          announceError(errorMessage)
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

          announceSuccess('JSON格式化成功')
          setState(prev => ({
            ...prev,
            processing: false,
            validation: { valid: true },
            output: formatResult.formatted || '',
            stats: statsResult.stats,
            error: undefined
          }))
        } else {
          const errorMessage = `格式化失败: ${formatResult.error?.message}`
          announceError(errorMessage)
          setState(prev => ({
            ...prev,
            processing: false,
            validation,
            error: errorMessage,
            output: ''
          }))
        }
      })
    } catch (error) {
      const errorMessage = `处理失败: ${(error as Error).message}`
      announceError(errorMessage)
      setState(prev => ({
        ...prev,
        processing: false,
        error: errorMessage,
        validation: { valid: false },
        output: ''
      }))
    } finally {
      hideLoading()
    }
  }, [state.options, maxFileSize, executeFormatWithLoading, announceLoading, announceError, announceSuccess, showLoading, hideLoading])

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
    <>
      {/* 全局加载屏幕 - 只有在实际处理时才显示 */}
      <LoadingScreen
        enabled={isAnyLoading}
        loadingText="正在处理JSON数据..."
        minDisplayTime={500}
        showProgress={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 跳过链接 */}
        <SkipLink targetId="main-content" className="skip-link">
          跳转到主要内容
        </SkipLink>
      <SkipLink targetId="input-section" className="skip-link">
        跳转到输入区域
      </SkipLink>
      <SkipLink targetId="output-section" className="skip-link">
        跳转到输出区域
      </SkipLink>

      {/* 屏幕阅读器实时区域 */}
      <LiveRegion
        politeness="polite"
        atomic={false}
        aria-live="polite"
        aria-atomic="false"
      >
        {copyResult && <StatusAnnouncement message={copyResult} />}
        {state.error && <ErrorAnnouncement message={state.error} />}
        {state.validation.valid && state.output && <SuccessAnnouncement message="JSON格式化成功" />}
      </LiveRegion>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              JSON在线工具
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              格式化和验证JSON数据，支持语法高亮和错误提示
            </p>
          </header>

          <main id="main-content" className="space-y-6" role="main">
            {/* 选项栏 */}
            <section
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6"
              aria-labelledby="options-heading"
            >
              <h3 id="options-heading" className="text-lg font-semibold text-gray-900 mb-4">
                格式化选项
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 缩进选项 */}
                <div>
                  <label
                    htmlFor="indent-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    缩进空格数
                  </label>
                  <select
                    id="indent-select"
                    value={state.options.indent}
                    onChange={(e) => handleOptionChange({ indent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-describedby="indent-description"
                  >
                    <option value={2}>2 空格</option>
                    <option value={4}>4 空格</option>
                    <option value={8}>8 空格</option>
                    <option value={0}>不缩进（压缩）</option>
                  </select>
                  <span id="indent-description" className="sr-only">
                    选择JSON缩进的空格数量
                  </span>
                </div>

                {/* 排序键选项 */}
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="sort-keys-checkbox"
                      checked={state.options.sortKeys}
                      onChange={(e) => handleOptionChange({ sortKeys: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-describedby="sort-keys-description"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      按字母顺序排序键
                    </span>
                  </label>
                  <span id="sort-keys-description" className="sr-only">
                    启用后将按字母顺序排序JSON对象的键
                  </span>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2" role="group" aria-label="格式化操作">
                  <button
                    onClick={handleFormat}
                    disabled={!state.input || state.processing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
                    aria-describedby="format-button-description"
                    aria-busy={state.processing}
                  >
                    <div className="flex items-center space-x-2">
                      <InlineLoading
                        loading={state.processing}
                        text=""
                        size="sm"
                        color="secondary"
                      />
                      <span>{state.processing ? '处理中...' : '格式化'}</span>
                    </div>
                  </button>
                  <span id="format-button-description" className="sr-only">
                    格式化JSON输入内容
                  </span>

                  <button
                    onClick={handleMinify}
                    disabled={!state.input || state.processing}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-describedby="minify-button-description"
                  >
                    压缩
                  </button>
                  <span id="minify-button-description" className="sr-only">
                    压缩JSON，移除所有空白字符
                  </span>

                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    aria-describedby="clear-button-description"
                  >
                    清空
                  </button>
                  <span id="clear-button-description" className="sr-only">
                    清空输入和输出内容
                  </span>
                </div>
              </div>
            </section>

            {/* 主要内容区 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 输入区域 */}
              <section
                id="input-section"
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6"
                aria-labelledby="input-heading"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 id="input-heading" className="text-lg font-semibold text-gray-900">
                    输入 JSON
                  </h3>
                  {state.stats && (
                    <span
                      className="text-sm text-gray-500"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {state.stats.characters} 字符
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    ref={containerRef}
                    id="json-input"
                    value={state.input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="在此粘贴或输入 JSON 数据..."
                    className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none focusable"
                    aria-describedby="json-input-description json-input-error"
                    aria-invalid={!state.validation.valid}
                    aria-required="true"
                    spellCheck="false"
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                  />
                  <span id="json-input-description" className="sr-only">
                    输入需要格式化的JSON数据，支持粘贴或直接输入
                  </span>
                </div>

                {/* 错误显示 */}
                {state.error && (
                  <div
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    id="json-input-error"
                  >
                    <p className="text-sm text-red-700 font-medium">
                      {state.error}
                    </p>
                    {state.validation.error && (
                      <p className="text-xs text-red-600 mt-1">
                        行 {state.validation.error.line}, 列 {state.validation.error.column}
                      </p>
                    )}
                  </div>
                )}

                {/* 统计信息 */}
                {state.stats && (
                  <div
                    className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <h4 className="sr-only">JSON统计信息</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">字符数:</span>
                        <span className="ml-2 font-medium" aria-label={`共${state.stats.characters}个字符`}>
                          {state.stats.characters}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">文件大小:</span>
                        <span
                          className="ml-2 font-medium"
                          aria-label={`文件大小${(state.stats.size / 1024).toFixed(2)}KB`}
                        >
                          {(state.stats.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                      {state.stats.keys !== undefined && (
                        <div>
                          <span className="text-gray-600">键数量:</span>
                          <span className="ml-2 font-medium" aria-label={`包含${state.stats.keys}个键`}>
                            {state.stats.keys}
                          </span>
                        </div>
                      )}
                      {state.stats.depth !== undefined && (
                        <div>
                          <span className="text-gray-600">深度:</span>
                          <span className="ml-2 font-medium" aria-label={`嵌套深度${state.stats.depth}层`}>
                            {state.stats.depth}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* 输出区域 */}
              <section
                id="output-section"
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6"
                aria-labelledby="output-heading"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 id="output-heading" className="text-lg font-semibold text-gray-900">
                    格式化结果
                  </h3>
                  <button
                    onClick={handleCopy}
                    disabled={!state.output}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focusable"
                    aria-describedby="copy-button-description"
                    aria-live="polite"
                  >
                    复制结果
                  </button>
                  <span id="copy-button-description" className="sr-only">
                    将格式化后的JSON复制到剪贴板
                  </span>
                </div>

                <SkeletonContainer
                  loading={state.processing}
                  type="text"
                  skeletonProps={{ lines: 8, lineHeight: '1.5rem' }}
                >
                  <div className="relative">
                    <textarea
                      id="json-output"
                      value={state.output}
                      readOnly
                      placeholder="格式化后的 JSON 将显示在这里..."
                      className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                      aria-describedby="json-output-description json-output-status"
                      aria-label="格式化后的JSON输出结果"
                      spellCheck="false"
                    />
                    <span id="json-output-description" className="sr-only">
                      格式化后的JSON结果，只读显示
                    </span>
                  </div>
                </SkeletonContainer>

                {/* 复制结果提示 */}
                {copyResult && (
                  <div
                    className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <p className="text-sm text-green-700">{copyResult}</p>
                  </div>
                )}

                {/* 验证成功提示 */}
                {state.validation.valid && state.output && (
                  <div
                    className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    id="json-output-status"
                  >
                    <p className="text-sm text-green-700">
                      ✓ JSON 格式正确，已成功格式化
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* 使用说明 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">支持的功能</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• JSON 格式化和美化</li>
                    <li>• JSON 语法验证</li>
                    <li>• 键字母排序</li>
                    <li>• JSON 压缩</li>
                    <li>• 复制到剪贴板</li>
                    <li>• 错误位置定位</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">功能特性</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 所有数据本地处理</li>
                    <li>• 不发送到服务器</li>
                    <li>• 支持复杂嵌套结构</li>
                    <li>• 自动检测语法错误</li>
                    <li>• 实时格式化处理</li>
                    <li>• 实时错误提示</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>限制说明:</strong> 最大支持 5MB 文件，复杂文件可能影响处理性能。建议将大型文件拆分为多个小文件。
                </p>
              </div>
            </div>
          </main>

          <footer className="text-center mt-16 text-gray-500 text-sm" role="contentinfo">
            <p>© 2025 在线工具库 - 专为开发者设计</p>
          </footer>
        </div>
      </div>
    </div>
    </>
  )
}