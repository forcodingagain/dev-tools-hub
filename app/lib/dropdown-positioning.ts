import React from 'react'
import type { NavigationDropdownPosition } from '../types/navigation'

export function calculateDropdownPosition(
  menuItemRef: React.RefObject<HTMLButtonElement>
): NavigationDropdownPosition | null {
  const menuItem = menuItemRef.current

  if (!menuItem) {
    return null
  }

  const rect = menuItem.getBoundingClientRect()

  return {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
  }
}

export function isDropdownPositionValid(
  position: NavigationDropdownPosition | null,
  viewportWidth: number = window.innerWidth,
  viewportHeight: number = window.innerHeight
): boolean {
  if (!position) return false

  // 检查下拉菜单是否在视口内
  const isWithinViewport =
    position.left >= 0 &&
    position.left + position.width <= viewportWidth &&
    position.top >= 0

  return isWithinViewport
}

export function adjustDropdownPosition(
  position: NavigationDropdownPosition | null,
  dropdownWidth: number = 200,
  viewportWidth: number = window.innerWidth
): NavigationDropdownPosition | null {
  if (!position) return null

  let adjustedPosition = { ...position }

  // 确保下拉菜单不会超出右边界
  if (adjustedPosition.left + dropdownWidth > viewportWidth) {
    adjustedPosition.left = viewportWidth - dropdownWidth - 8 // 8px padding
  }

  // 确保下拉菜单不会超出左边界
  if (adjustedPosition.left < 8) {
    adjustedPosition.left = 8
  }

  return adjustedPosition
}

export function useClickOutside(
  dropdownRef: React.RefObject<HTMLDivElement>,
  menuItemRef: React.RefObject<HTMLButtonElement>,
  isOpen: boolean,
  onClose: () => void
) {
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      // 检查点击是否在下拉菜单或菜单项外部
      if (
        dropdownRef.current?.contains(target) ||
        menuItemRef.current?.contains(target)
      ) {
        return
      }

      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, dropdownRef, menuItemRef])
}

export function useEscapeKey(
  isOpen: boolean,
  onClose: () => void
) {
  React.useEffect(() => {
    if (!isOpen) return

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])
}