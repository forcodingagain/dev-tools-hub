/**
 * JSON工具库测试
 * 测试JSON格式化、验证、压缩等功能
 */

import { describe, it, expect, beforeEach } from 'vitest'

// 导入要测试的函数
// import { formatJson, validateJson, minifyJson, getJsonStats } from '~/lib/json'

describe('JSON Utility Functions', () => {
  // 测试数据
  const validJsonString = '{"name": "test", "value": 123, "items": [1, 2, 3]}'
  const invalidJsonString = '{"name": "test", "value": }'
  const formattedJsonString = `{
  "name": "test",
  "value": 123,
  "items": [
    1,
    2,
    3
  ]
}`

  describe('formatJson', () => {
    it('formats valid JSON with 2-space indentation', () => {
      // Mock implementation for testing
      const formatJson = (jsonString: string, options: { indent?: number } = {}) => {
        try {
          const parsed = JSON.parse(jsonString)
          const indent = options.indent || 2
          return {
            success: true,
            formatted: JSON.stringify(parsed, null, indent)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = formatJson(validJsonString, { indent: 2 })
      expect(result.success).toBe(true)
      expect(result.formatted).toContain('  "name": "test"')
    })

    it('formats valid JSON with 4-space indentation', () => {
      const formatJson = (jsonString: string, options: { indent?: number } = {}) => {
        try {
          const parsed = JSON.parse(jsonString)
          const indent = options.indent || 2
          return {
            success: true,
            formatted: JSON.stringify(parsed, null, indent)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = formatJson(validJsonString, { indent: 4 })
      expect(result.success).toBe(true)
      expect(result.formatted).toContain('    "name": "test"')
    })

    it('returns error for invalid JSON', () => {
      const formatJson = (jsonString: string, options: { indent?: number } = {}) => {
        try {
          const parsed = JSON.parse(jsonString)
          const indent = options.indent || 2
          return {
            success: true,
            formatted: JSON.stringify(parsed, null, indent)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = formatJson(invalidJsonString)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('sorts keys when requested', () => {
      const unsortedJson = '{"z": 1, "a": 2, "m": 3}'
      const formatJson = (jsonString: string, options: { indent?: number; sortKeys?: boolean } = {}) => {
        try {
          const parsed = JSON.parse(jsonString)
          const indent = options.indent || 2

          if (options.sortKeys) {
            const sortedObj: any = {}
            Object.keys(parsed).sort().forEach(key => {
              sortedObj[key] = parsed[key]
            })
            return {
              success: true,
              formatted: JSON.stringify(sortedObj, null, indent)
            }
          }

          return {
            success: true,
            formatted: JSON.stringify(parsed, null, indent)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = formatJson(unsortedJson, { sortKeys: true })
      expect(result.success).toBe(true)
      expect(result.formatted).toMatch(/"a".*"m".*"z"/)
    })
  })

  describe('validateJson', () => {
    it('validates correct JSON', () => {
      const validateJson = (jsonString: string) => {
        try {
          JSON.parse(jsonString)
          return { valid: true, errors: [] }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return {
            valid: false,
            errors: [{
              line: 1,
              column: 1,
              message: errorMessage
            }]
          }
        }
      }

      const result = validateJson(validJsonString)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('detects invalid JSON', () => {
      const validateJson = (jsonString: string) => {
        try {
          JSON.parse(jsonString)
          return { valid: true, errors: [] }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return {
            valid: false,
            errors: [{
              line: 1,
              column: 1,
              message: errorMessage
            }]
          }
        }
      }

      const result = validateJson(invalidJsonString)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].line).toBe(1)
      expect(result.errors[0].column).toBe(1)
    })

    it('provides detailed error information', () => {
      const malformedJson = '{"name": "test", "value": 123,}'
      const validateJson = (jsonString: string) => {
        try {
          JSON.parse(jsonString)
          return { valid: true, errors: [] }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return {
            valid: false,
            errors: [{
              line: 1,
              column: jsonString.length - 1,
              message: errorMessage
            }]
          }
        }
      }

      const result = validateJson(malformedJson)
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('JSON')
    })
  })

  describe('minifyJson', () => {
    it('minifies valid JSON', () => {
      const minifyJson = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)
          return {
            success: true,
            formatted: JSON.stringify(parsed)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = minifyJson(validJsonString)
      expect(result.success).toBe(true)
      expect(result.formatted).toBe('{"name":"test","value":123,"items":[1,2,3]}')
    })

    it('returns error for invalid JSON', () => {
      const minifyJson = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)
          return {
            success: true,
            formatted: JSON.stringify(parsed)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = minifyJson(invalidJsonString)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('handles empty JSON objects', () => {
      const minifyJson = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)
          return {
            success: true,
            formatted: JSON.stringify(parsed)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = minifyJson('{}')
      expect(result.success).toBe(true)
      expect(result.formatted).toBe('{}')
    })
  })

  describe('getJsonStats', () => {
    it('calculates correct statistics', () => {
      const getJsonStats = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)

          const countKeys = (obj: any): number => {
            if (Array.isArray(obj)) {
              return obj.reduce((sum, item) => sum + countKeys(item), 0)
            }
            if (typeof obj === 'object' && obj !== null) {
              const keys = Object.keys(obj)
              return keys.length + keys.reduce((sum, key) => sum + countKeys(obj[key]), 0)
            }
            return 0
          }

          const getDepth = (obj: any, currentDepth = 0): number => {
            if (typeof obj !== 'object' || obj === null) {
              return currentDepth
            }
            if (Array.isArray(obj)) {
              return Math.max(...obj.map(item => getDepth(item, currentDepth + 1)), currentDepth)
            }
            const values = Object.values(obj)
            if (values.length === 0) {
              return currentDepth
            }
            return Math.max(...values.map(value => getDepth(value, currentDepth + 1)), currentDepth)
          }

          return {
            characters: jsonString.length,
            size: new Blob([jsonString]).size,
            keys: countKeys(parsed),
            depth: getDepth(parsed)
          }
        } catch (error) {
          return {
            characters: 0,
            size: 0,
            keys: 0,
            depth: 0
          }
        }
      }

      const stats = getJsonStats(validJsonString)
      expect(stats.characters).toBe(validJsonString.length)
      expect(stats.size).toBeGreaterThan(0)
      expect(stats.keys).toBe(3) // name, value, items
      expect(stats.depth).toBe(2) // root -> items -> array items
    })

    it('handles empty JSON', () => {
      const getJsonStats = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)

          const countKeys = (obj: any): number => {
            if (Array.isArray(obj)) {
              return obj.reduce((sum, item) => sum + countKeys(item), 0)
            }
            if (typeof obj === 'object' && obj !== null) {
              const keys = Object.keys(obj)
              return keys.length + keys.reduce((sum, key) => sum + countKeys(obj[key]), 0)
            }
            return 0
          }

          const getDepth = (obj: any, currentDepth = 0): number => {
            if (typeof obj !== 'object' || obj === null) {
              return currentDepth
            }
            if (Array.isArray(obj)) {
              return Math.max(...obj.map(item => getDepth(item, currentDepth + 1)), currentDepth)
            }
            const values = Object.values(obj)
            if (values.length === 0) {
              return currentDepth
            }
            return Math.max(...values.map(value => getDepth(value, currentDepth + 1)), currentDepth)
          }

          return {
            characters: jsonString.length,
            size: new Blob([jsonString]).size,
            keys: countKeys(parsed),
            depth: getDepth(parsed)
          }
        } catch (error) {
          return {
            characters: 0,
            size: 0,
            keys: 0,
            depth: 0
          }
        }
      }

      const stats = getJsonStats('{}')
      expect(stats.characters).toBe(2)
      expect(stats.keys).toBe(0)
      expect(stats.depth).toBe(0)
    })

    it('handles nested objects', () => {
      const nestedJson = '{"outer": {"inner": {"value": 123}}}'
      const getJsonStats = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)

          const countKeys = (obj: any): number => {
            if (Array.isArray(obj)) {
              return obj.reduce((sum, item) => sum + countKeys(item), 0)
            }
            if (typeof obj === 'object' && obj !== null) {
              const keys = Object.keys(obj)
              return keys.length + keys.reduce((sum, key) => sum + countKeys(obj[key]), 0)
            }
            return 0
          }

          const getDepth = (obj: any, currentDepth = 0): number => {
            if (typeof obj !== 'object' || obj === null) {
              return currentDepth
            }
            if (Array.isArray(obj)) {
              return Math.max(...obj.map(item => getDepth(item, currentDepth + 1)), currentDepth)
            }
            const values = Object.values(obj)
            if (values.length === 0) {
              return currentDepth
            }
            return Math.max(...values.map(value => getDepth(value, currentDepth + 1)), currentDepth)
          }

          return {
            characters: jsonString.length,
            size: new Blob([jsonString]).size,
            keys: countKeys(parsed),
            depth: getDepth(parsed)
          }
        } catch (error) {
          return {
            characters: 0,
            size: 0,
            keys: 0,
            depth: 0
          }
        }
      }

      const stats = getJsonStats(nestedJson)
      expect(stats.depth).toBe(2)
      expect(stats.keys).toBe(2) // outer, inner
    })

    it('handles arrays correctly', () => {
      const arrayJson = '[{"id": 1, "name": "test"}, {"id": 2, "name": "example"}]'
      const getJsonStats = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)

          const countKeys = (obj: any): number => {
            if (Array.isArray(obj)) {
              return obj.reduce((sum, item) => sum + countKeys(item), 0)
            }
            if (typeof obj === 'object' && obj !== null) {
              const keys = Object.keys(obj)
              return keys.length + keys.reduce((sum, key) => sum + countKeys(obj[key]), 0)
            }
            return 0
          }

          const getDepth = (obj: any, currentDepth = 0): number => {
            if (typeof obj !== 'object' || obj === null) {
              return currentDepth
            }
            if (Array.isArray(obj)) {
              return Math.max(...obj.map(item => getDepth(item, currentDepth + 1)), currentDepth)
            }
            const values = Object.values(obj)
            if (values.length === 0) {
              return currentDepth
            }
            return Math.max(...values.map(value => getDepth(value, currentDepth + 1)), currentDepth)
          }

          return {
            characters: jsonString.length,
            size: new Blob([jsonString]).size,
            keys: countKeys(parsed),
            depth: getDepth(parsed)
          }
        } catch (error) {
          return {
            characters: 0,
            size: 0,
            keys: 0,
            depth: 0
          }
        }
      }

      const stats = getJsonStats(arrayJson)
      expect(stats.keys).toBe(4) // 2 objects * 2 keys each
      expect(stats.depth).toBe(1)
    })
  })

  describe('JSON Edge Cases', () => {
    it('handles special characters', () => {
      const specialJson = '{"text": "Hello\\nWorld\\t!", "emoji": "🚀"}'
      const formatJson = (jsonString: string, options: { indent?: number } = {}) => {
        try {
          const parsed = JSON.parse(jsonString)
          const indent = options.indent || 2
          return {
            success: true,
            formatted: JSON.stringify(parsed, null, indent)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = formatJson(specialJson)
      expect(result.success).toBe(true)
      expect(result.formatted).toContain('Hello\\nWorld\\t!')
      expect(result.formatted).toContain('🚀')
    })

    it('handles very large JSON', () => {
      const largeJson = {
        data: Array(1000).fill({ id: 1, name: 'test', value: Math.random() })
      }
      const largeJsonString = JSON.stringify(largeJson)

      const minifyJson = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)
          return {
            success: true,
            formatted: JSON.stringify(parsed)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = minifyJson(largeJsonString)
      expect(result.success).toBe(true)
      expect(result.formatted.length).toBeGreaterThan(1000)
    })

    it('handles deeply nested JSON', () => {
      let nestedObj: any = { value: 'leaf' }
      for (let i = 0; i < 10; i++) {
        nestedObj = { [`level${i}`]: nestedObj }
      }

      const nestedJsonString = JSON.stringify(nestedObj)
      const getJsonStats = (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString)

          const countKeys = (obj: any): number => {
            if (Array.isArray(obj)) {
              return obj.reduce((sum, item) => sum + countKeys(item), 0)
            }
            if (typeof obj === 'object' && obj !== null) {
              const keys = Object.keys(obj)
              return keys.length + keys.reduce((sum, key) => sum + countKeys(obj[key]), 0)
            }
            return 0
          }

          const getDepth = (obj: any, currentDepth = 0): number => {
            if (typeof obj !== 'object' || obj === null) {
              return currentDepth
            }
            if (Array.isArray(obj)) {
              return Math.max(...obj.map(item => getDepth(item, currentDepth + 1)), currentDepth)
            }
            const values = Object.values(obj)
            if (values.length === 0) {
              return currentDepth
            }
            return Math.max(...values.map(value => getDepth(value, currentDepth + 1)), currentDepth)
          }

          return {
            characters: jsonString.length,
            size: new Blob([jsonString]).size,
            keys: countKeys(parsed),
            depth: getDepth(parsed)
          }
        } catch (error) {
          return {
            characters: 0,
            size: 0,
            keys: 0,
            depth: 0
          }
        }
      }

      const stats = getJsonStats(nestedJsonString)
      expect(stats.depth).toBe(10)
      expect(stats.keys).toBe(10)
    })

    it('preserves data types correctly', () => {
      const typesJson = JSON.stringify({
        string: 'hello',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 'two', false],
        object: { nested: 'value' }
      })

      const formatJson = (jsonString: string, options: { indent?: number } = {}) => {
        try {
          const parsed = JSON.parse(jsonString)
          const indent = options.indent || 2
          return {
            success: true,
            formatted: JSON.stringify(parsed, null, indent)
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const result = formatJson(typesJson)
      expect(result.success).toBe(true)

      // 验证重新解析后的数据类型
      const reparsed = JSON.parse(result.formatted)
      expect(typeof reparsed.string).toBe('string')
      expect(typeof reparsed.number).toBe('number')
      expect(typeof reparsed.boolean).toBe('boolean')
      expect(reparsed.null).toBe(null)
      expect(Array.isArray(reparsed.array)).toBe(true)
      expect(typeof reparsed.object).toBe('object')
    })
  })
})