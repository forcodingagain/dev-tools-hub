/**
 * Markdown导出格式
 */
export type MarkdownExportFormat = 'html' | 'png' | 'jpg' | 'text'

/**
 * Markdown渲染选项
 */
export interface MarkdownRenderOptions {
  /** 是否启用GitHub风格Markdown */
  githubFlavored?: boolean
  /** 是否启用表格解析 */
  tables?: boolean
  /** 是否启用任务列表 */
  tasklists?: boolean
  /** 是否启用智能列表 */
  smartLists?: boolean
  /** 是否启用智能引号 */
  smartQuotes?: boolean
  /** 是否启用脚注 */
  footnotes?: boolean
  /** 是否启用高亮 */
  highlight?: boolean
  /** 是否启用数学公式 */
  math?: boolean
  /** 自定义CSS类名 */
  customClass?: string
  /** 主题样式 */
  theme?: 'default' | 'github' | 'dark' | 'clean'
}

/**
 * Markdown转换结果
 */
export interface MarkdownConvertResult {
  /** 是否成功 */
  success: boolean
  /** HTML输出 */
  html?: string
  /** 纯文本输出 */
  text?: string
  /** 错误信息 */
  error?: MarkdownError
  /** 转换时间（毫秒） */
  convertTime?: number
  /** 字符统计 */
  stats?: MarkdownStats
}

/**
 * Markdown错误信息
 */
export interface MarkdownError {
  /** 错误消息 */
  message: string
  /** 错误类型 */
  type: 'syntax' | 'size_limit' | 'processing' | 'export' | 'unknown'
  /** 错误所在行数 */
  line?: number
  /** 错误所在列数 */
  column?: number
  /** 错误位置 */
  position?: number
}

/**
 * Markdown统计信息
 */
export interface MarkdownStats {
  /** 字符数 */
  characters: number
  /** 行数 */
  lines: number
  /** 单词数 */
  words: number
  /** 段落数 */
  paragraphs: number
  /** 标题数 */
  headings: number
  /** 链接数 */
  links: number
  /** 图片数 */
  images: number
  /** 代码块数 */
  codeBlocks: number
  /** 表格数 */
  tables: number
  /** 预估转换时间 */
  estimatedConvertTime: number
}

/**
 * Markdown工具状态
 */
export interface MarkdownToolState {
  /** 输入的Markdown文本 */
  input: string
  /** HTML输出 */
  htmlOutput: string
  /** 纯文本输出 */
  textOutput: string
  /** 是否正在处理 */
  processing: boolean
  /** 验证结果 */
  validation: MarkdownValidationResult
  /** 渲染选项 */
  options: MarkdownRenderOptions
  /** 错误信息 */
  error?: string
  /** 统计信息 */
  stats?: MarkdownStats
  /** 导出格式 */
  exportFormat: MarkdownExportFormat
  /** 转换历史 */
  history: MarkdownConversionHistory[]
}

/**
 * Markdown验证结果
 */
export interface MarkdownValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  error?: MarkdownError
  /** 字符数 */
  characterCount: number
  /** 预估处理时间 */
  estimatedTime: number
}

/**
 * 转换历史记录
 */
export interface MarkdownConversionHistory {
  /** 时间戳 */
  timestamp: number
  /** 输入长度 */
  inputLength: number
  /** 转换格式 */
  format: MarkdownExportFormat
  /** 转换时间 */
  convertTime: number
  /** 是否成功 */
  success: boolean
}

/**
 * Markdown工具动作类型
 */
export type MarkdownToolAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_HTML_OUTPUT'; payload: string }
  | { type: 'SET_TEXT_OUTPUT'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_VALIDATION'; payload: MarkdownValidationResult }
  | { type: 'SET_OPTIONS'; payload: Partial<MarkdownRenderOptions> }
  | { type: 'SET_EXPORT_FORMAT'; payload: MarkdownExportFormat }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SET_STATS'; payload?: MarkdownStats }
  | { type: 'ADD_HISTORY'; payload: MarkdownConversionHistory }
  | { type: 'CONVERT_MARKDOWN' }
  | { type: 'EXPORT_HTML' }
  | { type: 'EXPORT_IMAGE' }
  | { type: 'EXPORT_TEXT' }
  | { type: 'COPY_HTML' }
  | { type: 'COPY_TEXT' }
  | { type: 'RESET' }

/**
 * 导出选项
 */
export interface MarkdownExportOptions {
  /** 格式 */
  format: MarkdownExportFormat
  /** 文件名 */
  filename?: string
  /** 图片宽度（针对图片导出） */
  width?: number
  /** 图片高度（针对图片导出） */
  height?: number
  /** 图片质量（针对JPG导出） */
  quality?: number
  /** 背景（针对图片导出） */
  backgroundColor?: string
  /** 是否包含样式 */
  includeStyles?: boolean
  /** 自定义CSS */
  customCSS?: string
}

/**
 * Markdown预设配置
 */
export interface MarkdownPreset {
  /** 名称 */
  name: string
  /** 描述 */
  description: string
  /** 选项 */
  options: MarkdownRenderOptions
  /** 示例文本 */
  example: string
}

/**
 * 支持的Markdown扩展
 */
export interface MarkdownExtensions {
  /** GitHub风格Markdown */
  githubFlavored: boolean
  /** 表格支持 */
  tables: boolean
  /** 任务列表 */
  tasklists: boolean
  /** 脚注 */
  footnotes: boolean
  /** 高亮语法 */
  highlight: boolean
  /** 数学公式 */
  math: boolean
  /** 目录生成 */
  toc: boolean
  /** 自定义容器 */
  containers: boolean
}