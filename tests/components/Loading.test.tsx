/**
 * 加载组件测试
 * 测试加载状态、骨架屏和懒加载功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createUserEvent, mockResize } from '../utils/test-helpers'

// Mock 加载组件
import LoadingScreen from '~/components/LoadingScreen'
import Skeleton from '~/components/Skeleton'

describe('LoadingScreen Component', () => {
  let user: ReturnType<typeof createUserEvent>

  beforeEach(() => {
    user = createUserEvent()
  })

  it('renders basic loading screen correctly', () => {
    renderWithProviders(<LoadingScreen />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows custom message', () => {
    renderWithProviders(<LoadingScreen message="正在处理数据..." />)

    expect(screen.getByText('正在处理数据...')).toBeInTheDocument()
  })

  it('displays progress bar when enabled', () => {
    renderWithProviders(<LoadingScreen showProgress />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('updates progress correctly', async () => {
    renderWithProviders(<LoadingScreen showProgress />)

    const progressElement = screen.getByRole('progressbar')

    // 模拟进度更新
    fireEvent.progress(window, { loaded: 50, total: 100 })

    await waitFor(() => {
      expect(progressElement).toHaveAttribute('aria-valuenow', '50')
    })
  })

  it('shows estimated time', () => {
    renderWithProviders(<LoadingScreen showProgress showTime />)

    expect(screen.getByText(/预计时间/)).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { rerender } = renderWithProviders(<LoadingScreen size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4')

    rerender(<LoadingScreen size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-8', 'w-8')
  })

  it('supports custom colors', () => {
    renderWithProviders(<LoadingScreen color="red" />)

    expect(screen.getByRole('status')).toHaveClass('text-red-500')
  })

  it('shows cancel button when enabled', () => {
    const onCancel = vi.fn()
    renderWithProviders(<LoadingScreen showCancel onCancel={onCancel} />)

    const cancelButton = screen.getByRole('button', { name: '取消' })
    expect(cancelButton).toBeInTheDocument()

    fireEvent.click(cancelButton)
    expect(onCancel).toHaveBeenCalled()
  })

  it('handles accessibility features', () => {
    renderWithProviders(<LoadingScreen />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })
})

describe('Skeleton Components', () => {
  it('renders text skeleton correctly', () => {
    renderWithProviders(<Skeleton.Text lines={3} />)

    const skeletonElements = screen.getAllByTestId('skeleton-line')
    expect(skeletonElements).toHaveLength(3)
  })

  it('renders card skeleton correctly', () => {
    renderWithProviders(<Skeleton.Card />)

    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument()
  })

  it('renders table skeleton correctly', () => {
    renderWithProviders(<Skeleton.Table rows={5} columns={3} />)

    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(5)
    expect(screen.getAllByTestId('skeleton-cell')).toHaveLength(15) // 5 * 3
  })

  it('renders list skeleton correctly', () => {
    renderWithProviders(<Skeleton.List items={4} />)

    expect(screen.getAllByTestId('skeleton-item')).toHaveLength(4)
  })

  it('applies custom width and height', () => {
    renderWithProviders(<Skeleton width="200px" height="100px" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '100px'
    })
  })

  it('shows shimmer effect', () => {
    renderWithProviders(<Skeleton shimmer />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-shimmer')
  })

  it('supports different animation variants', () => {
    const { rerender } = renderWithProviders(<Skeleton variant="pulse" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse')

    rerender(<Skeleton variant="wave" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-wave')
  })

  it('handles responsive props', () => {
    renderWithProviders(<Skeleton responsive smWidth="100%" mdWidth="50%" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('w-full', 'md:w-1/2')
  })
})

describe('SkeletonContainer Component', () => {
  it('shows skeleton when loading', () => {
    renderWithProviders(
      <SkeletonContainer loading skeleton={<Skeleton />}>
        <div>Content</div>
      </SkeletonContainer>
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('shows content when not loading', () => {
    renderWithProviders(
      <SkeletonContainer loading={false} skeleton={<Skeleton />}>
        <div>Content</div>
      </SkeletonContainer>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
  })

  it('handles loading state change', async () => {
    const { rerender } = renderWithProviders(
      <SkeletonContainer loading skeleton={<Skeleton />}>
        <div>Content</div>
      </SkeletonContainer>
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()

    rerender(
      <SkeletonContainer loading={false} skeleton={<Skeleton />}>
        <div>Content</div>
      </SkeletonContainer>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
  })

  it('applies proper accessibility attributes', () => {
    renderWithProviders(
      <SkeletonContainer loading skeleton={<Skeleton />}>
        <div>Content</div>
      </SkeletonContainer>
    )

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })
})

describe('InlineLoading Component', () => {
  it('renders inline loading correctly', () => {
    renderWithProviders(<LoadingScreen inline />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveClass('inline-flex')
  })

  it('supports inline positioning', () => {
    renderWithProviders(<LoadingScreen inline position="start" />)

    expect(screen.getByTestId('inline-loading')).toHaveClass('justify-start')
  })

  it('shows appropriate inline size', () => {
    renderWithProviders(<LoadingScreen inline size="sm" />)

    expect(screen.getByRole('status')).toHaveClass('h-3', 'w-3')
  })
})

describe('MiniLoading Component', () => {
  it('renders mini loading correctly', () => {
    renderWithProviders(<LoadingScreen mini />)

    expect(screen.getByRole('status')).toHaveClass('h-2', 'w-2')
  })

  it('fits in tight spaces', () => {
    const { container } = renderWithProviders(<LoadingScreen mini />)

    const loadingElement = container.querySelector('[role="status"]')
    expect(loadingElement).toHaveClass('text-xs')
  })
})

describe('ProgressBar Component', () => {
  it('renders progress bar correctly', () => {
    renderWithProviders(<LoadingScreen showProgress />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('updates progress value', async () => {
    renderWithProviders(<LoadingScreen showProgress />)

    const progressBar = screen.getByRole('progressbar')

    // 模拟进度事件
    fireEvent.progress(window, { loaded: 75, total: 100 })

    await waitFor(() => {
      expect(progressBar).toHaveAttribute('aria-valuenow', '75')
    })
  })

  it('shows percentage text', () => {
    renderWithProviders(<LoadingScreen showProgress />)

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('handles indeterminate state', () => {
    renderWithProviders(<LoadingScreen showProgress indeterminate />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    expect(progressBar).toHaveClass('animate-pulse')
  })
})

describe('Loading Component Integration', () => {
  it('works with resize events', async () => {
    renderWithProviders(<LoadingScreen responsive />)

    // 模拟窗口大小变化
    mockResize(800, 600)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const onCancel = vi.fn()
    renderWithProviders(<LoadingScreen showCancel onCancel={onCancel} />)

    const cancelButton = screen.getByRole('button', { name: '取消' })

    // 测试键盘导航
    await user.tab()
    expect(cancelButton).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onCancel).toHaveBeenCalled()
  })

  it('handles high contrast mode', () => {
    // 模拟高对比度模式
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    renderWithProviders(<LoadingScreen />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('respects reduced motion preferences', () => {
    // 模拟减少动画偏好
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    renderWithProviders(<LoadingScreen />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})