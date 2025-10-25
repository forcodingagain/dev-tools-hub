/**
 * JSON格式化选项
 */
export interface JsonFormatterOptions {
  /** 缩进空格数，默认2 */
  indent?: number
  /** 是否排序对象键，默认false */
  sortKeys?: boolean
  /** 是否只验证不格式化，默认false */
  validateOnly?: boolean
}

/**
 * JSON验证错误信息
 */
export interface JsonError {
  /** 错误消息 */
  message: string
  /** 错误所在行数 */
  line: number
  /** 错误所在列数 */
  column: number
  /** 错误所在位置（字符索引） */
  position: number
}

/**
 * JSON格式化结果
 */
export interface FormatResult {
  /** 是否成功 */
  success: boolean
  /** 格式化后的JSON字符串 */
  formatted?: string
  /** 文件大小（字节） */
  size?: number
  /** 错误信息 */
  error?: JsonError
}

/**
 * JSON验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  error?: JsonError
}

/**
 * JSON工具状态
 */
export interface JsonToolState {
  /** 输入的JSON字符串 */
  input: string
  /** 格式化结果 */
  output: string
  /** 是否正在处理 */
  processing: boolean
  /** 验证结果 */
  validation: ValidationResult
  /** 格式化选项 */
  options: JsonFormatterOptions
  /** 错误信息 */
  error?: string
  /** 统计信息 */
  stats?: {
    characters: number
    lines: number
    size: number
    keys?: number
    depth?: number
  }
}

/**
 * JSON统计信息
 */
export interface JsonStats {
  /** 字符数 */
  characters: number
  /** 行数 */
  lines: number
  /** 文件大小（字节） */
  size: number
  /** 键的数量 */
  keys?: number
  /** 对象深度 */
  depth?: number
}

/**
 * 复制到剪贴板结果
 */
export interface CopyResult {
  /** 是否成功 */
  success: boolean
  /** 消息 */
  message: string
}

/**
 * JSON工具动作类型
 */
export type JsonToolAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_OUTPUT'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_VALIDATION'; payload: ValidationResult }
  | { type: 'SET_OPTIONS'; payload: Partial<JsonFormatterOptions> }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SET_STATS'; payload?: JsonStats }
  | { type: 'FORMAT_JSON' }
  | { type: 'VALIDATE_JSON' }
  | { type: 'MINIFY_JSON' }
  | { type: 'COPY_TO_CLIPBOARD' }
  | { type: 'RESET' }