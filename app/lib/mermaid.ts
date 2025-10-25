import mermaid from 'mermaid'
import type {
  MermaidChartType,
  MermaidTheme,
  MermaidRenderOptions,
  MermaidRenderResult,
  MermaidValidationResult,
  MermaidError,
  MermaidStats
} from '~/types/mermaid'

// Mermaid配置
const MAX_NODES = 200
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// 图表类型检测正则表达式
const CHART_TYPE_PATTERNS: Record<MermaidChartType, RegExp> = {
  flowchart: /^graph|flowchart/mi,
  sequence: /^sequenceDiagram/mi,
  class: /^classDiagram/mi,
  state: /^stateDiagram/mi,
  entity: /^erDiagram/mi,
  gantt: /^gantt/mi,
  pie: /^pie/mi,
  journey: /^journey/mi,
  git: /^gitGraph/mi,
  er: /^erDiagram/mi,
  graph: /^graph/mi
}

// 图表类型配置
export const CHART_TYPE_CONFIGS: Record<MermaidChartType, {
  name: string
  description: string
  example: string
  maxNodes?: number
}> = {
  flowchart: {
    name: '流程图',
    description: '表示工作流程、算法步骤和决策过程',
    example: `graph TD
    A[开始] --> B{判断}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E`,
    maxNodes: 50
  },
  sequence: {
    name: '时序图',
    description: '显示对象之间的消息传递顺序',
    example: `sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 请求
    B-->>A: 响应`,
    maxNodes: 30
  },
  class: {
    name: '类图',
    description: '显示类的结构和关系',
    example: `classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +bark()
    }
    Animal <|-- Dog`,
    maxNodes: 40
  },
  state: {
    name: '状态图',
    description: '表示对象的状态转换',
    example: `stateDiagram-v2
    [*] --> 状态1
    状态1 --> 状态2: 事件1
    状态2 --> [*]: 事件2`,
    maxNodes: 30
  },
  entity: {
    name: '实体关系图',
    description: '显示实体之间的关系',
    example: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date order_date
    }`,
    maxNodes: 25
  },
  gantt: {
    name: '甘特图',
    description: '项目进度和时间规划',
    example: `gantt
    title 项目时间线
    dateFormat  YYYY-MM-DD
    section 任务
    任务1    :a1, 2024-01-01, 30d
    任务2    :a2, 2024-02-01, 20d`,
    maxNodes: 50
  },
  pie: {
    name: '饼图',
    description: '显示数据比例关系',
    example: `pie title 数据分布
    "A类" : 30
    "B类" : 45
    "C类" : 25`,
    maxNodes: 10
  },
  journey: {
    name: '用户旅程图',
    description: '显示用户使用流程',
    example: `journey
    title 用户购买流程
    section 购买前
      浏览: 5: 用户
      搜索: 4: 用户
    section 购买中
      下单: 3: 用户
      支付: 2: 用户`,
    maxNodes: 20
  },
  git: {
    name: 'Git图',
    description: '显示Git提交历史',
    example: `gitGraph
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature`,
    maxNodes: 30
  },
  er: {
    name: 'ER图',
    description: '实体关系图',
    example: `erDiagram
    USER ||--o{ POST : creates
    USER {
      int id PK
      string name
      string email
    }
    POST {
      int id PK
      string title
      string content
    }`,
    maxNodes: 25
  },
  graph: {
    name: '普通图表',
    description: '通用图表表示',
    example: `graph LR
    A-->B
    B-->C
    C-->A`,
    maxNodes: 30
  }
}

/**
 * 初始化Mermaid
 */
export function initializeMermaid(): void {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#e5e7eb',
      lineColor: '#6b7280',
      secondaryColor: '#10b981',
      tertiaryColor: '#8b5cf6'
    },
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14,
    securityLevel: 'loose'
  })
}

/**
 * 渲染Mermaid图表
 */
export async function renderMermaid(
  code: string,
  options: MermaidRenderOptions = {}
): Promise<MermaidRenderResult> {
  const startTime = Date.now()

  try {
    // 验证输入
    if (!code.trim()) {
      return {
        success: false,
        error: {
          message: '输入内容不能为空',
          type: 'syntax'
        }
      }
    }

    // 检查大小限制
    const sizeCheck = checkMermaidSize(code)
    if (!sizeCheck.valid) {
      return {
        success: false,
        error: {
          message: sizeCheck.error!,
          type: 'size_limit'
        }
      }
    }

    // 检测图表类型
    const chartType = detectChartType(code)

    // 验证节点数量
    const nodeCount = countNodes(code)
    if (nodeCount > MAX_NODES) {
      return {
        success: false,
        error: {
          message: `图表节点过多 (${nodeCount}个)，最大支持 ${MAX_NODES} 个节点`,
          type: 'node_limit'
        }
      }
    }

    // 配置主题和选项
    const mermaidConfig = buildMermaidConfig(options, chartType)

    // 生成唯一ID
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 渲染图表
    const { svg } = await mermaid.render(id, code, mermaidConfig)

    const renderTime = Date.now() - startTime

    return {
      success: true,
      svg,
      renderTime,
      nodeCount
    }
  } catch (error) {
    const renderTime = Date.now() - startTime

    return {
      success: false,
      error: parseMermaidError(error as Error, code),
      renderTime
    }
  }
}

/**
 * 验证Mermaid语法
 */
export function validateMermaid(code: string): MermaidValidationResult {
  try {
    if (!code.trim()) {
      return {
        valid: false,
        error: {
          message: '输入内容不能为空',
          type: 'syntax'
        }
      }
    }

    // 检测图表类型
    const chartType = detectChartType(code)

    // 计算节点数量
    const nodeCount = countNodes(code)

    // 基础语法检查
    const lines = code.split('\n').filter(line => line.trim())
    if (lines.length === 0) {
      return {
        valid: false,
        error: {
          message: '图表内容不能为空',
          type: 'syntax'
        }
      }
    }

    // 检查是否有有效的图表类型声明
    const hasValidType = Object.values(CHART_TYPE_PATTERNS).some(pattern => pattern.test(code))
    if (!hasValidType) {
      return {
        valid: false,
        error: {
          message: '缺少有效的图表类型声明（如：graph TD, sequenceDiagram等）',
          type: 'syntax'
        }
      }
    }

    return {
      valid: true,
      chartType,
      nodeCount
    }
  } catch (error) {
    return {
      valid: false,
      error: parseMermaidError(error as Error, code)
    }
  }
}

/**
 * 获取Mermaid统计信息
 */
export function getMermaidStats(code: string): MermaidStats {
  const chartType = detectChartType(code) || 'graph'
  const nodeCount = countNodes(code)
  const edgeCount = countEdges(code)
  const estimatedRenderTime = estimateRenderTime(nodeCount, edgeCount)

  return {
    characters: code.length,
    lines: code.split('\n').length,
    nodeCount,
    edgeCount,
    chartType,
    estimatedRenderTime
  }
}

/**
 * 检测图表类型
 */
export function detectChartType(code: string): MermaidChartType {
  for (const [type, pattern] of Object.entries(CHART_TYPE_PATTERNS)) {
    if (pattern.test(code)) {
      return type as MermaidChartType
    }
  }
  return 'graph' // 默认类型
}

/**
 * 构建Mermaid配置
 */
function buildMermaidConfig(options: MermaidRenderOptions, chartType: MermaidChartType): any {
  const config: any = {
    theme: options.theme || 'default',
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#e5e7eb',
      lineColor: '#6b7280',
      secondaryColor: '#10b981',
      tertiaryColor: '#8b5cf6'
    },
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14
  }

  // 根据图表类型添加特定配置
  if (chartType === 'flowchart' || chartType === 'graph') {
    config.flowchart = {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    }
  }

  if (chartType === 'sequence') {
    config.sequence = {
      useMaxWidth: true,
      diagramMarginX: 50,
      diagramMarginY: 10
    }
  }

  if (chartType === 'class') {
    config.class = {
      useMaxWidth: true
    }
  }

  return config
}

/**
 * 解析Mermaid错误
 */
function parseMermaidError(error: Error, code: string): MermaidError {
  const message = error.message

  // 尝试从错误消息中提取行号和列号
  const lineMatch = message.match(/at line (\d+)/)
  const positionMatch = message.match(/at position (\d+)/)

  return {
    message: `Mermaid渲染错误: ${message}`,
    type: 'render',
    line: lineMatch ? parseInt(lineMatch[1]) : undefined,
    position: positionMatch ? parseInt(positionMatch[1]) : undefined
  }
}

/**
 * 计算节点数量
 */
function countNodes(code: string): number {
  // 简化的节点计数逻辑
  const patterns = [
    /\[(.*?)\]/g,     // 节点定义: [A]
    /\((.*?)\)/g,     // 节点定义: (A)
    /\{(.*?)\}/g,     // 节点定义: {A}
    /([A-Za-z0-9_]+)(?=\s*[->\[(<])/g,  // 节点名称
    /class\s+(\w+)/gi,        // 类节点
    /state\s+(\w+)/gi,        // 状态节点
    /(\w+)\s*:/g              // 命名节点
  ]

  let count = 0
  const foundNodes = new Set<string>()

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(code)) !== null) {
      const node = match[1] || match[0]
      if (node && node.length > 0 && !foundNodes.has(node)) {
        foundNodes.add(node)
        count++
      }
    }
  }

  return count
}

/**
 * 计算边数量
 */
function countEdges(code: string): number {
  const edgePatterns = [
    /-->/g,      // 实线箭头
    /--\./g,     // 实线无箭头
    /-->|\./g,   // 虚线箭头
    /==>/g,      // 双线箭头
    /\|\|/g,     // 链接
    /o\{?\}/g,    // 一对多关系
    /\|\|/g,     // 多对一关系
  ]

  let count = 0
  for (const pattern of edgePatterns) {
    const matches = code.match(pattern)
    if (matches) {
      count += matches.length
    }
  }

  return count
}

/**
 * 检查Mermaid内容大小
 */
function checkMermaidSize(code: string): { valid: boolean; error?: string } {
  const size = new Blob([code]).size
  if (size > MAX_SIZE) {
    return {
      valid: false,
      error: `Mermaid代码过大 (${formatBytes(size)})，最大支持 ${formatBytes(MAX_SIZE)}`
    }
  }
  return { valid: true }
}

/**
 * 估算渲染时间
 */
function estimateRenderTime(nodeCount: number, edgeCount: number): number {
  // 基于节点和边数量的简单估算
  return Math.max(100, (nodeCount + edgeCount) * 2) // 毫秒
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成图表类型示例代码
 */
export function generateChartExample(type: MermaidChartType): string {
  const config = CHART_TYPE_CONFIGS[type]
  return config ? config.example : CHART_TYPE_CONFIGS.graph.example
}

/**
 * 获取支持的主题列表
 */
export function getSupportedThemes(type: MermaidChartType): MermaidTheme[] {
  // 大部分主题都支持所有图表类型
  return ['default', 'base', 'dark', 'forest', 'neutral', 'null']
}