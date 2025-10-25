# 在线工具库

![在线工具库](/public/images/web.png)

> 专为开发者打造的一站式在线工具集合，提供 JSON 格式化、Mermaid 图表绘制、Markdown 预览转换等常用工具

## ✨ 功能特性

- 🚀 **高性能**: 基于 Remix 2.8+ 框架，支持 SSR 和 HMR
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🎨 **现代化 UI**: 使用 TailwindCSS 3.4+ 和 shadcn/ui 组件
- ♿ **无障碍访问**: 符合 WCAG 标准的可访问性设计
- 🔒 **数据安全**: 所有数据本地处理，不上传到服务器
- ⚡ **实时处理**: 支持实时预览和错误提示

## 🛠️ 在线工具

### 1. JSON 在线工具

- ✅ JSON 格式化和美化public
- ✅ JSON 语法验证
- ✅ 键字母排序
- ✅ JSON 压缩
- ✅ 复制到剪贴板
- ✅ 错误位置定位

### 2. Mermaid 在线工具

支持多种图表类型的绘制和导出：

- 📊 流程图 (Flowchart)
- ⏱️ 时序图 (Sequence Diagram)
- 📋 类图 (Class Diagram)
- 🔀 状态图 (State Diagram)
- 📦 实体关系图 (ER Diagram)
- 📈 甘特图 (Gantt Chart)
- 🥧 饼图 (Pie Chart)
- 🛤️ 用户旅程图 (User Journey)
- 🌲 Git 图 (Git Graph)
- 📊 ER 图 (ER Diagram)
- 📈 普通图表

### 3. Markdown 在线工具

- 📝 支持完整的 Markdown 语法
- 👀 实时预览渲染效果
- 🎨 多种主题样式支持
- 📄 HTML 导出功能
- 🖼️ PNG/JPG 图片导出
- 📄 纯文本转换
- 📋 复制到剪贴板

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
# 默认端口 5000
npm run dev

# 指定端口
npm run dev:port 8000
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
# 默认端口 5000
npm run start

# 指定端口
npm run start:port 8000
```

### 其他命令

```bash
# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 自动修复代码格式
npm run lint:fix

# 代码格式化
npm run format

# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

## 📁 项目结构

```
tools-remix/
├── app/                          # 应用程序源码
│   ├── components/               # React 组件
│   │   ├── ui/                  # UI 基础组件
│   │   ├── layout/              # 布局组件
│   │   ├── JsonFormatter.tsx    # JSON 格式化组件
│   │   ├── MermaidDiagram.tsx   # Mermaid 图表组件
│   │   └── MarkdownPreview.tsx  # Markdown 预览组件
│   ├── lib/                     # 工具库
│   │   ├── accessibility.ts      # 可访问性工具
│   │   ├── browserCompatibility.ts # 浏览器兼容性
│   │   ├── format.ts            # 格式化工具
│   │   ├── mermaid.ts           # Mermaid 相关工具
│   │   └── ...
│   ├── routes/                  # 路由页面
│   │   ├── _index.tsx           # 首页
│   │   ├── json.tsx             # JSON 工具页面
│   │   ├── mermaid.tsx          # Mermaid 工具页面
│   │   ├── markdown.tsx         # Markdown 工具页面
│   │   └── $.tsx               # 捕获所有路由
│   ├── styles/                  # 样式文件
│   │   ├── globals.css          # 全局样式
│   │   ├── accessibility.css    # 可访问性样式
│   │   └── ...
│   └── types/                   # TypeScript 类型定义
├── public/                      # 静态资源
├── docs/                        # 文档
├── tests/                       # 测试文件
├── scripts/                     # 脚本文件
├── package.json                 # 项目配置
├── remix.config.js              # Remix 配置
└── README.md                    # 项目说明
```

## 🛠️ 技术栈

### 核心框架

- **Remix 2.8+** - 全栈 React 框架
- **TypeScript 5.3+** - 类型安全的 JavaScript
- **React 18.3+** - 用户界面库

### 样式和UI

- **TailwindCSS 3.4+** - 原子 CSS 框架
- **shadcn/ui 0.9+** - 高质量 UI 组件库
- **Radix UI** - 无障碍的原始组件

### 工具库

- **Mermaid.js 10.6+** - 图表绘制库
- **Showdown.js 2.1+** - Markdown 解析器
- **html2canvas** - Canvas 转图片工具

### 开发工具

- **Vite 6.4+** - 构建工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Vitest** - 单元测试框架

## 🎯 核心特性

### 实时处理

- 所有工具都支持实时预览和编辑
- 智能错误提示和语法高亮
- 自动保存和恢复工作状态

### 数据安全

- 所有数据在浏览器本地处理
- 不会向服务器发送任何敏感信息
- 支持大型文件处理（有合理的文件大小限制）

### 用户体验

- 现代化的界面设计
- 完整的键盘导航支持
- 深色/浅色主题切换（部分工具）
- 响应式布局适配各种设备

### 性能优化

- 代码分割和懒加载
- 服务端渲染 (SSR)
- 客户端 hydration
- 静态资源优化

## 📊 性能指标

- **首次内容绘制 (FCP)**: < 1.5s
- **最大内容绘制 (LCP)**: < 2.5s
- **累积布局偏移 (CLS)**: < 0.1
- **首次输入延迟 (FID)**: < 100ms

## 🔧 开发指南

### 添加新工具

1. 在 `app/routes/` 目录下创建新的路由文件
2. 在 `app/components/` 下创建对应组件
3. 在 `app/lib/` 下添加工具相关逻辑
4. 更新首页链接

### 样式规范

- 使用 Tailwind CSS 工具类
- 遵循 shadcn/ui 组件设计规范
- 保持一致的颜色主题和间距

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm run test

# 生成测试覆盖率报告
npm run test:coverage

# 交互式测试界面
npm run test:ui
```

### 测试覆盖

- 单元测试
- 集成测试
- E2E 测试
- 可访问性测试

## 📝 更新日志

### v1.0.0 (2025-10-25)

- ✨ 初始版本发布
- 🛠️ 集成 JSON、Mermaid、Markdown 三个核心工具
- 🎨 实现现代化响应式界面
- ♿ 完善可访问性支持
- ⚡ 优化性能和用户体验

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [Remix](https://remix.run/) 团队提供的优秀框架
- 感谢 [Mermaid](https://mermaid.js.org/) 提供强大的图表绘制能力
- 感谢 [Showdown](https://github.com/showdownjs/showdown) 提供可靠的 Markdown 解析
- 感谢 [Tailwind CSS](https://tailwindcss.com/) 和 [shadcn/ui](https://ui.shadcn.com/) 提供的现代化 UI 解决方案
