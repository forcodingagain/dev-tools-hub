/**
 * 测试辅助工具函数
 * 提供常用的测试模式和组件渲染辅助
 */

import { render, RenderOptions } from '@testing-library/react'
import { RenderResult } from '@testing-library/react/types'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

/**
 * 渲染组件并返回增强的测试工具
 */
export function renderWithProviders<T = any>(
  ui: ReactElement,
  options?: RenderOptions<T>
): RenderResult<T> {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // 这里可以添加Provider包装器
    return <>{children}</>
  }

  return render(ui, {
    wrapper: Wrapper,
    ...options
  })
}

/**
 * 创建用户事件模拟器
 */
export function createUserEvent() {
  return userEvent.setup({
    advanceTimers: true,
    ignoreBeforeMount: true
  })
}

/**
 * 模拟文件输入
 */
export function createMockFile(
  content: string,
  filename: string,
  type: string = 'text/plain'
): File {
  return new File([content], filename, { type })
}

/**
 * 模拟文件拖拽事件
 */
export function createDragEvent(type: string, data: string | File[]): DragEvent {
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    dataTransfer: {
      files: Array.isArray(data) ? data : [data],
      items: [],
      types: ['Files'],
      setData: () => {},
      getData: () => data
    }
  })
  return event
}

/**
 * 模拟键盘事件
 */
export function createKeyboardEvent(
  type: string,
  key: string,
  options: KeyboardEventInit = {}
): KeyboardEvent {
  return new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
    ...options
  })
}

/**
 * 模拟鼠标事件
 */
export function createMouseEvent(
  type: string,
  options: MouseEventInit = {}
): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options
  })
}

/**
 * 模拟窗口调整大小
 */
export function mockResize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  })

  window.dispatchEvent(new Event('resize'))
}

/**
 * 等待异步操作完成
 */
export function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟网络请求
 */
export function mockFetch(response: any, options: { status?: number; delay?: number } = {}) {
  const { status = 200, delay = 0 } = options

  return jest.fn(() =>
    new Promise(resolve =>
      setTimeout(() => {
        resolve({
          ok: status < 400,
          status,
          json: () => Promise.resolve(response)
        })
      }, delay)
    )
  )
}

/**
 * 模拟IntersectionObserver回调
 */
export function mockIntersectionObserver(callback: IntersectionObserverCallback) {
  const entries = [
    {
      target: document.createElement('div'),
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: {
        bottom: 100,
        height: 100,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0
      },
      intersectionRect: {
        bottom: 100,
        height: 100,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0
      },
      rootBounds: null,
      time: Date.now()
    }
  ]

  callback(entries, observer)

  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }
}

/**
 * 模拟MutationObserver
 */
export function mockMutationObserver(callback: MutationCallback) {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => [])
  }
}

/**
 * 模拟Performance API
 */
export function mockPerformanceAPI() {
  const mockPerformance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => [])
  }

  Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    writable: true
  })

  return mockPerformance
}

/**
 * 模拟地理位置API
 */
export function mockGeolocationAPI(position: GeolocationPosition) {
  const mockGeolocation = {
    getCurrentPosition: jest.fn((success) => {
      success(position)
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  }

  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  })

  return mockGeolocation
}

/**
 * 模拟ClipboardAPI
 */
export function mockClipboardAPI() {
  const mockClipboard = {
    writeText: jest.fn(),
    readText: jest.fn(() => Promise.resolve('mock clipboard content'))
  }

  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true
  })

  return mockClipboard
}

/**
 * 创建测试用的Mock组件
 */
export function createMockComponent<T extends object>(defaultProps: Partial<T> = {}) {
  return {
    render: jest.fn(),
    defaultProps,
    props: {}
  } as any
}

/**
 * 模拟Promise
 */
export function createMockPromise<T>(
  resolveValue?: T,
  shouldReject = false,
  delay = 0
): jest.MockedFunction<() => Promise<T>> {
  return jest.fn(() =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldReject) {
          reject(new Error('Mock promise rejection'))
        } else {
          resolve(resolveValue as T)
        }
      }, delay)
    })
  )
}

/**
 * 模拟定时器
 */
export function mockTimers() {
  const timers = new Set<number>()
  const now = jest.fn(() => Date.now())

  const setTimeout = jest.fn((callback, delay) => {
    const id = Date.now()
    timers.add(id)
    return id
  })

  const clearTimeout = jest.fn((id) => {
    timers.delete(id)
  })

  const setInterval = jest.fn((callback, delay) => {
    const id = Date.now()
    timers.add(id)
    return id
  })

  const clearInterval = jest.fn((id) => {
    timers.delete(id)
  })

  return {
    now,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    getAllTimers: () => Array.from(timers),
    clearAllTimers: () => timers.clear()
  }
}

/**
 * 模拟History API
 */
export function mockHistoryAPI(initialEntries: string[] = ['/']) {
  const entries = [...initialEntries]
  let index = entries.length - 1

  const mockHistory = {
    get length() {
      return entries.length
    },
    get state() {
      return index
    },
    push: jest.fn((url: string, state?: string) => {
      entries.push(url)
      if (state) {
        index = parseInt(state)
      } else {
        index = entries.length - 1
      }
    }),
    replace: jest.fn((url: string, state?: string) => {
      entries[index] = url
      if (state) {
        index = parseInt(state)
      }
    }),
    go: jest.fn((delta: number) => {
      const newIndex = index + delta
      if (newIndex >= 0 && newIndex < entries.length) {
        index = newIndex
      }
    }),
    back: jest.fn(() => mockHistory.go(-1)),
    forward: jest.fn(() => mockHistory.go(1)),
    entries: () => [...entries]
  }

  Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true
  })

  return mockHistory
}

/**
 * 模拟Location API
 */
export function mockLocationAPI(href: string = 'http://localhost:3000/') {
  const url = new URL(href)

  const mockLocation = {
    href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    searchParams: url.searchParams,
    hash: url.hash,
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
  }

  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
  })

  return mockLocation
}