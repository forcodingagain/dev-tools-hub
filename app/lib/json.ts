import type { JsonFormatterOptions, ValidationResult, FormatResult } from "~/types/json"

/**
 * 格式化JSON字符串
 */
export function formatJson(input: string, options: JsonFormatterOptions = {}): FormatResult {
  const {
    indent = 2,
    sortKeys = false,
    validateOnly = false
  } = options

  try {
    // 验证输入是否为空
    if (!input.trim()) {
      return {
        success: false,
        error: {
          message: '输入内容不能为空',
          line: 0,
          column: 0,
          position: 0
        },
        formatted: ''
      }
    }

    // 解析JSON
    const parsed = JSON.parse(input)

    // 如果只是验证，返回成功
    if (validateOnly) {
      return {
        success: true,
        formatted: ''
      }
    }

    // 处理对象键排序
    let processed = parsed
    if (sortKeys && typeof processed === 'object' && processed !== null) {
      processed = sortObjectKeys(processed)
    }

    // 格式化JSON
    const formatted = JSON.stringify(processed, null, indent)

    return {
      success: true,
      formatted,
      size: new Blob([formatted]).size
    }
  } catch (error) {
    return parseJsonError(error as Error, input)
  }
}

/**
 * 验证JSON语法
 */
export function validateJson(input: string): ValidationResult {
  const result = formatJson(input, { validateOnly: true })

  if (result.success) {
    return {
      valid: true
    }
  }

  return {
    valid: false,
    error: result.error!
  }
}

/**
 * 压缩JSON（移除空格）
 */
export function minifyJson(input: string): FormatResult {
  try {
    if (!input.trim()) {
      return {
        success: false,
        error: {
          message: '输入内容不能为空',
          line: 0,
          column: 0,
          position: 0
        },
        formatted: ''
      }
    }

    const parsed = JSON.parse(input)
    const minified = JSON.stringify(parsed)

    return {
      success: true,
      formatted: minified,
      size: new Blob([minified]).size
    }
  } catch (error) {
    return parseJsonError(error as Error, input)
  }
}

/**
 * 检查JSON大小
 */
export function checkJsonSize(input: string, maxSize: number = 5 * 1024 * 1024): {
  valid: boolean
  size: number
  error?: string
} {
  const size = new Blob([input]).size

  if (size > maxSize) {
    return {
      valid: false,
      size,
      error: `JSON数据过大 (${formatBytes(size)})，最大支持 ${formatBytes(maxSize)}`
    }
  }

  return {
    valid: true,
    size
  }
}

/**
 * 递归排序对象键
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }

  if (obj !== null && typeof obj === 'object') {
    const sorted: any = {}
    const keys = Object.keys(obj).sort()

    for (const key of keys) {
      sorted[key] = sortObjectKeys(obj[key])
    }

    return sorted
  }

  return obj
}

/**
 * 解析JSON错误信息
 */
function parseJsonError(error: Error, input: string): FormatResult {
  const message = error.message
  const errorMatch = message.match(/Expected (.*) but (.*) found instead at position (\d+)/) ||
                     message.match(/Unexpected token (.*) in JSON at position (\d+)/) ||
                     message.match(/Unexpected end of JSON input at position (\d+)/)

  if (errorMatch) {
    const position = parseInt(errorMatch[2] || errorMatch[1] || '0')
    const { line, column } = getLineColumnFromPosition(input, position)

    return {
      success: false,
      error: {
        message: message.replace(/position \d+/, `position ${position} (line ${line}, column ${column})`),
        line,
        column,
        position
      },
      formatted: ''
    }
  }

  // 通用错误处理
  return {
    success: false,
    error: {
      message: `JSON解析错误: ${message}`,
      line: 0,
      column: 0,
      position: 0
    },
    formatted: ''
  }
}

/**
 * 根据位置获取行列信息
 */
function getLineColumnFromPosition(text: string, position: number): { line: number; column: number } {
  const lines = text.substring(0, position).split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  }
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
 * 获取JSON统计信息
 */
export function getJsonStats(input: string): {
  valid: boolean
  stats?: {
    characters: number
    lines: number
    size: number
    keys?: number
    depth?: number
  }
  error?: string
} {
  try {
    if (!input.trim()) {
      return {
        valid: false,
        error: '输入内容不能为空'
      }
    }

    const parsed = JSON.parse(input)
    const stats = {
      characters: input.length,
      lines: input.split('\n').length,
      size: new Blob([input]).size,
      keys: countKeys(parsed),
      depth: getObjectDepth(parsed)
    }

    return {
      valid: true,
      stats
    }
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message
    }
  }
}

/**
 * 计算对象中的键数量
 */
function countKeys(obj: any): number {
  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + countKeys(item), 0)
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((sum, key) => {
      return sum + 1 + countKeys(obj[key])
    }, 0)
  }

  return 0
}

/**
 * 获取对象深度
 */
function getObjectDepth(obj: any): number {
  if (Array.isArray(obj)) {
    return obj.length === 0 ? 1 : 1 + Math.max(...obj.map(getObjectDepth))
  }

  if (obj !== null && typeof obj === 'object') {
    const values = Object.values(obj)
    return values.length === 0 ? 1 : 1 + Math.max(...values.map(getObjectDepth))
  }

  return 0
}