// 导航状态持久化工具

interface NavigationStorageState {
  activeTool?: string | null
  lastAccessed?: string
  preferences?: {
    autoOpenDropdown?: boolean
    showKeyboardShortcuts?: boolean
  }
}

const STORAGE_KEY = 'navigation-state'
const STORAGE_VERSION = '1.0'

export function getStoredNavigationState(): NavigationStorageState | null {
  try {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const data = JSON.parse(stored) as NavigationStorageState & { version?: string }

    // 检查版本兼容性
    if (data.version !== STORAGE_VERSION) {
      // 清理旧版本数据
      clearStoredNavigationState()
      return null
    }

    return {
      activeTool: data.activeTool,
      lastAccessed: data.lastAccessed,
      preferences: data.preferences
    }
  } catch (error) {
    console.warn('Failed to load navigation state from storage:', error)
    return null
  }
}

export function storeNavigationState(state: Partial<NavigationStorageState>): void {
  try {
    if (typeof window === 'undefined') return

    const existingState = getStoredNavigationState() || {}
    const updatedState = {
      ...existingState,
      ...state,
      lastAccessed: new Date().toISOString(),
      version: STORAGE_VERSION
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState))
  } catch (error) {
    console.warn('Failed to save navigation state to storage:', error)
  }
}

export function clearStoredNavigationState(): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear navigation state from storage:', error)
  }
}

export function updateStoredActiveTool(toolPath: string | null): void {
  const toolName = getToolNameFromPath(toolPath)
  storeNavigationState({
    activeTool: toolName
  })
}

export function getToolNameFromPath(path: string | null): string | null {
  if (!path) return null

  if (path.startsWith('/json')) return 'json'
  if (path.startsWith('/mermaid')) return 'mermaid'
  if (path.startsWith('/markdown')) return 'markdown'

  return null
}

export function getStoredPreferences(): NonNullable<NavigationStorageState['preferences']> {
  const state = getStoredNavigationState()
  return {
    autoOpenDropdown: false,
    showKeyboardShortcuts: true,
    ...state?.preferences
  }
}

export function updateStoredPreferences(preferences: Partial<NavigationStorageState['preferences']>): void {
  const currentState = getStoredNavigationState() || {}
  const updatedPreferences = {
    ...currentState.preferences,
    ...preferences
  }

  storeNavigationState({
    ...currentState,
    preferences: updatedPreferences
  })
}