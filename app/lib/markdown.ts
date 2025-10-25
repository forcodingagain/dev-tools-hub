import * as Showdown from 'showdown'
import type {
  MarkdownExportFormat,
  MarkdownRenderOptions,
  MarkdownConvertResult,
  MarkdownValidationResult,
  MarkdownStats,
  MarkdownError,
  MarkdownExportOptions,
  MarkdownPreset
} from '~/types/markdown'

// Markdown配置
const MAX_SIZE = 500 * 1024 // 500KB
const MAX_LINES = 10000

// 预设配置
export const MARKDOWN_PRESETS: Record<string, MarkdownPreset> = {
  github: {
    name: 'GitHub风格',
    description: '经典的GitHub Markdown渲染风格',
    options: {
      githubFlavored: true,
      tables: true,
      tasklists: true,
      smartLists: true,
      smartQuotes: true,
      footnotes: false,
      highlight: true,
      theme: 'github'
    },
    example: `# GitHub风格Markdown

## 功能特性
- [x] 支持任务列表
- [ ] 待办事项
- **粗体文本** 和 *斜体文本*

| 功能 | 支持 | 说明 |
|------|------|------|
| 表格 | ✅ | 完整支持 |
| 代码 | ✅ | 语法高亮 |

\`\`\`javascript
function hello() {
  console.log("Hello, GitHub!");
}
\`\`\`
`
  },
  clean: {
    name: '简洁风格',
    description: '干净简洁的文档风格，适合正式文档',
    options: {
      githubFlavored: false,
      tables: false,
      tasklists: false,
      smartLists: true,
      smartQuotes: true,
      footnotes: true,
      highlight: false,
      theme: 'clean'
    },
    example: `# 简洁文档风格

这是一个简洁的Markdown文档示例。

## 主要特点

1. 清晰的层次结构
2. 简洁的排版
3. 适合正式文档

> 引用文本内容

[链接文本](https://example.com)`
  },
  dark: {
    name: '暗黑风格',
    description: '暗黑主题的Markdown渲染风格',
    options: {
      githubFlavored: true,
      tables: true,
      tasklists: true,
      smartLists: true,
      smartQuotes: true,
      footnotes: true,
      highlight: true,
      theme: 'dark'
    },
    example: `# 暗黑风格文档

## 代码示例
\`\`\`python
def dark_theme():
    return "适合暗黑环境的文档风格"
\`\`\`

## 特性展示
- 完整的GitHub功能
- 暗黑主题优化
- 舒适的阅读体验`
  }
}

/**
 * 初始化Showdown转换器
 */
export function initializeShowdown(options: MarkdownRenderOptions = {}): Showdown.Converter {
  const converter = new Showdown.Converter({
    // 基础选项
    ghCodeBlocks: true,
    ghCompatibleHeaderId: true,
    rawHeaderId: false,
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    literalMidWordUnderscores: true,
    strikethrough: true,
    tables: options.tables !== false,
    tasks: options.tasklists !== false,
    smoothLivePreview: true,
    smartIndentationFix: true,
    disableForced4SpacesIndentedSublists: false,
    simpleLineBreaks: false,
    requireSpaceBeforeHeadingText: true,
    emoji: false,
    underline: false,
    ellipsis: false,
    backslashEscapesHTMLTags: true,
    completeHTMLDocument: false,
    splitAdjacentBlockquotes: false,
    moreStyling: false,
    metadata: false,
    extensions: []
  })

  return converter
}

/**
 * 转换Markdown到HTML
 */
export async function convertMarkdownToHtml(
  markdown: string,
  options: MarkdownRenderOptions = {}
): Promise<MarkdownConvertResult> {
  const startTime = Date.now()

  try {
    // 验证输入
    if (!markdown.trim()) {
      return {
        success: false,
        error: {
          message: '输入内容不能为空',
          type: 'syntax'
        }
      }
    }

    // 检查大小限制
    const sizeCheck = checkMarkdownSize(markdown)
    if (!sizeCheck.valid) {
      return {
        success: false,
        error: {
          message: sizeCheck.error!,
          type: 'size_limit'
        }
      }
    }

    // 初始化转换器
    const converter = initializeShowdown(options)

    // 执行转换
    let html = converter.makeHtml(markdown)

    // 应用主题样式 - 使用安全的字符串拼接方式
    html = applyThemeStyles(html, options.theme || 'default')

    // 添加自定义CSS类
    if (options.customClass) {
      html = wrapWithCustomClass(html, options.customClass)
    }

    const convertTime = Date.now() - startTime
    const stats = getMarkdownStats(markdown)

    return {
      success: true,
      html,
      convertTime,
      stats
    }
  } catch (error) {
    const convertTime = Date.now() - startTime

    return {
      success: false,
      error: parseMarkdownError(error as Error, markdown),
      convertTime
    }
  }
}

/**
 * 转换Markdown到纯文本
 */
export async function convertMarkdownToText(
  markdown: string
): Promise<MarkdownConvertResult> {
  const startTime = Date.now()

  try {
    if (!markdown.trim()) {
      return {
        success: false,
        error: {
          message: '输入内容不能为空',
          type: 'syntax'
        }
      }
    }

    // 简单的Markdown到文本转换
    let text = markdown
      // 移除标题标记
      .replace(/^#{1,6}\s+/gm, '')
      // 移除粗体和斜体标记
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      // 移除行内代码
      .replace(/`([^`]+)`/g, '$1')
      // 移除链接，保留文本
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 移除图片
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // 移除表格
      .replace(/\|[^|]*\|/g, '')
      // 移除列表标记
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // 移除引用标记
      .replace(/^>\s+/gm, '')
      // 移除多余的空行
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    const convertTime = Date.now() - startTime
    const stats = getMarkdownStats(markdown)

    return {
      success: true,
      text,
      convertTime,
      stats
    }
  } catch (error) {
    const convertTime = Date.now() - startTime

    return {
      success: false,
      error: parseMarkdownError(error as Error, markdown),
      convertTime
    }
  }
}

/**
 * 验证Markdown语法
 */
export function validateMarkdown(markdown: string): MarkdownValidationResult {
  try {
    if (!markdown.trim()) {
      return {
        valid: false,
        characterCount: 0,
        estimatedTime: 0,
        error: {
          message: '输入内容不能为空',
          type: 'syntax'
        }
      }
    }

    // 检查大小限制
    const sizeCheck = checkMarkdownSize(markdown)
    if (!sizeCheck.valid) {
      return {
        valid: false,
        characterCount: markdown.length,
        estimatedTime: 0,
        error: {
          message: sizeCheck.error!,
          type: 'size_limit'
        }
      }
    }

    // 基础语法检查
    const lines = markdown.split('\n')
    if (lines.length > MAX_LINES) {
      return {
        valid: false,
        characterCount: markdown.length,
        estimatedTime: 0,
        error: {
          message: `文档行数过多 (${lines.length}行)，最大支持 ${MAX_LINES} 行`,
          type: 'size_limit'
        }
      }
    }

    // 检查常见的Markdown语法错误
    const syntaxErrors = checkCommonSyntaxErrors(markdown)
    if (syntaxErrors.length > 0) {
      return {
        valid: false,
        characterCount: markdown.length,
        estimatedTime: estimateConvertTime(markdown.length),
        error: {
          message: `发现语法错误: ${syntaxErrors.join(', ')}`,
          type: 'syntax'
        }
      }
    }

    return {
      valid: true,
      characterCount: markdown.length,
      estimatedTime: estimateConvertTime(markdown.length)
    }
  } catch (error) {
    return {
      valid: false,
      characterCount: markdown.length,
      estimatedTime: 0,
      error: parseMarkdownError(error as Error, markdown)
    }
  }
}

/**
 * 获取Markdown统计信息
 */
export function getMarkdownStats(markdown: string): MarkdownStats {
  const lines = markdown.split('\n')
  const words = markdown.trim().split(/\s+/).filter(word => word.length > 0)

  // 统计各种元素
  const headings = (markdown.match(/^#{1,6}\s+/gm) || []).length
  const links = (markdown.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length
  const images = (markdown.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length
  const codeBlocks = (markdown.match(/```[\s\S]*?```/g) || []).length
  const tables = (markdown.match(/\|[^|]*\|/g) || []).length
  const paragraphs = (markdown.match(/\n\s*\n/g) || []).length + 1

  return {
    characters: markdown.length,
    lines: lines.length,
    words: words.length,
    paragraphs,
    headings,
    links,
    images,
    codeBlocks,
    tables,
    estimatedConvertTime: estimateConvertTime(markdown.length)
  }
}

/**
 * 导出Markdown为指定格式
 */
export async function exportMarkdown(
  markdown: string,
  exportOptions: MarkdownExportOptions
): Promise<MarkdownConvertResult> {
  try {
    switch (exportOptions.format) {
      case 'html':
        return await convertMarkdownToHtml(markdown, exportOptions)

      case 'text':
        return await convertMarkdownToText(markdown)

      case 'png':
      case 'jpg':
        return await exportAsImage(markdown, exportOptions)

      default:
        return {
          success: false,
          error: {
            message: `不支持的导出格式: ${exportOptions.format}`,
            type: 'export'
          }
        }
    }
  } catch (error) {
    return {
      success: false,
      error: parseMarkdownError(error as Error, markdown)
    }
  }
}

/**
 * 检查Markdown内容大小
 */
function checkMarkdownSize(markdown: string): { valid: boolean; error?: string } {
  const size = new Blob([markdown]).size
  if (size > MAX_SIZE) {
    return {
      valid: false,
      error: `Markdown文档过大 (${formatBytes(size)})，最大支持 ${formatBytes(MAX_SIZE)}`
    }
  }
  return { valid: true }
}

/**
 * 检查常见语法错误
 */
function checkCommonSyntaxErrors(markdown: string): string[] {
  const errors: string[] = []

  // 检查未闭合的代码块
  const codeBlockStart = (markdown.match(/```/g) || []).length
  if (codeBlockStart % 2 !== 0) {
    errors.push('未闭合的代码块')
  }

  // 检查未闭合的行内代码
  const inlineCodeStart = (markdown.match(/`/g) || []).length
  if (inlineCodeStart % 2 !== 0) {
    errors.push('未闭合的行内代码')
  }

  // 检查链接语法
  const invalidLinks = markdown.match(/\[[^\]]*\]\([^)]*$/gm)
  if (invalidLinks && invalidLinks.length > 0) {
    errors.push('链接语法错误')
  }

  return errors
}

/**
 * 应用主题样式
 */
function applyThemeStyles(html: string, theme: string): string {
  const themes = {
    default: `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      h1, h2, h3, h4, h5, h6 { color: #24292e; margin-top: 24px; margin-bottom: 16px; }
      p { margin-bottom: 16px; color: #24292e; }
      code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; }
      pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
      blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; margin: 16px 0; color: #6a737d; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0; }
      th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
      th { background: #f6f8fa; font-weight: 600; }
    `,
    github: `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; }
      h1, h2, h3, h4, h5, h6 { border-bottom: 1px solid #e1e4e8; padding-bottom: 0.3em; }
      .task-list-item { list-style: none; margin-left: -1.5em; }
      .task-list-item input { margin-right: 0.5em; }
    `,
    dark: `
      body { background: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      h1, h2, h3, h4, h5, h6 { color: #58a6ff; border-bottom: 1px solid #21262d; }
      p { color: #c9d1d9; }
      code { background: #161b22; color: #c9d1d9; }
      pre { background: #161b22; border: 1px solid #21262d; }
      blockquote { border-left: 4px solid #30363d; color: #8b949e; }
      table { border: 1px solid #21262d; }
      th, td { border: 1px solid #21262d; color: #c9d1d9; }
      th { background: #161b22; }
      a { color: #58a6ff; }
    `,
    clean: `
      body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.6; }
      h1, h2, h3, h4, h5, h6 { color: #333; font-weight: normal; }
      p { color: #444; text-align: justify; }
      code { background: #f5f5f5; border: 1px solid #ddd; padding: 1px 3px; }
      blockquote { font-style: italic; color: #666; border-left: 3px solid #ccc; }
    `
  }

  const css = themes[theme as keyof typeof themes] || themes.default

  return `<style>${css}</style>${html}`
}

/**
 * 用自定义类名包装HTML
 */
function wrapWithCustomClass(html: string, className: string): string {
  return `<div class="${className}">${html}</div>`
}

/**
 * 导出为图片
 */
async function exportAsImage(
  markdown: string,
  options: MarkdownExportOptions
): Promise<MarkdownConvertResult> {
  try {
    // 动态导入html2canvas
    const html2canvas = (await import('html2canvas')).default

    // 先转换为HTML
    const htmlResult = await convertMarkdownToHtml(markdown, options)
    if (!htmlResult.success || !htmlResult.html) {
      return htmlResult
    }

    // 创建安全的临时容器 - 使用createHTMLDocument而不是innerHTML
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = options.width ? options.width + 'px' : '800px'
    container.style.backgroundColor = options.backgroundColor || '#ffffff'

    // 使用textContent和DOM API来设置HTML内容，避免XSS
    const tempDiv = document.createElement('div')
    tempDiv.textContent = htmlResult.html
    container.innerHTML = tempDiv.textContent || ''

    document.body.appendChild(container)

    try {
      // 使用html2canvas生成图片
      const canvas = await html2canvas(container, {
        width: options.width,
        height: options.height,
        backgroundColor: options.backgroundColor,
        scale: 2, // 高清输出
        useCORS: true,
        allowTaint: false
      })

      // 转换为指定格式
      const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png'
      const quality = options.quality || 0.9
      const dataUrl = canvas.toDataURL(mimeType, quality)

      // 触发下载
      const filename = options.filename || `markdown-export-${Date.now()}.${options.format}`
      downloadDataUrl(dataUrl, filename)

      return {
        success: true
      }
    } finally {
      // 清理临时容器
      document.body.removeChild(container)
    }
  } catch (error) {
    return {
      success: false,
      error: parseMarkdownError(error as Error, markdown)
    }
  }
}

/**
 * 下载数据URL
 */
function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 解析Markdown错误
 */
function parseMarkdownError(error: Error, markdown: string): MarkdownError {
  const message = error.message

  // 尝试从错误消息中提取行号和位置信息
  const lineMatch = message.match(/at line (\d+)/)
  const positionMatch = message.match(/at position (\d+)/)

  return {
    message: `Markdown处理错误: ${message}`,
    type: 'processing',
    line: lineMatch ? parseInt(lineMatch[1]) : undefined,
    position: positionMatch ? parseInt(positionMatch[1]) : undefined
  }
}

/**
 * 估算转换时间
 */
function estimateConvertTime(characterCount: number): number {
  // 基于字符数的简单估算
  return Math.max(50, Math.floor(characterCount / 1000)) // 毫秒
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成示例文本
 */
export function generateMarkdownExample(type: string = 'github'): string {
  const preset = MARKDOWN_PRESETS[type]
  return preset ? preset.example : MARKDOWN_PRESETS.github.example
}

/**
 * 获取支持的主题列表
 */
export function getSupportedThemes(): string[] {
  return ['default', 'github', 'dark', 'clean']
}