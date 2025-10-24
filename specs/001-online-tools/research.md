# Phase 0: 技术研究文档

**Feature**: 在线工具库
**Date**: 2025-01-24
**Branch**: 001-online-tools

## 技术决策研究

### 1. Remix 框架选择

**决策**: 使用 Remix 作为全栈框架

**原因**:
- 支持 API 路由功能，完全符合"后端接口全部使用remix的API Router"要求
- 内置文件路由系统，简化导航管理
- 支持服务端渲染和客户端渲染，满足性能要求
- 与 TypeScript 集成良好，支持类型安全

**关键特性**:
- API Routes: `/routes/api/*.ts` 自动作为API端点
- Resource Routes: 支持文件处理和数据导出
- 内置错误处理和加载状态
- 优化数据获取模式

**考虑的替代方案**: Next.js 13+ App Router
**拒绝原因**: 虽然Next.js也很强大，但Remix的API路由设计更符合纯客户端数据处理要求

### 2. TailwindCSS + shadcn/ui 组合

**决策**: 使用 TailwindCSS + shadcn/ui 作为UI解决方案

**原因**:
- shadcn/ui 基于 Radix UI，提供完整的可访问性支持
- 与 TailwindCSS 完美集成，支持原子级样式定制
- 组件库覆盖表单、按钮、输入等所有需要的UI元素
- 支持响应式设计，符合宪法VI.响应式设计原则

**shadcn/ui 核心组件**:
- Button, Input, Form components 用于JSON和Markdown工具
- DropdownMenu 用于导航下拉菜单
- Card 组件用于首页工具卡片
- Textarea, Label 用于多行输入

**响应式设计策略**:
- 移动优先设计方法
- 使用 Tailwind 响应式前缀 (`sm:`, `md:`, `lg:`)
- 支持容器查询 (`@container`) 用于复杂布局

### 3. JSON 处理技术

**决策**: 使用原生 JavaScript JSON API

**原因**:
- 浏览器原生支持，无需额外依赖
- 性能优秀，符合2秒处理要求
- 支持错误处理和格式化
- 完全客户端处理，符合数据安全要求

**实现方案**:
- `JSON.parse()` 和 `JSON.stringify()` 用于解析和格式化
- `JSON.stringify(data, null, 2)` 用于美化输出
- try-catch 错误处理和渐进式降级

**性能优化**:
- 流式处理大型JSON文件 (>1MB)
- Web Workers 用于后台处理 (>2MB文件)
- 内存管理避免浏览器崩溃

### 4. Mermaid 图表渲染

**决策**: 使用 Mermaid.js 客户端渲染

**原因**:
- 纯JavaScript实现，无需服务器依赖
- 支持10+种图表类型（流程图、时序图、类图等）
- 实时预览功能
- 社区活跃，维护良好

**性能考虑**:
- 图表节点限制：200个节点（符合规格要求）
- 使用防抖技术优化实时渲染
- 错误边界处理渲染失败情况
- 渐进式降级保留基础功能

**支持的图表类型**:
- 流程图 (flowchart)
- 时序图 (sequence)
- 类图 (class)
- 状态图 (state)
- 实体关系图 (er)
- 甘特图 (gantt)
- 饼图 (pie)
- 用户旅程图 (journey)
- Git图 (git)
- 架构图 (architecture)

### 5. Markdown 处理方案

**决策**: 使用 Showdown.js + html2canvas 组合

**原因**:
- Showdown.js: 轻量级Markdown到HTML转换器
- html2canvas: HTML转图片解决方案
- 完全客户端处理，符合安全要求
- 支持实时预览

**Markdown 预览**:
- Showdown.js 进行语法解析
- 实时转换显示
- 支持标准Markdown和扩展语法

**格式转换**:
- HTML输出: Showdown.js 直接生成
- TXT输出: 简单的HTML标签清理
- 图片输出: html2canvas 捕获渲染结果

**性能限制**:
- 文档大小限制：500KB
- 转换时间：5秒内完成
- 内存管理：及时清理临时DOM

### 6. 项目架构设计

**结构决策**: 单体应用架构

**原因**:
- 符合极度简洁原则
- 避免过度工程化
- 易于部署和维护
- 性能优化更容易

**目录结构**:
```
src/
├── components/           # shadcn/ui 组件
├── routes/              # Remix 路由文件
│   ├── _index.tsx       # 首页
│   ├── json.tsx         # JSON工具页
│   ├── mermaid.tsx      # Mermaid工具页
│   └── markdown.tsx     # Markdown工具页
├── lib/                 # 工具函数
│   ├── json.ts          # JSON处理逻辑
│   ├── mermaid.ts       # Mermaid集成
│   └── markdown.ts      # Markdown处理
├── styles/              # Tailwind配置
└── types/               # TypeScript类型定义
```

### 7. 性能优化策略

**冷启动优化**:
- 代码分割：按页面拆分JavaScript
- 懒加载：Mermaid和Markdown库按需加载
- 预加载：首页资源优先加载
- 缓存策略：静态资源缓存

**运行时性能**:
- 防抖处理：用户输入防抖减少计算
- Web Workers：大数据处理移至后台线程
- 内存管理：及时清理不需要的对象
- 虚拟化：大型列表使用虚拟滚动

### 8. 错误处理策略

**渐进式降级实现**:
1. **检测机制**: try-catch 包装核心功能
2. **错误分类**: 语法错误、内存错误、渲染错误
3. **降级策略**:
   - 语法错误：显示错误详情和修复建议
   - 内存错误：建议分割数据并启用基础功能
   - 渲染错误：回退到文本显示

**用户反馈**:
- 技术性错误信息（面向开发者用户）
- 建议修复方案
- 保留基础功能可用性

## 技术栈总结

- **框架**: Remix (全栈)
- **样式**: TailwindCSS + shadcn/ui
- **类型安全**: TypeScript
- **JSON处理**: 原生 JavaScript JSON API
- **图表**: Mermaid.js
- **Markdown**: Showdown.js + html2canvas
- **测试**: Vitest + React Testing Library
- **构建**: Vite (Remix内置)

## 依赖版本要求

基于2025年1月的最新稳定版本：

```json
{
  "remix": "^2.8.0",
  "@remix-run/node": "^2.8.0",
  "@remix-run/react": "^2.8.0",
  "tailwindcss": "^3.4.0",
  "shadcn/ui": "^0.9.0",
  "mermaid": "^10.6.0",
  "showdown": "^2.1.0",
  "html2canvas": "^1.4.0",
  "typescript": "^5.3.0",
  "vitest": "^1.2.0"
}
```

## 宪法合规性检查

✅ **极度简洁原则**: 单体架构，避免过度复杂性
✅ **测试优先开发**: 所有功能优先编写测试
✅ **冷启动性能**: 通过代码分割和懒加载实现<2秒启动
✅ **代码质量一致**: TypeScript + ESLint + Prettier
✅ **用户体验一致**: shadcn/ui统一设计系统
✅ **响应式设计**: TailwindCSS移动优先响应式支持