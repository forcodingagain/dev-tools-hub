# API Endpoints Contract: 在线工具库

**Feature**: 在线工具库
**Version**: 1.0
**Date**: 2025-01-24

## API 概述

基于纯客户端处理的设计，本应用主要使用 Remix 的 API Routes 来处理一些必要的客户端交互，如复制到剪贴板、用户偏好设置等。所有核心工具功能都在客户端本地处理。

## API 端点列表

### 1. 工具管理 API

#### GET /api/tools
获取所有可用工具列表

**请求**: 无参数

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "json",
      "name": "JSON在线工具",
      "description": "JSON格式化和验证工具",
      "route": "/json",
      "icon": "code",
      "features": ["格式化", "验证", "错误提示", "复制结果"]
    },
    {
      "id": "mermaid",
      "name": "Mermaid在线工具",
      "description": "图表绘制和预览工具",
      "route": "/mermaid",
      "icon": "diagram",
      "features": ["流程图", "时序图", "类图", "实时预览"]
    },
    {
      "id": "markdown",
      "name": "Markdown在线工具",
      "description": "Markdown预览和转换工具",
      "route": "/markdown",
      "icon": "file-text",
      "features": ["预览", "HTML转换", "图片转换", "文本转换"]
    }
  ]
}
```

#### GET /api/tools/:id
获取特定工具信息

**路径参数**:
- `id`: 工具ID (json | mermaid | markdown)

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "json",
    "name": "JSON在线工具",
    "description": "JSON格式化和验证工具",
    "route": "/json",
    "icon": "code",
    "limits": {
      "maxSize": "5MB",
      "maxProcessingTime": "2s"
    },
    "features": [
      {
        "name": "格式化",
        "description": "美化JSON格式，添加缩进和换行"
      },
      {
        "name": "验证",
        "description": "检查JSON语法错误并提供详细错误信息"
      },
      {
        "name": "复制",
        "description": "一键复制格式化结果到剪贴板"
      }
    ]
  }
}
```

### 2. 剪贴板 API

#### POST /api/clipboard/copy
复制文本到剪贴板（作为后备方案）

**请求体**:
```json
{
  "text": "要复制的文本内容"
}
```

**响应**:
```json
{
  "success": true,
  "message": "已复制到剪贴板"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "CLIPBOARD_ERROR",
  "message": "无法访问剪贴板，请手动复制"
}
```

### 3. 用户偏好 API

#### GET /api/preferences
获取用户偏好设置

**响应**:
```json
{
  "success": true,
  "data": {
    "ui": {
      "darkMode": false,
      "language": "zh-CN"
    },
    "json": {
      "indent": 2,
      "sortKeys": false,
      "trailingComma": false
    },
    "mermaid": {
      "theme": "default",
      "fontSize": 16,
      "fontFamily": "Arial"
    },
    "markdown": {
      "ghCodeBlocks": true,
      "tasklists": true,
      "tables": true,
      "emoji": true
    }
  }
}
```

#### PUT /api/preferences
更新用户偏好设置

**请求体**:
```json
{
  "ui": {
    "darkMode": true,
    "language": "zh-CN"
  },
  "json": {
    "indent": 4,
    "sortKeys": true
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "偏好设置已保存"
}
```

### 4. 性能监控 API

#### POST /api/analytics/performance
记录性能指标（可选，用于性能优化）

**请求体**:
```json
{
  "tool": "json",
  "action": "format",
  "inputSize": 1024,
  "processingTime": 150,
  "success": true,
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-01-24T10:30:00Z"
}
```

**响应**:
```json
{
  "success": true,
  "message": "性能数据已记录"
}
```

### 5. 错误报告 API

#### POST /api/error/report
提交错误报告（可选）

**请求体**:
```json
{
  "tool": "mermaid",
  "error": {
    "type": "RENDER_ERROR",
    "message": "Chart rendering failed",
    "details": "Invalid node definition at line 5",
    "stack": "Error: ...",
    "input": "graph TD\\nA --> B\\ninvalid syntax"
  },
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-01-24T10:30:00Z",
  "userConsent": true
}
```

**响应**:
```json
{
  "success": true,
  "reportId": "err_20250124_103000_abc123",
  "message": "错误报告已提交，感谢您的反馈"
}
```

## HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功处理 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 404 | Not Found | 资源不存在 |
| 413 | Payload Too Large | 请求数据过大 |
| 429 | Too Many Requests | 请求频率过高 |
| 500 | Internal Server Error | 服务器内部错误 |

## 错误响应格式

### 标准错误响应

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "用户友好的错误消息",
  "details": {
    "field": "具体错误字段",
    "reason": "错误原因说明"
  },
  "suggestions": [
    "建议的解决方案1",
    "建议的解决方案2"
  ]
}
```

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| INVALID_TOOL_ID | 无效的工具ID | 检查工具ID是否正确 |
| PAYLOAD_TOO_LARGE | 请求数据过大 | 减小输入数据大小 |
| CLIPBOARD_ERROR | 剪贴板访问失败 | 使用手动复制 |
| VALIDATION_ERROR | 输入验证失败 | 检查输入格式 |
| PROCESSING_TIMEOUT | 处理超时 | 简化输入内容 |

## 请求头

### 客户端请求头

```http
Content-Type: application/json
Accept: application/json
User-Agent: Mozilla/5.0 (Online Tools)
X-Tool-Version: 1.0.0
```

### 服务端响应头

```http
Content-Type: application/json
Cache-Control: no-cache, no-store, must-revalidate
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 安全考虑

### 1. 输入验证
- 所有API输入都进行严格验证
- 限制请求体大小（最大10MB）
- 防止XSS和注入攻击

### 2. 访问控制
- 无需身份验证（纯客户端应用）
- 限制请求频率（每IP每分钟最多100次）
- CORS策略仅允许同源访问

### 3. 数据隐私
- 不记录用户输入的敏感数据
- 性能监控数据匿名化处理
- 错误报告需要用户明确同意

## 性能要求

### 响应时间要求
- 工具列表API: < 100ms
- 偏好设置API: < 50ms
- 剪贴板API: < 200ms

### 缓存策略
- 工具列表: 静态缓存24小时
- 偏好设置: 浏览器本地存储
- 错误信息: 内存缓存1小时

## 客户端集成示例

### React 集成示例

```typescript
// 获取工具列表
const fetchTools = async () => {
  try {
    const response = await fetch('/api/tools');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    return [];
  }
};

// 更新偏好设置
const updatePreferences = async (preferences: UserPreferences) => {
  try {
    const response = await fetch('/api/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return false;
  }
};
```

这个API契约为在线工具库提供了完整的API接口定义，支持工具管理、用户偏好、剪贴板操作和错误报告等功能。