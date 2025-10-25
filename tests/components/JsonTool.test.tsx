/**
 * JSON工具组件测试
 * 测试JSON格式化、验证、压缩等功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JsonTool from '~/routes/json'
import { formatJson, validateJson, minifyJson, getJsonStats } from '~/lib/json'
import { renderWithProviders, createUserEvent, createMockFile } from '../utils/test-helpers'

// Mock JSON数据
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

describe('JsonTool Component', () => {
  let user: ReturnType<typeof createUserEvent>

  beforeEach(() => {
    user = createUserEvent()
  })

  it('renders the JSON tool correctly', () => {
    renderWithProviders(<JsonTool />)

    expect(screen.getByText('JSON在线工具')).toBeInTheDocument()
    expect(screen.getByText('格式化和验证JSON数据，支持语法高亮和错误提示，帮助您快速处理JSON格式')).toBeInTheDocument()
    expect(screen.getByLabelText('输入 JSON')).toBeInTheDocument()
    expect(screen.getByLabelText('格式化结果')).toBeInTheDocument()
  })

  it('shows format options correctly', () => {
    renderWithProviders(<JsonTool />)

    expect(screen.getByLabelText('缩进空格数')).toBeInTheDocument()
    expect(screen.getByLabelText('按字母顺序排序键')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '格式化' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '压缩' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清空' })).toBeInTheDocument()
  })

  it('formats valid JSON correctly', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')
    const formatButton = screen.getByRole('button', { name: '格式化' })

    await user.type(input, validJsonString)
    await user.click(formatButton)

    // 等待格式化完成
    await waitFor(() => {
      expect(input).toHaveValue(formattedJsonString)
    })

    // 检查输出区域是否包含格式化后的内容
    const output = screen.getByLabelText('格式化结果')
    expect(output).toHaveValue(formattedJsonString)
  })

  it('shows error for invalid JSON', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')

    await user.type(input, invalidJsonString)

    // 应该显示错误信息
    await waitFor(() => {
      expect(screen.getByText(/JSON语法错误/)).toBeInTheDocument()
    })
  })

  it('minifies JSON correctly', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')
    const minifyButton = screen.getByRole('button', { name: '压缩' })

    await user.type(input, validJsonString)
    await user.click(minifyButton)

    await waitFor(() => {
      expect(input).toHaveValue('{"name":"test","value":123,"items":[1,2,3]}')
    })
  })

  it('updates options correctly', async () => {
    renderWithProviders(<JsonTool />)

    const indentSelect = screen.getByLabelText('缩进空格数')
    const sortKeysCheckbox = screen.getByLabelText('按字母顺序排序键')

    // 更改缩进选项
    await user.selectOptions(indentSelect, '4 空格')
    expect(indentSelect).toHaveValue('4')

    // 切换排序选项
    await user.click(sortKeysCheckbox)
    expect(sortKeysCheckbox).toBeChecked()
  })

  it('clears input and output correctly', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')
    const clearButton = screen.getByRole('button', { name: '清空' })

    // 输入一些内容
    await user.type(input, validJsonString)
    expect(input).toHaveValue(validJsonString)

    // 清空内容
    await user.click(clearButton)

    expect(input).toHaveValue('')
    const output = screen.getByLabelText('格式化结果')
    expect(output).toHaveValue('')
  })

  it('copies formatted JSON to clipboard', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')
    const formatButton = screen.getByRole('button', { name: '格式化' })
    const copyButton = screen.getByRole('button', { name: '复制结果' })

    await user.type(input, validJsonString)
    await user.click(formatButton)

    // 等待格式化完成
    await waitFor(() => {
      const output = screen.getByLabelText('格式化结果')
      expect(output).toHaveValue(formattedJsonString)
    })

    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue()
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    })

    await user.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith(formattedJsonString)
  })

  it('shows character count when JSON is formatted', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')
    const formatButton = screen.getByRole('button', { name: '格式化' })

    await user.type(input, validJsonString)
    await user.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/\d+ 字符/)).toBeInTheDocument()
    })
  })

  it('handles large JSON files', async () => {
    const largeJson = {
      data: Array(1000).fill({ id: 1, name: 'test', value: Math.random() })
    }
    const largeJsonString = JSON.stringify(largeJson)

    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')

    await user.type(input, largeJsonString)

    // 应该能够处理大型JSON而不会崩溃
    expect(input).toHaveValue(largeJsonString)
  })

  it('shows keyboard navigation help', () => {
    renderWithProviders(<JsonTool />)

    expect(screen.getByText('键盘导航')).toBeInTheDocument()
    expect(screen.getByText(/使用 Tab 键在控件间导航/)).toBeInTheDocument()
  })

  it('has proper ARIA labels and roles', () => {
    renderWithProviders(<JsonTool />)

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByLabelText('输入 JSON')).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText('格式化结果')).toHaveAttribute('aria-readonly', 'true')
    expect(screen.getByRole('button', { name: '格式化' })).toHaveAttribute('aria-describedby')
  })

  it('disables buttons when no input is provided', () => {
    renderWithProviders(<JsonTool />)

    const formatButton = screen.getByRole('button', { name: '格式化' })
    const minifyButton = screen.getByRole('button', { name: '压缩' })
    const copyButton = screen.getByRole('button', { name: '复制结果' })

    expect(formatButton).toBeDisabled()
    expect(minifyButton).toBeDisabled()
    expect(copyButton).toBeDisabled()
  })

  it('enables buttons when input is provided', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')
    const formatButton = screen.getByRole('button', { name: '格式化' })

    await user.type(input, validJsonString)

    expect(formatButton).not.toBeDisabled()
  })

  it('debounces input changes', async () => {
    renderWithProviders(<JsonTool />)

    const input = screen.getByLabelText('输入 JSON')

    // 使用 vi.useFakeTimers()来控制时间
    vi.useFakeTimers()

    await user.type(input, validJsonString)

    // 由于有防抖，格式化不应该立即发生
    vi.advanceTimersByTime(100)
    expect(screen.getByLabelText('格式化结果')).toHaveValue('')

    // 等待防抖时间过去
    vi.advanceTimersByTime(500)
    await waitFor(() => {
      expect(screen.getByLabelText('格式化结果')).toHaveValue(formattedJsonString)
    })

    vi.useRealTimers()
  })
})

describe('JSON Utility Functions', () => {
  describe('formatJson', () => {
    it('formats valid JSON with 2-space indentation', () => {
      const result = formatJson(validJsonString, { indent: 2 })
      expect(result.success).toBe(true)
      expect(result.formatted).toBe(formattedJsonString)
    })

    it('formats valid JSON with 4-space indentation', () => {
      const result = formatJson(validJsonString, { indent: 4 })
      expect(result.success).toBe(true)
      expect(result.formatted).toContain('    ')
    })

    it('returns error for invalid JSON', () => {
      const result = formatJson(invalidJsonString)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('sorts keys when requested', () => {
      const unsortedJson = '{"z": 1, "a": 2, "m": 3}'
      const result = formatJson(unsortedJson, { sortKeys: true })
      expect(result.success).toBe(true)
      expect(result.formatted).toMatch(/"a".*"z"/m/)
    })
  })

  describe('validateJson', () => {
    it('validates correct JSON', () => {
      const result = validateJson(validJsonString)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('detects invalid JSON', () => {
      const result = validateJson(invalidJsonString)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].line).toBe(1)
      expect(result.errors[0].column).toBeGreaterThan(0)
    })
  })

  describe('minifyJson', () => {
    it('minifies valid JSON', () => {
      const result = minifyJson(validJsonString)
      expect(result.success).toBe(true)
      expect(result.formatted).toBe('{"name":"test","value":123,"items":[1,2,3]}')
    })

    it('returns error for invalid JSON', () => {
      const result = minifyJson(invalidJsonString)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getJsonStats', () => {
    it('calculates correct statistics', () => {
      const stats = getJsonStats(validJsonString)
      expect(stats.characters).toBe(validJsonString.length)
      expect(stats.size).toBeGreaterThan(0)
      expect(stats.keys).toBe(3)
      expect(stats.depth).toBe(2)
    })

    it('handles empty JSON', () => {
      const stats = getJsonJsonStats('{}')
      expect(stats.characters).toBe(2)
      expect(stats.keys).toBe(0)
      expect(stats.depth).toBe(0)
    })

    it('handles nested objects', () => {
      const nestedJson = '{"outer": {"inner": {"value": 123}}}'
      const stats = getJsonStats(nestedJson)
      expect(stats.depth).toBe(2)
    })
  })
})