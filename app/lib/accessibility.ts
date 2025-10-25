/**
 * 可访问性工具库
 * 提供键盘导航、屏幕阅读器支持、焦点管理等可访问性功能
 */

// 键盘导航常量
export const KEYBOARD = {
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
}

// ARIA标签常量
export const ARIA_LABELS = {
  JSON_INPUT: 'JSON输入区域',
  JSON_OUTPUT: 'JSON输出区域',
  FORMAT_BUTTON: '格式化JSON',
  MINIFY_BUTTON: '压缩JSON',
  CLEAR_BUTTON: '清空内容',
  COPY_BUTTON: '复制到剪贴板',
  INDENT_SELECT: '缩进设置',
  SORT_KEYS_CHECKBOX: '按键排序选项'
}

// 焦点管理器类
export class FocusManager {
  private focusableElements: HTMLElement[] = []
  private currentIndex: number = 0

  /**
   * 获取容器内所有可聚焦元素
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        // 过滤掉隐藏的元素
        const style = window.getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
  }

  /**
   * 将焦点设置到第一个可聚焦元素
   */
  focusFirst(container: HTMLElement): void {
    const elements = this.getFocusableElements(container)
    if (elements.length > 0) {
      elements[0].focus()
      this.currentIndex = 0
    }
  }

  /**
   * 将焦点设置到最后一个可聚焦元素
   */
  focusLast(container: HTMLElement): void {
    const elements = this.getFocusableElements(container)
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
      this.currentIndex = elements.length - 1
    }
  }

  /**
   * 移动焦点到下一个元素
   */
  focusNext(container: HTMLElement): boolean {
    const elements = this.getFocusableElements(container)
    if (elements.length === 0) return false

    this.currentIndex = (this.currentIndex + 1) % elements.length
    elements[this.currentIndex].focus()
    return true
  }

  /**
   * 移动焦点到上一个元素
   */
  focusPrevious(container: HTMLElement): boolean {
    const elements = this.getFocusableElements(container)
    if (elements.length === 0) return false

    this.currentIndex = this.currentIndex === 0 ? elements.length - 1 : this.currentIndex - 1
    elements[this.currentIndex].focus()
    return true
  }

  /**
   * 陷阱焦点在指定容器内
   */
  trapFocus(container: HTMLElement): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD.TAB) {
        const elements = this.getFocusableElements(container)
        if (elements.length === 0) return

        const firstElement = elements[0]
        const lastElement = elements[elements.length - 1]

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // 返回清理函数
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }
}

// 屏幕阅读器管理器类
export class ScreenReaderManager {
  private liveRegion: HTMLElement | null = null

  constructor() {
    this.createLiveRegion()
  }

  /**
   * 创建屏幕阅读器实时区域
   */
  private createLiveRegion(): void {
    if (typeof document === 'undefined') return

    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.className = 'sr-only'
    document.body.appendChild(this.liveRegion)
  }

  /**
   * 向屏幕阅读器宣布消息
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return

    this.liveRegion.setAttribute('aria-live', priority)
    this.liveRegion.textContent = message

    // 清除消息以便下次使用
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = ''
      }
    }, 1000)
  }

  /**
   * 宣布错误消息
   */
  announceError(message: string): void {
    this.announce(`错误: ${message}`, 'assertive')
  }

  /**
   * 宣布成功消息
   */
  announceSuccess(message: string): void {
    this.announce(`成功: ${message}`, 'polite')
  }

  /**
   * 宣布加载状态
   */
  announceLoading(message: string): void {
    this.announce(`加载中: ${message}`, 'polite')
  }

  /**
   * 宣布状态变化
   */
  announceStatus(message: string): void {
    this.announce(message, 'polite')
  }
}

// 创建全局实例
export const focusManager = new FocusManager()
export const screenReaderManager = new ScreenReaderManager()

// 工具函数
export const accessibilityUtils = {
  /**
   * 检查是否为键盘用户
   */
  isKeyboardUser(): boolean {
    if (typeof window === 'undefined') return false

    // 检查用户是否在使用键盘导航
    let keyboardUser = false

    const handleKeyDown = () => {
      keyboardUser = true
    }

    const handleMouseDown = () => {
      keyboardUser = false
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      return keyboardUser
    }
  },

  /**
   * 生成唯一ID
   */
  generateId(prefix: string = 'acc'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * 检查元素是否在视口中
   */
  isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },

  /**
   * 滚动元素到视口中
   */
  scrollIntoView(element: HTMLElement, options: ScrollIntoViewOptions = {}): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options
    })
  },

  /**
   * 设置元素的ARIA属性
   */
  setAriaAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(`aria-${key}`, value)
    })
  },

  /**
   * 移除元素的ARIA属性
   */
  removeAriaAttributes(element: HTMLElement, attributes: string[]): void {
    attributes.forEach(attribute => {
      element.removeAttribute(`aria-${attribute}`)
    })
  }
}

// 键盘导航辅助函数
export const keyboardNavigation = {
  /**
   * 处理Tab键导航
   */
  handleTabNavigation(event: KeyboardEvent, container: HTMLElement): void {
    if (event.key !== KEYBOARD.TAB) return

    const focusableElements = focusManager.getFocusableElements(container)
    if (focusableElements.length === 0) return

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    let nextIndex: number

    if (event.shiftKey) {
      // Shift + Tab
      nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
    } else {
      // Tab
      nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
    }

    event.preventDefault()
    focusableElements[nextIndex].focus()
  },

  /**
   * 处理方向键导航
   */
  handleArrowNavigation(event: KeyboardEvent, container: HTMLElement, orientation: 'horizontal' | 'vertical' = 'vertical'): void {
    const arrowKeys = orientation === 'vertical'
      ? [KEYBOARD.ARROW_UP, KEYBOARD.ARROW_DOWN]
      : [KEYBOARD.ARROW_LEFT, KEYBOARD.ARROW_RIGHT]

    if (!arrowKeys.includes(event.key)) return

    const focusableElements = focusManager.getFocusableElements(container)
    if (focusableElements.length === 0) return

    event.preventDefault()

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    const direction = event.key === KEYBOARD.ARROW_UP || event.key === KEYBOARD.ARROW_LEFT ? -1 : 1
    const nextIndex = Math.max(0, Math.min(focusableElements.length - 1, currentIndex + direction))

    focusableElements[nextIndex].focus()
  }
}

// 高对比度模式检测
export const detectHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false

  // 检查是否启用了高对比度模式
  return window.matchMedia('(prefers-contrast: high)').matches
}

// 减少动画模式检测
export const detectReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}