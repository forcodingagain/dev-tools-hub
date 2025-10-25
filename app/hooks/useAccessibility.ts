/**
 * 可访问性Hook
 */

import { useEffect, useRef, useCallback } from 'react'
import { focusManager, screenReaderManager, KEYBOARD, ARIA_LABELS } from '~/lib/accessibility'

// 键盘导航Hook选项
interface UseKeyboardNavigationOptions {
  /** 是否启用Tab导航 */
  enableTabNavigation?: boolean
  /** 是否启用箭头键导航 */
  enableArrowNavigation?: boolean
  /** 是否启用Home/End导航 */
  enableHomeEndNavigation?: boolean
  /** 是否启用Enter/Space激活 */
  enableEnterSpaceActivation?: boolean
  /** 导航元素的CSS选择器 */
  navigationSelector?: string
  /** 激活回调 */
  onActivate?: (element: HTMLElement) => void
  /** 焦点回调 */
  onFocus?: (element: HTMLElement) => void
}

// 焦点管理Hook选项
interface UseFocusManagementOptions {
  /** 是否自动恢复焦点 */
  autoRestore?: boolean
  /** 是否启用焦点陷阱 */
  trapFocus?: boolean
  /** 焦点陷阱容器 */
  trapContainer?: HTMLElement | null
  /** 初始聚焦元素 */
  initialFocus?: HTMLElement | null
}

// 屏幕阅读器通知Hook选项
interface UseScreenReaderOptions {
  /** 是否自动通知状态变化 */
  autoNotify?: boolean
  /** 通知优先级 */
  priority?: 'polite' | 'assertive'
  /** 自定义通知容器 */
  customContainer?: HTMLElement | null
}

/**
 * 键盘导航Hook
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const containerRef = useRef<HTMLElement>(null)
  const {
    enableTabNavigation = true,
    enableArrowNavigation = true,
    enableHomeEndNavigation = true,
    enableEnterSpaceActivation = true,
    navigationSelector = '[tabindex]:not([tabindex="-1"]), button, a, input, select, textarea',
    onActivate,
    onFocus
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return

    const target = event.target as HTMLElement
    const focusableElements = Array.from(containerRef.current.querySelectorAll(navigationSelector)) as HTMLElement[]
    const currentIndex = focusableElements.indexOf(target)

    let nextElement: HTMLElement | null = null

    switch (event.key) {
      case KEYBOARD.TAB:
        if (!enableTabNavigation) return
        // Tab导航由浏览器处理，我们只需要确保焦点在容器内
        break

      case KEYBOARD.ARROW_DOWN:
      case KEYBOARD.ARROW_RIGHT:
        if (!enableArrowNavigation) return
        event.preventDefault()
        nextElement = focusableElements[currentIndex + 1] || focusableElements[0]
        break

      case KEYBOARD.ARROW_UP:
      case KEYBOARD.ARROW_LEFT:
        if (!enableArrowNavigation) return
        event.preventDefault()
        nextElement = focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1]
        break

      case KEYBOARD.HOME:
        if (!enableHomeEndNavigation) return
        event.preventDefault()
        nextElement = focusableElements[0]
        break

      case KEYBOARD.END:
        if (!enableHomeEndNavigation) return
        event.preventDefault()
        nextElement = focusableElements[focusableElements.length - 1]
        break

      case KEYBOARD.ENTER:
      case KEYBOARD.SPACE:
        if (!enableEnterSpaceActivation) return
        event.preventDefault()
        onActivate?.(target)
        return

      default:
        return
    }

    if (nextElement) {
      nextElement.focus()
      onFocus?.(nextElement)
    }
  }, [enableTabNavigation, enableArrowNavigation, enableHomeEndNavigation, enableEnterSpaceActivation, navigationSelector, onActivate, onFocus])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return { containerRef }
}

/**
 * 焦点管理Hook
 */
export function useFocusManagement(options: UseFocusManagementOptions = {}) {
  const containerRef = useRef<HTMLElement>(null)
  const {
    autoRestore = true,
    trapFocus = false,
    trapContainer: trapContainerProp,
    initialFocus
  } = options

  useEffect(() => {
    if (autoRestore) {
      focusManager.saveFocus()
    }

    const container = trapContainerProp || containerRef.current
    let cleanup: (() => void) | null = null

    if (trap && container) {
      cleanup = focusManager.trapFocus(container)
    }

    // 设置初始焦点
    if (initialFocus) {
      setTimeout(() => initialFocus.focus(), 0)
    }

    return () => {
      if (autoRestore) {
        focusManager.restoreFocus()
      }
      cleanup?.()
    }
  }, [autoRestore, trap, trapContainerProp, initialFocus])

  return { containerRef }
}

/**
 * 屏幕阅读器通知Hook
 */
export function useScreenReader(options: UseScreenReaderOptions = {}) {
  const {
    autoNotify = true,
    priority = 'polite',
    customContainer
  } = options

  const announce = useCallback((message: string) => {
    screenReaderManager.announce(message, priority)
  }, [priority])

  const announceError = useCallback((message: string) => {
    screenReaderManager.announce(`错误: ${message}`, 'assertive')
  }, [])

  const announceSuccess = useCallback((message: string) => {
    screenReaderManager.announce(`成功: ${message}`, 'polite')
  }, [])

  const announceLoading = useCallback((message: string = '加载中') => {
    screenReaderManager.announce(message, 'polite')
  }, [])

  const clearAnnouncements = useCallback(() => {
    screenReaderManager.clearAnnouncements()
  }, [])

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading,
    clearAnnouncements
  }
}

/**
 * ARIA标签Hook
 */
export function useAriaLabels() {
  const generateLabel = useCallback((baseLabel: string, suffix?: string): string => {
    return suffix ? `${baseLabel} - ${suffix}` : baseLabel
  }, [])

  const createLabelledBy = useCallback((elements: string[]): string => {
    return elements.join(' ')
  }, [])

  const createDescribedBy = useCallback((elements: string[]): string => {
    return elements.join(' ')
  }, [])

  return {
    generateLabel,
    createLabelledBy,
    createDescribedBy,
    labels: ARIA_LABELS
  }
}

/**
 * 颜色对比度检查Hook
 */
export function useColorContrast() {
  const checkContrast = useCallback((foreground: string, background: string): { ratio: number; compliant: boolean } => {
    // 简化的对比度计算
    const getLuminance = (color: string): number => {
      // 移除#号
      const hex = color.replace('#', '')

      // 转换为RGB
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255

      // 计算相对亮度
      const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
      const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
      const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

      return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    const ratio = (lighter + 0.05) / (darker + 0.05)
    const compliant = ratio >= 4.5 // WCAG AA标准

    return { ratio, compliant }
  }, [])

  return { checkContrast }
}

/**
 * 跳过链接Hook
 */
export function useSkipLink() {
  const skipLinkId = 'skip-to-main-content'

  useEffect(() => {
    // 检查是否已存在跳过链接
    let skipLink = document.getElementById(skipLinkId) as HTMLAnchorElement

    if (!skipLink) {
      // 创建跳过链接
      skipLink = document.createElement('a')
      skipLink.id = skipLinkId
      skipLink.href = '#main-content'
      skipLink.textContent = '跳转到主要内容'
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50'
      skipLink.setAttribute('aria-label', ARIA_LABELS.SKIP_TO_CONTENT)

      // 插入到页面最前面
      document.body.insertBefore(skipLink, document.body.firstChild)
    }

    return () => {
      // 清理跳过链接
      if (skipLink && skipLink.parentNode === document.body) {
        document.body.removeChild(skipLink)
      }
    }
  }, [])

  return { skipLinkId }
}

/**
 * 自动公告Hook
 */
export function useAutoAnnouncement(value: any, options: {
  formatter?: (value: any) => string
  enabled?: boolean
  priority?: 'polite' | 'assertive'
} = {}) {
  const { formatter, enabled = true, priority = 'polite' } = options
  const { announce } = useScreenReader({ priority })

  useEffect(() => {
    if (!enabled) return

    const message = formatter ? formatter(value) : String(value)
    if (message) {
      announce(message)
    }
  }, [value, formatter, enabled, announce])
}

/**
 * 可访问性表单Hook
 */
export function useAccessibleForm() {
  const generateFieldId = useCallback((fieldName: string): string => {
    return `${field}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const generateErrorId = useCallback((fieldName: string): string => {
    return `${field}-error-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const createFieldProps = useCallback((fieldName: string, options: {
    required?: boolean
    invalid?: boolean
    describedBy?: string
  } = {}) => {
    const fieldId = generateFieldId(fieldName)
    const errorId = generateErrorId(fieldName)

    const props: Record<string, string | boolean> = {
      id: fieldId,
      'aria-invalid': options.invalid || false,
      'aria-required': options.required || false
    }

    if (options.describedBy) {
      props['aria-describedby'] = options.describedBy
    } else if (options.invalid) {
      props['aria-describedby'] = errorId
    }

    return { fieldId, errorId, props }
  }, [generateFieldId, generateErrorId])

  return {
    generateFieldId,
    generateErrorId,
    createFieldProps
  }
}