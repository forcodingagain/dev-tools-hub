import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react'
import { useLocation } from '@remix-run/react'
import type { NavigationContext, NavigationAction } from '../types/navigation'
import { initialNavigationState, navigationReducer } from '../lib/navigation-reducer'
import { getStoredNavigationState, storeNavigationState } from '../lib/storage-utils'

const NavigationContext = createContext<NavigationContext | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  // 从本地存储初始化状态
  const getInitialState = () => {
    const storedState = getStoredNavigationState()
    const storedTool = storedState?.activeTool

    return {
      ...initialNavigationState,
      activeTool: storedTool || null,
    }
  }

  const [state, dispatch] = useReducer(navigationReducer, getInitialState())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuItemRef = useRef<HTMLButtonElement>(null)

  // 监听路由变化，更新activeTool
  useEffect(() => {
    const path = location.pathname

    // 更新activeTool状态
    if (path.startsWith('/json') || path.startsWith('/mermaid') || path.startsWith('/markdown')) {
      const toolName = path.split('/')[1]
      if (toolName !== state.activeTool) {
        dispatch({ type: 'SET_ACTIVE_TOOL', payload: toolName })
      }
    } else if (path === '/' && state.activeTool !== null) {
      dispatch({ type: 'SET_ACTIVE_TOOL', payload: null })
    }
  }, [location.pathname])

  // 持久化状态到本地存储
  useEffect(() => {
    if (state.activeTool !== undefined) {
      storeNavigationState({ activeTool: state.activeTool })
    }
  }, [state.activeTool])

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