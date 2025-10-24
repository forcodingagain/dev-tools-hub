export interface JsonToolState {
  input: string
  output: string
  error: string
  isValid: boolean
  processing: boolean
  formatOptions: {
    indent: number | string
    sortKeys: boolean
  }
}

export interface MermaidToolState {
  input: string
  error: string
  processing: boolean
  config: {
    theme: 'default' | 'dark' | 'forest' | 'neutral'
    maxNodes: number
  }
  svgOutput?: string
  nodeCount: number
}

export interface MarkdownToolState {
  input: string
  htmlOutput: string
  processing: boolean
  config: {
    convertToHtml: boolean
    convertToImage: boolean
    convertToText: boolean
  }
  textOutput?: string
}

export interface ToolError {
  type: 'syntax' | 'size' | 'processing' | 'unknown'
  message: string
  details?: any
  recovery?: string
}