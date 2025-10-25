/**
 * Mermaid图表类型
 */
export type MermaidChartType =
  | 'flowchart'      // 流程图
  | 'sequence'       // 时序图
  | 'class'          // 类图
  | 'state'          // 状态图
  | 'entity'         // 实体关系图
  | 'gantt'          // 甘特图
  | 'pie'            // 饼图
  | 'journey'        // 用户旅程图
  | 'git'            // Git图
  | 'er'             // ER图
  | 'graph'          // 普通图表

/**
 * Mermaid主题
 */
export type MermaidTheme =
  | 'default'
  | 'base'
  | 'dark'
  | 'forest'
  | 'neutral'
  | 'null'

/**
 * Mermaid渲染选项
 */
export interface MermaidRenderOptions {
  /** 图表类型 */
  type?: MermaidChartType
  /** 主题 */
  theme?: MermaidTheme
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否显示网格 */
  grid?: boolean
  /** 流程图方向 */
  direction?: 'TB' | 'BT' | 'LR' | 'RL'
  /** 是否自动布局 */
  autoLayout?: boolean
}

/**
 * Mermaid渲染结果
 */
export interface MermaidRenderResult {
  /** 是否成功 */
  success: boolean
  /** SVG内容 */
  svg?: string
  /** 错误信息 */
  error?: MermaidError
  /** 渲染时间（毫秒） */
  renderTime?: number
  /** 节点数量 */
  nodeCount?: number
}

/**
 * Mermaid错误信息
 */
export interface MermaidError {
  /** 错误消息 */
  message: string
  /** 错误类型 */
  type: 'syntax' | 'render' | 'node_limit' | 'size_limit'
  /** 错误所在行数 */
  line?: number
  /** 错误所在列数 */
  column?: number
  /** 错误位置 */
  position?: number
}

/**
 * Mermaid验证结果
 */
export interface MermaidValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  error?: MermaidError
  /** 图表类型 */
  chartType?: MermaidChartType
  /** 节点数量 */
  nodeCount?: number
}

/**
 * Mermaid统计信息
 */
export interface MermaidStats {
  /** 字符数 */
  characters: number
  /** 行数 */
  lines: number
  /** 节点数量 */
  nodeCount: number
  /** 边数量 */
  edgeCount: number
  /** 图表类型 */
  chartType: MermaidChartType
  /** 预估渲染时间 */
  estimatedRenderTime: number
}

/**
 * Mermaid工具状态
 */
export interface MermaidToolState {
  /** 输入的Mermaid代码 */
  input: string
  /** 渲染结果 */
  output: string
  /** 是否正在渲染 */
  rendering: boolean
  /** 验证结果 */
  validation: MermaidValidationResult
  /** 渲染选项 */
  options: MermaidRenderOptions
  /** 错误信息 */
  error?: string
  /** 统计信息 */
  stats?: MermaidStats
  /** SVG导出 */
  svgExport?: string
}

/**
 * Mermaid工具动作类型
 */
export type MermaidToolAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_OUTPUT'; payload: string }
  | { type: 'SET_RENDERING'; payload: boolean }
  | { type: 'SET_VALIDATION'; payload: MermaidValidationResult }
  | { type: 'SET_OPTIONS'; payload: Partial<MermaidRenderOptions> }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SET_STATS'; payload?: MermaidStats }
  | { type: 'SET_SVG_EXPORT'; payload?: string }
  | { type: 'RENDER_MERMAID' }
  | { type: 'VALIDATE_MERMAID' }
  | { type: 'EXPORT_SVG' }
  | { type: 'COPY_SVG' }
  | { type: 'RESET' }

/**
 * 图表类型配置
 */
export interface ChartTypeConfig {
  /** 显示名称 */
  name: string
  /** 描述 */
  description: string
  /** 示例代码 */
  example: string
  /** 支持的主题 */
  supportedThemes: MermaidTheme[]
  /** 最大推荐节点数 */
  maxNodes?: number
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 格式 */
  format: 'svg' | 'png' | 'jpg'
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 背景 */
  backgroundColor?: string
  /** 质量（针对图片） */
  quality?: number
}