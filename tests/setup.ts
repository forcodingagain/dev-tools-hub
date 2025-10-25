/**
 * 测试环境设置
 * 配置全局测试工具和Mock
 */

import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// 在所有测试之前启动Mock服务器
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error'
  })
})

// 每个测试之后清理DOM
afterEach(() => {
  cleanup()
})

// 在所有测试之后关闭Mock服务器
afterAll(() => {
  server.close()
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock MutationObserver
global.MutationObserver = class MutationObserver {
  constructor() {}
  disconnect() {}
  observe() {}
}

// Mock Performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    clearMarks: () => {},
    clearMeasures: () => {}
  }
})

// Mock RequestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16)
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      return Object.keys(store)[index] || null
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  })
})

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: () => 'mock-url'
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: () => {}
})

// Mock File and FileReader
global.File = class File {
  constructor(chunks: any[], filename: string, options: FilePropertyBag = {}) {
    this.chunks = chunks
    this.name = filename
    this.size = chunks.reduce((size, chunk) => size + chunk.length, 0)
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
  }
}

global.FileReader = class FileReader {
  result: string | ArrayBuffer | null = null
  error: any = null
  readyState: number = 0
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null

  static EMPTY = 0
  static LOADING = 1
  static DONE = 2

  readAsText(file: File): void {
    this.readyState = FileReader.LOADING
    setTimeout(() => {
      this.readyState = FileReader.DONE
      this.result = 'mock file content'
      if (this.onload) {
        this.onload(new ProgressEvent('load'))
      }
    }, 100)
  }

  readAsDataURL(file: File): void {
    this.readyState = FileReader.LOADING
    setTimeout(() => {
      this.readyState = FileReader.DONE
      this.result = 'data:image/png;base64,mock-data-url'
      if (this.onload) {
        this.onload(new ProgressEvent('load'))
      }
    }, 100)
  }
}

// Mock ProgressEvent
global.ProgressEvent = class ProgressEvent {
  constructor(type: string, eventInitDict?: ProgressEventInit) {
    this.type = type
    this.lengthComputable = eventInitDict?.lengthComputable ?? false
    this.loaded = eventInitDict?.loaded ?? 0
    this.total = eventInitDict?.total ?? 0
  }
}

// 扩展Vitest类型
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T
    toHaveClass(className: string): T
    toHaveAttribute(attr: string, value?: string): T
    toHaveTextContent(text: string | RegExp): T
    toBeVisible(): T
    toBeDisabled(): T
    toBeEnabled(): T
    toHaveFocus(): T
    toHaveValue(value: string | number): T
    toBeChecked(): T
    toBeEmpty(): T
    toContainElement(element: string | RegExp): T
    toHaveStyle(style: Record<string, string>): T
  }
}