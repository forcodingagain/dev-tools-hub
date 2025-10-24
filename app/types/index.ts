export interface ToolConfig {
  id: string
  name: string
  description: string
  icon: string
  path: string
  color: string
}

export interface JsonResponse {
  formatted: string
  error?: string
  isValid: boolean
}

export interface MermaidConfig {
  theme: 'default' | 'dark' | 'forest' | 'neutral'
  maxNodes: number
}

export interface MarkdownConfig {
  convertToHtml: boolean
  convertToImage: boolean
  convertToText: boolean
}

export type ToolType = 'json' | 'mermaid' | 'markdown'