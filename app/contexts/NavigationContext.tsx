import React, { createContext, useContext, useReducer, useRef } from 'react'
import type { NavigationContext, NavigationAction } from '../types/navigation'
import { initialNavigationState, navigationReducer } from '../lib/navigation-reducer'

const NavigationContext = createContext<NavigationContext | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, initialNavigationState)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuItemRef = useRef<HTMLButtonElement>(null)

  const context: NavigationContext = {
    state,
    dispatch,
    dropdownRef,
    menuItemRef,
  }

  return (
    <NavigationContext.Provider value={context}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export function useNavigationActions() {
  const { dispatch } = useNavigation()

  const openDropdown = () => {
    dispatch({ type: 'OPEN_DROPDOWN' })
  }

  const closeDropdown = () => {
    dispatch({ type: 'CLOSE_DROPDOWN' })
  }

  const toggleDropdown = () => {
    dispatch({ type: 'OPEN_DROPDOWN' })
  }

  const setActiveTool = (toolId: string) => {
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: toolId })
  }

  const setHovering = (hovering: boolean) => {
    dispatch({ type: 'SET_HOVERING', payload: hovering })
  }

  return {
    openDropdown,
    closeDropdown,
    toggleDropdown,
    setActiveTool,
    setHovering,
  }
}

export function useNavigationState() {
  const { state } = useNavigation()
  return state
}