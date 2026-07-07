import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatSession } from '@/components/session/ChatSession'
import * as actions from '@/app/(app)/session/[id]/actions'

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}))
vi.mock('remark-math', () => ({ default: vi.fn() }))
vi.mock('rehype-katex', () => ({ default: vi.fn() }))

vi.mock('@/app/(app)/session/[id]/actions', () => ({
  saveMessage: vi.fn().mockResolvedValue(null),
  endSession: vi.fn().mockResolvedValue(null),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

function makeStreamResponse(text: string) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
  return Promise.resolve(new Response(stream, { status: 200 }))
}

const baseProps = {
  sessionId: 'session-123',
  subjectId: 'calculo',
  subjectName: 'Cálculo',
  topicId: 'limites',
  topicName: 'Límites y continuidad',
  subtopics: ['Definición formal', 'Álgebra de límites'],
  mode: 'explain' as const,
  initialMessages: [] as { role: 'user' | 'assistant'; content: string }[],
  progress: { exercisesAttempted: 0, exercisesCorrect: 0 },
}

describe('ChatSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actions.saveMessage).mockResolvedValue(null)
    vi.mocked(actions.endSession).mockResolvedValue(null)
    global.fetch = vi.fn().mockImplementation(() =>
      makeStreamResponse('El límite es el valor al que tiende la función.')
    )
  })

  it('renders subject and topic in header', () => {
    render(<ChatSession {...baseProps} />)
    expect(screen.getByText(/cálculo/i)).toBeInTheDocument()
    expect(screen.getByText(/límites y continuidad/i)).toBeInTheDocument()
  })

  it('renders mode badge', () => {
    render(<ChatSession {...baseProps} />)
    expect(screen.getByText(/explicación/i)).toBeInTheDocument()
  })

  it('renders back link to subject page', () => {
    render(<ChatSession {...baseProps} />)
    const link = screen.getByRole('link', { name: /volver/i })
    expect(link).toHaveAttribute('href', '/subject/calculo')
  })

  it('renders textarea for user input', () => {
    render(<ChatSession {...baseProps} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    render(<ChatSession {...baseProps} />)
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
  })

  it('send button enables when input has text', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), 'Mi pregunta')
    expect(screen.getByRole('button', { name: /enviar/i })).toBeEnabled()
  })

  it('renders initial messages when provided', () => {
    render(
      <ChatSession
        {...baseProps}
        initialMessages={[
          { role: 'assistant', content: 'Bienvenido a la sesión.' },
          { role: 'user', content: '¿Qué es un límite?' },
        ]}
      />
    )
    expect(screen.getByText('Bienvenido a la sesión.')).toBeInTheDocument()
    expect(screen.getByText('¿Qué es un límite?')).toBeInTheDocument()
  })

  it('shows user message in chat after sending', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), '¿Qué es un límite?')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(screen.getByText('¿Qué es un límite?')).toBeInTheDocument()
  })

  it('clears input after sending', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), 'Pregunta')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('calls saveMessage with user content', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), 'Hola tutor')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(vi.mocked(actions.saveMessage)).toHaveBeenCalledWith(
      'session-123',
      'user',
      'Hola tutor'
    )
  })

  it('shows assistant response after streaming completes', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), 'Explícame los límites')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(
      await screen.findByText('El límite es el valor al que tiende la función.')
    ).toBeInTheDocument()
  })

  it('saves assistant message after streaming', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), 'Pregunta')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    await screen.findByText('El límite es el valor al que tiende la función.')
    expect(vi.mocked(actions.saveMessage)).toHaveBeenCalledWith(
      'session-123',
      'assistant',
      'El límite es el valor al que tiende la función.'
    )
  })

  it('sends Enter key to submit message', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), 'Pregunta con Enter{Enter}')
    await waitFor(() => {
      expect(vi.mocked(actions.saveMessage)).toHaveBeenCalled()
    })
  })

  it('renders end session button', () => {
    render(<ChatSession {...baseProps} />)
    expect(screen.getByRole('button', { name: /finalizar sesión/i })).toBeInTheDocument()
  })

  it('calls endSession action when end button clicked', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.click(screen.getByRole('button', { name: /finalizar sesión/i }))
    expect(vi.mocked(actions.endSession)).toHaveBeenCalledWith('session-123')
  })

  it('navigates to dashboard after ending session', async () => {
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.click(screen.getByRole('button', { name: /finalizar sesión/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error alert when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<ChatSession {...baseProps} />)
    await user.type(screen.getByRole('textbox'), 'Pregunta')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
