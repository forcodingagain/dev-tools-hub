export interface NavigationState {
  isDropdownOpen: boolean
  activeTool: string | null
  isHovering: boolean
}

export interface NavigationItem {
  id: string
  name: string
  path: string
  icon: string
  description: string
}

export interface NavigationDropdownPosition {
  top: number
  left: number
  width: number
}

export interface NavigationAction {
  type: 'OPEN_DROPDOWN' | 'CLOSE_DROPDOWN' | 'SET_ACTIVE_TOOL' | 'SET_HOVERING'
  payload?: any
}

export interface NavigationContext {
  state: NavigationState
  dispatch: React.Dispatch<NavigationAction>
  dropdownRef: React.RefObject<HTMLDivElement>
  menuItemRef: React.RefObject<HTMLButtonElement>
}

export interface UseNavigationReturn {
  isDropdownOpen: boolean
  activeTool: string | null
  isHovering: boolean
  openDropdown: () => void
  closeDropdown: () => void
  toggleDropdown: () => void
  setActiveTool: (toolId: string) => void
  setHovering: (hovering: boolean) => void
}