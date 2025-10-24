# Data Model: 在线工具库

**Feature**: 在线工具库
**Date**: 2025-01-24
**Version**: 1.0

## 数据模型概述

基于纯客户端处理的设计原则，所有数据都在浏览器中临时处理，不涉及服务器端数据存储。本文档定义各工具的输入数据结构、处理状态和输出格式。

## 核心实体

### 1. 工具状态 (ToolState)

```typescript
interface ToolState {
  id: string;                    // 工具唯一标识符
  name: string;                  // 工具名称
  type: 'json' | 'mermaid' | 'markdown';  // 工具类型
  status: 'idle' | 'processing' | 'success' | 'error';  // 处理状态
  error?: string;                // 错误信息（技术详情）
  lastUpdated: Date;             // 最后更新时间
  inputSize: number;             // 输入数据大小（字节）
  processingTime?: number;       // 处理耗时（毫秒）
}
```

### 2. JSON 处理器 (JsonProcessor)

```typescript
interface JsonProcessorState {
  rawInput: string;              // 原始JSON字符串
  formattedOutput?: string;      // 格式化后的JSON
  isValid: boolean;              // JSON有效性
  error?: JsonError;             // 错误详情
  formatOptions: JsonFormatOptions;  // 格式化选项
}

interface JsonFormatOptions {
  indent: number;                // 缩进空格数（默认2）
  sortKeys: boolean;             // 是否排序键名
  trailingComma: boolean;        // 是否添加尾随逗号
}

interface JsonError {
  line: number;                  // 错误行号
  column: number;                // 错误列号
  message: string;               // 错误描述
  position: number;              // 错误位置
}
```

### 3. Mermaid 渲染器 (MermaidRenderer)

```typescript
interface MermaidRendererState {
  code: string;                  // Mermaid代码输入
  renderedSvg?: string;          // 渲染的SVG输出
  isValid: boolean;              // 代码有效性
  error?: MermaidError;          // 错误详情
  nodeCount: number;             // 节点数量
  chartType: MermaidChartType;   // 图表类型
  renderOptions: MermaidRenderOptions;  // 渲染选项
}

type MermaidChartType =
  | 'flowchart'    // 流程图
  | 'sequence'     // 时序图
  | 'class'        // 类图
  | 'state'        // 状态图
  | 'er'           // 实体关系图
  | 'gantt'        // 甘特图
  | 'pie'          // 饼图
  | 'journey'      // 用户旅程图
  | 'git'          // Git图
  | 'architecture'; // 架构图

interface MermaidRenderOptions {
  theme: 'default' | 'dark' | 'forest' | 'neutral';  // 主题
  backgroundColor: string;  // 背景色
  fontSize: number;              // 字体大小
  fontFamily: string;           // 字体族
}

interface MermaidError {
  message: string;               // 错误消息
  line: number;                  // 错误行号
  str: string;                   // 错误代码片段
  hash: string;                  // 错误哈希
}
```

### 4. Markdown 处理器 (MarkdownProcessor)

```typescript
interface MarkdownProcessorState {
  rawInput: string;              // 原始Markdown文本
  htmlOutput?: string;            // HTML输出
  textOutput?: string;            // 纯文本输出
  imageOutput?: string;           // 图片输出（Base64）
  isValid: boolean;              // 输入有效性
  error?: MarkdownError;          // 错误详情
  conversionOptions: MarkdownConversionOptions;  // 转换选项
}

interface MarkdownConversionOptions {
  ghCodeBlocks: boolean;         // GitHub风格代码块
  ghCompatibleId: boolean;       // GitHub兼容ID
  ghMentions: boolean;           // GitHub提及
  ghMentionsLink: boolean;       // GitHub提及链接
  tasklists: boolean;            // 任务列表
  strikethrough: boolean;         // 删除线
  tables: boolean;               // 表格
  emoji: boolean;                // 表情符号
  underline: boolean;            // 下划线
  highlight: boolean;            // 高亮
  subscript: boolean;            // 下标
  superscript: boolean;          // 上标
}

interface MarkdownError {
  message: string;               // 错误消息
  position: number;              // 错误位置
  line: number;                  // 错误行号
}
```

## 导航系统模型

### 导航菜单状态 (NavigationState)

```typescript
interface NavigationState {
  activeTool: string | null;     // 当前激活的工具
  isDropdownOpen: boolean;        // 下拉菜单是否打开
  dropdownPosition: DropdownPosition;  // 下拉菜单位置
}

interface DropdownPosition {
  top: number;                   // 距离顶部像素
  left: number;                  // 距离左侧像素
  width: number;                 // 菜单宽度
}
```

### 工具路由 (ToolRoute)

```typescript
interface ToolRoute {
  path: string;                  // 路由路径
  name: string;                  // 显示名称
  description: string;           // 工具描述
  icon: string;                  // 图标名称
  component: string;             // 组件路径
}
```

## 用户界面状态

### 首页状态 (HomePageState)

```typescript
interface HomePageState {
  toolCards: ToolCard[];         // 工具卡片列表
  isLoading: boolean;            // 加载状态
  featuredTool?: string;         // 特色工具
}

interface ToolCard {
  id: string;                    // 卡片ID
  title: string;                 // 标题
  description: string;           // 描述
  icon: string;                  // 图标
  route: string;                 // 路由路径
  features: string[];            // 特性列表
}
```

### 通用UI状态 (CommonUIState)

```typescript
interface CommonUIState {
  isDarkMode: boolean;           // 深色模式
  isMobile: boolean;             // 移动设备检测
  isOnline: boolean;             // 网络状态
  viewport: Viewport;             // 视口信息
}

interface Viewport {
  width: number;                 // 视口宽度
  height: number;                // 视口高度
  orientation: 'portrait' | 'landscape';  // 屏幕方向
}
```

## 数据流和转换

### JSON 数据流

```typescript
// 输入验证
type JsonInputValidation = {
  isValid: boolean;
  size: number;                  // 文件大小
  lineCount: number;             // 行数
  complexity: 'simple' | 'medium' | 'complex';
};

// 格式化结果
type JsonFormatResult = {
  success: boolean;
  formatted: string | null;
  error: JsonError | null;
  stats: {
    originalSize: number;
    formattedSize: number;
    processingTime: number;
  };
};
```

### Mermaid 数据流

```typescript
// 代码分析
type MermaidCodeAnalysis = {
  chartType: MermaidChartType;
  nodeCount: number;
  edgeCount: number;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedRenderTime: number;
};

// 渲染结果
type MermaidRenderResult = {
  success: boolean;
  svg: string | null;
  error: MermaidError | null;
  stats: {
    codeSize: number;
    renderTime: number;
    svgSize: number;
  };
};
```

### Markdown 数据流

```typescript
// 内容分析
type MarkdownAnalysis = {
  wordCount: number;
  lineCount: number;
  hasCodeBlocks: boolean;
  hasTables: boolean;
  hasImages: boolean;
  complexity: 'simple' | 'medium' | 'complex';
};

// 转换结果
type MarkdownConversionResult = {
  html: string | null;
  text: string | null;
  image: string | null;           // Base64
  errors: MarkdownError[];
  stats: {
    originalSize: number;
    htmlSize: number;
    textSize: number;
    imageSize: number;
    conversionTime: number;
  };
};
```

## 状态管理策略

### 本地状态管理

```typescript
interface AppState {
  navigation: NavigationState;
  currentTool: {
    json?: JsonProcessorState;
    mermaid?: MermaidRendererState;
    markdown?: MarkdownProcessorState;
  };
  ui: CommonUIState;
  performance: PerformanceMetrics;
}

interface PerformanceMetrics {
  pageLoadTime: number;          // 页面加载时间
  toolProcessingTime: Record<string, number>;  // 工具处理时间
  memoryUsage: number;            // 内存使用量
  errorRate: number;              // 错误率
}
```

### 数据持久化

```typescript
// 仅保存用户偏好，不保存敏感数据
interface UserPreferences {
  jsonFormat: JsonFormatOptions;
  mermaidTheme: string;
  markdownOptions: MarkdownConversionOptions;
  ui: {
    darkMode: boolean;
    autoSave: boolean;
  };
}
```

## 约束和验证规则

### 输入约束

```typescript
const CONSTRAINTS = {
  JSON: {
    MAX_SIZE: 5 * 1024 * 1024,  // 5MB
    MAX_LINE_COUNT: 100000,      // 10万行
    PROCESSING_TIMEOUT: 2000,   // 2秒
  },
  MERMAID: {
    MAX_NODES: 200,             // 200个节点
    MAX_EDGES: 500,             // 500条边
    PROCESSING_TIMEOUT: 3000,   // 3秒
  },
  MARKDOWN: {
    MAX_SIZE: 500 * 1024,       // 500KB
    MAX_LINE_COUNT: 10000,      // 1万行
    CONVERSION_TIMEOUT: 5000,   // 5秒
  }
};
```

### 验证规则

```typescript
interface ValidationRule {
  name: string;
  validator: (input: any) => ValidationResult;
  errorMessage: string;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}
```

## 错误处理模型

### 错误分类

```typescript
type ErrorType =
  | 'VALIDATION_ERROR'     // 输入验证错误
  | 'PROCESSING_ERROR'    // 处理过程错误
  | 'MEMORY_ERROR'        // 内存不足错误
  | 'TIMEOUT_ERROR'        // 超时错误
  | 'RENDER_ERROR'         // 渲染错误
  | 'NETWORK_ERROR'        // 网络错误（虽然不应该发生）
  | 'UNKNOWN_ERROR';       // 未知错误

interface AppError {
  type: ErrorType;
  message: string;
  technicalDetails: string;
  userMessage: string;
  suggestions: string[];
  recoveryActions: RecoveryAction[];
}

interface RecoveryAction {
  label: string;
  action: () => void;
  isAutomatic: boolean;
}
```

这个数据模型为在线工具库提供了完整的数据结构定义，支持纯客户端处理、错误恢复和渐进式降级功能。