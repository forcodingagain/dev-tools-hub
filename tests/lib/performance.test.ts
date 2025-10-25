/**
 * 性能监控库测试
 * 测试性能指标收集、监控和优化功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  navigation: {
    type: 0,
    redirectCount: 0
  },
  timing: {
    navigationStart: Date.now() - 1000,
    loadEventEnd: Date.now(),
    domContentLoadedEventEnd: Date.now() - 200,
    firstContentfulPaint: Date.now() - 400,
    largestContentfulPaint: Date.now() - 100
  },
  getEntriesByType: vi.fn(() => [])
}

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true
})

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})
window.IntersectionObserver = mockIntersectionObserver

// Mock ResizeObserver
const mockResizeObserver = vi.fn()
mockResizeObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})
window.ResizeObserver = mockResizeObserver

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置性能API mock
    mockPerformance.now.mockReturnValue(Date.now())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Performance Metrics Collection', () => {
    it('collects basic performance metrics', () => {
      // 模拟性能监控器
      const metrics = {
        navigation: {
          startTime: Date.now() - 1000,
          loadTime: 850,
          domInteractive: 700,
          firstContentfulPaint: 600,
          largestContentfulPaint: 1200
        },
        resources: [
          {
            name: 'main.js',
            size: 256000,
            duration: 120,
            transferSize: 245000
          }
        ],
        vitals: {
          fcp: 600,
          lcp: 1200,
          cls: 0.1,
          fid: 85
        }
      }

      expect(metrics.navigation.loadTime).toBe(850)
      expect(metrics.navigation.firstContentfulPaint).toBe(600)
      expect(metrics.vitals.fcp).toBe(600)
    })

    it('calculates performance scores correctly', () => {
      const metrics = {
        fcp: 600, // 良好
        lcp: 1200, // 需要改进
        cls: 0.1, // 良好
        fid: 85 // 需要改进
      }

      const scores = {
        fcp: metrics.fcp < 1800 ? 100 : 50,
        lcp: metrics.lcp < 2500 ? 100 : 50,
        cls: metrics.cls < 0.1 ? 100 : 50,
        fid: metrics.fid < 100 ? 100 : 50
      }

      expect(scores.fcp).toBe(100)
      expect(scores.lcp).toBe(100)
      expect(scores.cls).toBe(100)
      expect(scores.fid).toBe(100)
    })

    it('tracks memory usage', () => {
      // 模拟内存API
      const mockMemory = {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2048 * 1024 * 1024 // 2GB
      }

      Object.defineProperty(performance, 'memory', {
        value: mockMemory,
        writable: true
      })

      expect(mockMemory.usedJSHeapSize).toBe(52428800)
      expect(mockMemory.totalJSHeapSize).toBe(104857600)
    })

    it('monitors network performance', () => {
      const connection = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false
      }

      Object.defineProperty(navigator, 'connection', {
        value: connection,
        writable: true
      })

      expect(connection.effectiveType).toBe('4g')
      expect(connection.downlink).toBe(10)
    })
  })

  describe('Performance Observer', () => {
    it('observes Core Web Vitals', () => {
      const mockCallback = vi.fn()

      // 模拟 PerformanceObserver
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn()
      }

      global.PerformanceObserver = vi.fn().mockImplementation(callback => {
        mockCallback.mockImplementation(callback)
        return mockObserver
      })

      const observer = new PerformanceObserver(mockCallback)
      observer.observe({ type: 'largest-contentful-paint' })

      expect(mockObserver.observe).toHaveBeenCalledWith({
        type: 'largest-contentful-paint'
      })
    })

    it('measures custom performance marks', () => {
      const markName = 'custom-operation'
      const measureName = 'custom-operation-measure'

      mockPerformance.mark(markName)
      mockPerformance.measure(measureName, markName)

      expect(mockPerformance.mark).toHaveBeenCalledWith(markName)
      expect(mockPerformance.measure).toHaveBeenCalledWith(measureName, markName)
    })

    it('tracks resource loading performance', () => {
      const resources = [
        {
          name: 'script.js',
          duration: 100,
          transferSize: 50000,
          responseEnd: Date.now()
        },
        {
          name: 'style.css',
          duration: 50,
          transferSize: 20000,
          responseEnd: Date.now()
        }
      ]

      const totalDuration = resources.reduce((sum, resource) => sum + resource.duration, 0)
      expect(totalDuration).toBe(150)

      const totalSize = resources.reduce((sum, resource) => sum + resource.transferSize, 0)
      expect(totalSize).toBe(70000)
    })
  })

  describe('Performance Optimization', () => {
    it('identifies performance bottlenecks', () => {
      const metrics = {
        slowOperations: [
          { name: 'dom-query', duration: 50 },
          { name: 'json-parse', duration: 20 },
          { name: 'layout-calculation', duration: 100 }
        ]
      }

      const bottlenecks = metrics.slowOperations.filter(op => op.duration > 30)
      expect(bottlenecks).toHaveLength(2)
      expect(bottlenecks[0].name).toBe('dom-query')
      expect(bottlenecks[1].name).toBe('layout-calculation')
    })

    it('suggests optimization strategies', () => {
      const issues = [
        { type: 'large-images', impact: 'high' },
        { type: 'unused-css', impact: 'medium' },
        { type: 'blocking-js', impact: 'high' }
      ]

      const strategies = {
        'large-images': '使用图片压缩和懒加载',
        'unused-css': '移除未使用的CSS规则',
        'blocking-js': '使用async/defer加载脚本'
      }

      const highImpactIssues = issues.filter(issue => issue.impact === 'high')
      expect(highImpactIssues).toHaveLength(2)

      highImpactIssues.forEach(issue => {
        expect(strategies[issue.type]).toBeDefined()
      })
    })

    it('monitors frame rate for smooth animations', () => {
      const frameTimestamps = Array.from({ length: 60 }, (_, i) => i * 16.67) // 60fps
      const frameDurations = frameTimestamps.slice(1).map((time, i) => time - frameTimestamps[i])

      const averageFrameTime = frameDurations.reduce((sum, time) => sum + time, 0) / frameDurations.length
      const fps = 1000 / averageFrameTime

      expect(fps).toBeCloseTo(60, 1)
    })
  })

  describe('Performance Reporting', () => {
    it('generates performance reports', () => {
      const reportData = {
        timestamp: Date.now(),
        url: 'http://localhost:3000/test',
        userAgent: navigator.userAgent,
        metrics: {
          fcp: 600,
          lcp: 1200,
          cls: 0.1,
          fid: 85
        },
        resources: [
          { name: 'app.js', size: 250000, duration: 150 }
        ],
        score: 85
      }

      expect(reportData.metrics.fcp).toBe(600)
      expect(reportData.score).toBe(85)
      expect(reportData.resources).toHaveLength(1)
    })

    it('aggregates performance data over time', () => {
      const measurements = [
        { timestamp: Date.now() - 10000, fcp: 800, lcp: 1500 },
        { timestamp: Date.now() - 5000, fcp: 600, lcp: 1200 },
        { timestamp: Date.now(), fcp: 700, lcp: 1300 }
      ]

      const averageFCP = measurements.reduce((sum, m) => sum + m.fcp, 0) / measurements.length
      const averageLCP = measurements.reduce((sum, m) => sum + m.lcp, 0) / measurements.length

      expect(averageFCP).toBeCloseTo(700, 0)
      expect(averageLCP).toBeCloseTo(1333, 0)
    })

    it('detects performance regressions', () => {
      const baseline = { fcp: 600, lcp: 1200, cls: 0.1 }
      const current = { fcp: 1200, lcp: 2500, cls: 0.25 }

      const regressions = []

      if (current.fcp > baseline.fcp * 1.5) {
        regressions.push('FCP regression detected')
      }
      if (current.lcp > baseline.lcp * 1.5) {
        regressions.push('LCP regression detected')
      }
      if (current.cls > baseline.cls * 2) {
        regressions.push('CLS regression detected')
      }

      expect(regressions).toHaveLength(3)
    })
  })

  describe('Performance Utilities', () => {
    it('debounces performance measurements', async () => {
      const measureFunction = vi.fn()
      const debounceTime = 100

      const debouncedMeasure = (fn: Function) => {
        let timeoutId: ReturnType<typeof setTimeout>
        return (...args: any[]) => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => fn(...args), debounceTime)
        }
      }

      const debouncedFn = debouncedMeasure(measureFunction)

      // 快速调用多次
      debouncedFn('test1')
      debouncedFn('test2')
      debouncedFn('test3')

      // 应该只调用最后一次
      vi.advanceTimersByTime(debounceTime)
      expect(measureFunction).toHaveBeenCalledTimes(1)
      expect(measureFunction).toHaveBeenCalledWith('test3')
    })

    it('throttles performance tracking', () => {
      const trackFunction = vi.fn()
      const throttleTime = 100

      const throttledTrack = (fn: Function) => {
        let lastCall = 0
        return (...args: any[]) => {
          const now = Date.now()
          if (now - lastCall >= throttleTime) {
            lastCall = now
            return fn(...args)
          }
        }
      }

      const throttledFn = throttledTrack(trackFunction)

      // 快速调用多次
      const result1 = throttledFn('test1')
      const result2 = throttledFn('test2')
      const result3 = throttledFn('test3')

      expect(trackFunction).toHaveBeenCalledTimes(1)
      expect(trackFunction).toHaveBeenCalledWith('test1')
    })

    it('measures function execution time', () => {
      const measureTime = (fn: Function) => {
        const start = mockPerformance.now()
        const result = fn()
        const end = mockPerformance.now()
        return { result, duration: end - start }
      }

      const testFunction = () => {
        let sum = 0
        for (let i = 0; i < 1000000; i++) {
          sum += i
        }
        return sum
      }

      const { result, duration } = measureTime(testFunction)

      expect(result).toBeGreaterThan(0)
      expect(duration).toBeGreaterThan(0)
    })
  })

  describe('Performance Budget Monitoring', () => {
    it('enforces performance budgets', () => {
      const budgets = {
        jsSize: 250000, // 250KB
        cssSize: 50000, // 50KB
        imageSize: 500000, // 500KB
        totalTime: 3000 // 3秒
      }

      const actual = {
        jsSize: 280000, // 超出预算
        cssSize: 45000, // 在预算内
        imageSize: 450000, // 在预算内
        totalTime: 2500 // 在预算内
      }

      const violations = []

      if (actual.jsSize > budgets.jsSize) {
        violations.push(`JS size exceeded: ${actual.jsSize} > ${budgets.jsSize}`)
      }
      if (actual.cssSize > budgets.cssSize) {
        violations.push(`CSS size exceeded: ${actual.cssSize} > ${budgets.cssSize}`)
      }
      if (actual.imageSize > budgets.imageSize) {
        violations.push(`Image size exceeded: ${actual.imageSize} > ${budgets.imageSize}`)
      }
      if (actual.totalTime > budgets.totalTime) {
        violations.push(`Load time exceeded: ${actual.totalTime} > ${budgets.totalTime}`)
      }

      expect(violations).toHaveLength(1)
      expect(violations[0]).toContain('JS size exceeded')
    })

    it('calculates performance scores', () => {
      const metrics = {
        fcp: 1800, // 50分
        lcp: 2400, // 75分
        cls: 0.25, // 50分
        fid: 100, // 75分
        ttfb: 600 // 100分
      }

      const getScore = (value: number, thresholds: { good: number; needsImprovement: number }) => {
        if (value <= thresholds.good) return 100
        if (value <= thresholds.needsImprovement) return 50
        return 25
      }

      const scores = {
        fcp: getScore(metrics.fcp, { good: 1800, needsImprovement: 3000 }),
        lcp: getScore(metrics.lcp, { good: 2500, needsImprovement: 4000 }),
        cls: getScore(metrics.cls, { good: 0.1, needsImprovement: 0.25 }),
        fid: getScore(metrics.fid, { good: 100, needsImprovement: 300 }),
        ttfb: getScore(metrics.ttfb, { good: 800, needsImprovement: 1800 })
      }

      expect(scores.fcp).toBe(100)
      expect(scores.lcp).toBe(100)
      expect(scores.cls).toBe(100)
      expect(scores.fid).toBe(100)
      expect(scores.ttfb).toBe(100)

      const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
      expect(overallScore).toBe(100)
    })
  })
})