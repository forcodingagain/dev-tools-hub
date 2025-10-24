import { ToolConfig } from '~/types'

export const TOOLS: ToolConfig[] = [
  {
    id: 'json',
    name: 'JSON在线工具',
    description: '格式化和验证JSON数据，支持语法高亮显示和错误提示',
    icon: 'json',
    path: '/json',
    color: 'blue'
  },
  {
    id: 'mermaid',
    name: 'Mermaid在线工具',
    description: '绘制流程图、时序图、类图等多种图表类型，实时预览和导出',
    icon: 'chart',
    path: '/mermaid',
    color: 'green'
  },
  {
    id: 'markdown',
    name: 'Markdown在线工具',
    description: '实时预览Markdown文档，支持转换为HTML、图片、TXT格式',
    icon: 'document',
    path: '/markdown',
    color: 'purple'
  }
]

export const JSON_LIMITS = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024
}

export const MERMAID_LIMITS = {
  MAX_NODES: 200
}

export const MARKDOWN_LIMITS = {
  MAX_SIZE_KB: 500,
  MAX_SIZE_BYTES: 500 * 1024
}

export const PERFORMANCE_TARGETS = {
  COLD_START_MS: 2000,
  JSON_FORMAT_SMALL_MS: 1000,
  JSON_FORMAT_LARGE_MS: 3000,
  MERMAID_RENDER_SMALL_MS: 1000,
  MERMAID_RENDER_LARGE_MS: 5000,
  MARKDOWN_PREVIEW_MS: 1000,
  MARKDOWN_EXPORT_SLOW_MS: 5000
}