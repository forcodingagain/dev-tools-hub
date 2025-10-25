/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * 创建可取消的防抖函数
 */
export function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  debounced: (...args: Parameters<T>) => void
  cancel: () => void
  flush: () => void
} {
  let timeout: NodeJS.Timeout | null = null

  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      func()
    }
  }

  return { debounced, cancel, flush }
}

/**
 * 防抖hook（用于React组件）
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  deps: React.DependencyList,
  wait: number
): T {
  // 这里将在React组件中使用，暂时返回原函数
  // 实际使用时会在组件中使用useCallback和useEffect
  return func
}