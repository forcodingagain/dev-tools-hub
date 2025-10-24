export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ToolApiResponse extends ApiResponse {
  data?: {
    result?: string
    output?: string
    exportData?: string
  }
}

export interface ValidationError {
  line: number
  column: number
  message: string
  type: 'error' | 'warning'
}

export interface ProcessingStatus {
  processing: boolean
  progress: number
  stage: string
}