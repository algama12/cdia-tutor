import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MessageBubble } from '@/components/session/MessageBubble'

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}))
vi.mock('remark-math', () => ({ default: vi.fn() }))
vi.mock('rehype-katex', () => ({ default: vi.fn() }))

describe('MessageBubble', () => {
  it('renders user message content', () => {
    render(<MessageBubble role="user" content="¿Puedes explicar los límites?" />)
    expect(screen.getByText('¿Puedes explicar los límites?')).toBeInTheDocument()
  })

  it('renders assistant message content via markdown', () => {
    render(<MessageBubble role="assistant" content="Claro, un límite es..." />)
    expect(screen.getByTestId('markdown-content')).toHaveTextContent('Claro, un límite es...')
  })

  it('user message is right-aligned (justify-end)', () => {
    const { container } = render(
      <MessageBubble role="user" content="Hola" />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toMatch(/justify-end/)
  })

  it('assistant message is left-aligned (justify-start)', () => {
    const { container } = render(
      <MessageBubble role="assistant" content="Hola" />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toMatch(/justify-start/)
  })

  it('renders streaming cursor when isStreaming=true', () => {
    render(<MessageBubble role="assistant" content="" isStreaming />)
    expect(document.querySelector('[data-streaming]')).toBeInTheDocument()
  })

  it('does not render streaming cursor when isStreaming=false', () => {
    render(<MessageBubble role="assistant" content="Texto completo" />)
    expect(document.querySelector('[data-streaming]')).not.toBeInTheDocument()
  })
})
