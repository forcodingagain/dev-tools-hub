import type { CopyResult } from "~/types/json"

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  try {
    // 检查是否支持Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return {
        success: true,
        message: '已复制到剪贴板'
      }
    }

    // 降级到传统方法
    return fallbackCopyToClipboard(text)
  } catch (error) {
    return {
      success: false,
      message: `复制失败: ${(error as Error).message}`
    }
  }
}

/**
 * 降级的复制方法（使用document.execCommand）
 */
function fallbackCopyToClipboard(text: string): CopyResult {
  try {
    // 创建临时textarea元素
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-999999px'
    textarea.style.top = '-999999px'
    document.body.appendChild(textarea)

    // 选择并复制
    textarea.focus()
    textarea.select()
    const successful = document.execCommand('copy')

    // 清理
    document.body.removeChild(textarea)

    if (successful) {
      return {
        success: true,
        message: '已复制到剪贴板'
      }
    } else {
      return {
        success: false,
        message: '复制失败，请手动选择并复制'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `复制失败: ${(error as Error).message}`
    }
  }
}

/**
 * 检查是否支持复制到剪贴板
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && window.isSecureContext) ||
         !!(document.queryCommandSupported && document.queryCommandSupported('copy'))
}

/**
 * 读取剪贴板内容
 */
export async function readFromClipboard(): Promise<string> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      return await navigator.clipboard.readText()
    }
    throw new Error('当前环境不支持读取剪贴板')
  } catch (error) {
    throw new Error(`读取剪贴板失败: ${(error as Error).message}`)
  }
}