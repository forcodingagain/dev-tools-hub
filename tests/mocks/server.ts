/**
 * Mock Service Worker服务器
 * 用于测试时的API Mock
 */

import { setupServer } from 'msw/node'
import { http, delay } from 'msw'

// 模拟API响应数据
const mockApiHandlers = [
  // JSON工具相关API
  http.post('/api/json/format', async ({ request }) => {
    const { json, options } = await request.json() as any

    try {
      // 模拟JSON处理
      const formatted = JSON.stringify(JSON.parse(json), null, options.indent || 2)

      return Response.json({
        success: true,
        formatted,
        stats: {
          characters: formatted.length,
          size: new Blob([formatted]).size,
          keys: Object.keys(JSON.parse(json)).length,
          depth: getJsonDepth(JSON.parse(json))
        }
      })
    } catch (error) {
      return Response.json({
        success: false,
        error: {
          message: 'Invalid JSON format',
          line: 1,
          column: 1
        }
      }, { status: 400 })
    }
  }),

  http.post('/api/json/minify', async ({ request }) => {
    const { json } = await request.json() as any

    try {
      const minified = JSON.stringify(JSON.parse(json))
      return Response.json({
        success: true,
        formatted: minified
      })
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Invalid JSON format'
      }, { status: 400 })
    }
  }),

  http.post('/api/json/validate', async ({ request }) => {
    const { json } = await request.json() as any

    try {
      JSON.parse(json)
      return Response.json({
        valid: true,
        errors: []
      })
    } catch (error) {
      return Response.json({
        valid: false,
        errors: [{
          line: 1,
          column: 1,
          message: 'Unexpected token'
        }]
      })
    }
  }),

  // 性能监控API
  http.get('/api/performance/metrics', () => {
    return Response.json({
      timestamp: Date.now(),
      metrics: {
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
          },
          {
            name: 'styles.css',
            size: 45000,
            duration: 45,
            transferSize: 43000
          }
        ],
        vitals: {
          fcp: 600,
          lcp: 1200,
          cls: 0.1,
          fid: 85
        }
      }
    })
  }),

  // 用户行为追踪API
  http.post('/api/analytics/track', async ({ request }) => {
    const { event, properties } = await request.json() as any

    return Response.json({
      success: true,
      trackingId: `track_${Date.now()}`,
      event,
      timestamp: Date.now()
    })
  }),

  // 错误报告API
  http.post('/api/errors/report', async ({ request }) => {
    const { error, context } = await request.json() as any

    return Response.json({
      success: true,
      errorId: `error_${Date.now()}`,
      message: 'Error reported successfully'
    })
  }),

  // 功能检测API
  http.get('/api/features/detect', () => {
    return Response.json({
      features: {
        webgl: true,
        webgl2: true,
        webassembly: true,
        serviceWorker: true,
        pushNotifications: true,
        geolocation: true,
        camera: true,
        microphone: true,
        fullscreen: true,
        localstorage: true,
        sessionstorage: true,
        indexedDB: true,
        webWorkers: true,
        webSockets: true,
        shareAPI: true,
        clipboardAPI: true,
        notificationAPI: true,
        vibrateAPI: false
      },
      browser: {
        name: 'Chrome',
        version: '120.0.0.0',
        platform: 'Win32',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
  }),

  // 包分析API
  http.get('/api/bundle/analyze', () => {
    return Response.json({
      bundleSize: 245000,
      gzippedSize: 68000,
      modules: [
        {
          name: 'main',
          size: 150000,
          gzippedSize: 42000,
          dependencies: ['react', 'react-dom', '@remix-run/react']
        },
        {
          name: 'vendor',
          size: 80000,
          gzipped: 18000,
          dependencies: ['lodash', 'moment', 'axios']
        },
        {
          name: 'styles',
          size: 15000,
          gzipped: 4000,
          dependencies: []
        }
      ],
      recommendations: [
        'Consider code splitting for better performance',
        'Remove unused dependencies',
        'Optimize bundle size'
      ]
    })
  })
]

// 获取JSON嵌套深度的辅助函数
function getJsonDepth(obj: any, currentDepth = 0): number {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth
  }

  if (Array.isArray(obj)) {
    return Math.max(
      ...obj.map(item => getJsonDepth(item, currentDepth + 1)),
      currentDepth
    )
  }

  const values = Object.values(obj)
  if (values.length === 0) {
    return currentDepth
  }

  return Math.max(
    ...values.map(value => getJsonDepth(value, currentDepth + 1)),
    currentDepth
  )
}

// 导出服务器实例
export const server = setupServer(...mockApiHandlers)

// 导出处理程序以供测试使用
export const { handlers } = server

// 导出模拟数据
export const mockData = {
  validJson: {
    input: '{"name": "test", "value": 123}',
    formatted: '{\n  "name": "test",\n  "value": 123\n}'
  },

  invalidJson: {
    input: '{"name": "test", "value":}',
    error: 'Unexpected end of JSON input'
  },

  performanceMetrics: {
    navigationStart: Date.now() - 1000,
    loadEventEnd: Date.now(),
    firstContentfulPaint: Date.now() - 400,
    largestContentfulPaint: Date.now() - 200
  },

  browserInfo: {
    name: 'chrome',
    version: '120.0.0.0',
    platform: 'Win32',
    mobile: false,
    tablet: false
  }
}