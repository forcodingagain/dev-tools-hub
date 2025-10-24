import type { NavigationState, NavigationAction } from '../types/navigation'

export const initialNavigationState: NavigationState = {
  isDropdownOpen: false,
  activeTool: null,
  isHovering: false,
}

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case 'OPEN_DROPDOWN':
      return {
        ...state,
        isDropdownOpen: true,
      }
    case 'CLOSE_DROPDOWN':
      return {
        ...state,
        isDropdownOpen: false,
      }
    case 'SET_ACTIVE_TOOL':
      return {
        ...state,
        activeTool: action.payload,
      }
    case 'SET_HOVERING':
      return {
        ...state,
        isHovering: action.payload,
      }
    default:
      return state
  }
}