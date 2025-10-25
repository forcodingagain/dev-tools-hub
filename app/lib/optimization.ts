/**
 * 性能优化工具类
 */

export class PerformanceOptimizer {
  /**
   * 防抖函数
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }

      const callNow = immediate && !timeout

      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)

      if (callNow) func(...args)
    }
  }

  /**
   * 节流函数
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean

    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }

  /**
   * 批处理函数
   */
  static batch<T>(items: T[], batchSize: number, processor: (batch: T[]) => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      let index = 0

      const processBatch = async () => {
        try {
          const batch = items.slice(index, index + batchSize)
          if (batch.length === 0) {
            resolve()
            return
          }

          await processor(batch)
          index += batchSize

          // 使用 setTimeout 避免阻塞主线程
          setTimeout(processBatch, 0)
        } catch (error) {
          reject(error)
        }
      }

      processBatch()
    })
  }

  /**
   * 缓存装饰器
   */
  static memoize<T extends (...args: any[]) => any>(func: T, keyGenerator?: (...args: Parameters<T>) => string): T {
    const cache = new Map<string, ReturnType<T>>()

    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

      if (cache.has(key)) {
        return cache.get(key)!
      }

      const result = func(...args)
      cache.set(key, result)
      return result
    }) as T
  }

  /**
   * 优化的图片加载
   */
  static lazyLoadImage(image: HTMLImageElement, src: string, placeholder?: string): void {
    if (placeholder) {
      image.src = placeholder
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              img.src = src
              observer.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px 0px'
        }
      )

      observer.observe(image)
    } else {
      // 降级方案
      image.src = src
    }
  }

  /**
   * Web Worker 包装器
   */
  static async runInWorker<T, R>(
    workerCode: string,
    data: T,
    transferables?: Transferable[]
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const worker = new Worker(URL.createObjectURL(blob))

      worker.onmessage = (event) => {
        resolve(event.data)
        worker.terminate()
        URL.revokeObjectURL(blob as any)
      }

      worker.onerror = (error) => {
        reject(error)
        worker.terminate()
        URL.revokeObjectURL(blob as any)
      }

      worker.postMessage(data, transferables || [])
    })
  }

  /**
   * 大文件分块处理
   */
  static async processLargeFile<T>(
    file: File,
    chunkSize: number,
    processor: (chunk: ArrayBuffer, chunkIndex: number) => Promise<T>
  ): Promise<T[]> {
    const chunks: T[] = []
    const totalChunks = Math.ceil(file.size / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const arrayBuffer = await chunk.arrayBuffer()
      const result = await processor(arrayBuffer, i)
      chunks.push(result)

      // 让出主线程，避免阻塞UI
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    return chunks
  }

  /**
   * DOM 操作批处理
   */
  static batchDOMUpdates(updates: (() => void)[]): void {
    // 使用 requestAnimationFrame 批处理DOM更新
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  }

  /**
   * 内存优化清理
   */
  static cleanup(): void {
    // 清理定时器
    const maxId = setTimeout(() => {}, 0)
    for (let i = 1; i <= maxId; i++) {
      clearTimeout(i)
      clearInterval(i)
    }

    // 强制垃圾回收（如果可用）
    if ('gc' in window) {
      (window as any).gc()
    }
  }

  /**
   * 资源预加载
   */
  static preloadResources(resources: string[]): Promise<void[]> {
    const promises = resources.map(resource => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource

        // 根据文件扩展名设置 as 属性
        const extension = resource.split('.').pop()?.toLowerCase()
        switch (extension) {
          case 'js':
            link.as = 'script'
            break
          case 'css':
            link.as = 'style'
            break
          case 'woff':
          case 'woff2':
            link.as = 'font'
            link.crossOrigin = 'anonymous'
            break
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'webp':
            link.as = 'image'
            break
          default:
            link.as = 'fetch'
        }

        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to preload: ${resource}`))

        document.head.appendChild(link)
      })
    })

    return Promise.all(promises)
  }

  /**
   * 代码分割懒加载
   */
  static async lazyLoad<T>(moduleLoader: () => Promise<T>): Promise<T> {
    try {
      // 检查是否已经加载
      const module = await moduleLoader()
      return module
    } catch (error) {
      console.error('Module loading failed:', error)
      throw error
    }
  }

  /**
   * 虚拟滚动优化（安全的DOM操作）
   */
  static createVirtualScrollRenderer<T>(
    items: T[],
    renderItem: (item: T, index: number) => HTMLElement,
    containerHeight: number,
    itemHeight: number
  ): {
    render: (scrollTop: number) => void
    destroy: () => void
  } {
    const container = document.createElement('div')
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 1
    let startIndex = 0

    const render = (scrollTop: number) => {
      startIndex = Math.floor(scrollTop / itemHeight)
      const endIndex = Math.min(startIndex + visibleCount, items.length)

      // 安全地清空容器
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      // 渲染可见项
      for (let i = startIndex; i < endIndex; i++) {
        const element = renderItem(items[i], i)
        element.style.position = 'absolute'
        element.style.top = `${i * itemHeight}px`
        element.style.width = '100%'
        container.appendChild(element)
      }
    }

    return {
      render,
      destroy: () => {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
    }
  }
}

/**
 * 性能监控装饰器工厂
 */
export function createPerformanceMonitorDecorator(thresholdMs: number = 100) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: Parameters<T>) {
      const startTime = performance.now()

      try {
        const result = await method.apply(this, args)
        const duration = performance.now() - startTime

        if (duration > thresholdMs) {
          console.warn(`Slow operation detected: ${propertyName} took ${duration.toFixed(2)}ms`)
        }

        return result
      } catch (error) {
        const duration = performance.now() - startTime
        console.error(`Operation failed: ${propertyName} after ${duration.toFixed(2)}ms`, error)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 优化的数据结构操作
 */
export class OptimizedDataStructures {
  /**
   * 高效的去重
   */
  static unique<T>(array: T[], keyFn?: (item: T) => string): T[] {
    if (!keyFn) {
      return Array.from(new Set(array))
    }

    const seen = new Set<string>()
    return array.filter(item => {
      const key = keyFn(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  /**
   * 高效的分组
   */
  static groupBy<T, K extends string | number | symbol>(
    array: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {} as Record<K, T[]>)
  }

  /**
   * 高效的排序
   */
  static sortBy<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
    return [...array].sort(compareFn)
  }

  /**
   * 高效的查找
   */
  static binarySearch<T>(
    sortedArray: T[],
    target: T,
    compareFn: (a: T, b: T) => number
  ): number {
    let left = 0
    let right = sortedArray.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const comparison = compareFn(sortedArray[mid], target)

      if (comparison === 0) {
        return mid
      } else if (comparison < 0) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return -1
  }
}