import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubjectTopicSelector } from '@/components/subject/SubjectTopicSelector'
import * as actions from '@/app/(app)/subject/[id]/actions'
import type { Subject } from '@/types'

vi.mock('@/app/(app)/subject/[id]/actions', () => ({
  createSession: vi.fn().mockResolvedValue({ sessionId: 'session-abc-123' }),
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

const mockSubject: Subject = {
  id: 'calculo',
  name: 'Cálculo',
  semester: 1,
  year: 1,
  topics: [
    {
      id: 'limites',
      name: 'Límites y continuidad',
      subtopics: ['Definición formal de límite', 'Álgebra de límites', 'Teorema del Sandwich'],
    },
    {
      id: 'derivadas',
      name: 'Derivadas',
      subtopics: ['Regla de la cadena', 'Aplicaciones'],
    },
  ],
}

describe('SubjectTopicSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actions.createSession).mockResolvedValue({ sessionId: 'session-abc-123' })
  })

  it('renders subject name as heading', () => {
    render(<SubjectTopicSelector subject={mockSubject} />)
    expect(screen.getByRole('heading', { name: /cálculo/i })).toBeInTheDocument()
  })

  it('renders breadcrumb link to dashboard', () => {
    render(<SubjectTopicSelector subject={mockSubject} />)
    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders all topic names', () => {
    render(<SubjectTopicSelector subject={mockSubject} />)
    expect(screen.getByText('Límites y continuidad')).toBeInTheDocument()
    expect(screen.getByText('Derivadas')).toBeInTheDocument()
  })

  it('does not show mode pills initially', () => {
    render(<SubjectTopicSelector subject={mockSubject} />)
    expect(screen.queryByText('Explicación')).not.toBeInTheDocument()
    expect(screen.queryByText('Ejercicio')).not.toBeInTheDocument()
    expect(screen.queryByText('Repaso')).not.toBeInTheDocument()
  })

  it('does not show subtopics initially', () => {
    render(<SubjectTopicSelector subject={mockSubject} />)
    expect(screen.queryByText('Definición formal de límite')).not.toBeInTheDocument()
  })

  it('expands topic on click showing subtopics', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    expect(screen.getByText(/Definición formal de límite/)).toBeInTheDocument()
    expect(screen.getByText(/Álgebra de límites/)).toBeInTheDocument()
  })

  it('shows mode pills when topic is expanded', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    expect(screen.getByRole('button', { name: /explicación/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ejercicio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /repaso/i })).toBeInTheDocument()
  })

  it('collapses topic when clicked again', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    await user.click(screen.getByText('Límites y continuidad'))
    expect(screen.queryByText('Definición formal de límite')).not.toBeInTheDocument()
  })

  it('switches to different topic on click', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    await user.click(screen.getByText('Derivadas'))
    expect(screen.getByText(/Regla de la cadena/)).toBeInTheDocument()
    expect(screen.queryByText(/Definición formal de límite/)).not.toBeInTheDocument()
  })

  it('"Iniciar sesión" button is disabled before selecting mode', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled()
  })

  it('"Iniciar sesión" button enables after selecting mode', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    await user.click(screen.getByRole('button', { name: /explicación/i }))
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeEnabled()
  })

  it('calls createSession with correct args on submit', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    await user.click(screen.getByRole('button', { name: /ejercicio/i }))
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(vi.mocked(actions.createSession)).toHaveBeenCalledWith('calculo', 'limites', 'exercise')
  })

  it('navigates to /session/[id] on success', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    await user.click(screen.getByRole('button', { name: /explicación/i }))
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(mockPush).toHaveBeenCalledWith('/session/session-abc-123')
  })

  it('shows error when createSession fails', async () => {
    vi.mocked(actions.createSession).mockResolvedValue({ error: 'Error al crear la sesión' })
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    await user.click(screen.getByRole('button', { name: /repaso/i }))
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Error al crear la sesión')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows only one active mode at a time', async () => {
    const user = userEvent.setup()
    render(<SubjectTopicSelector subject={mockSubject} />)
    await user.click(screen.getByText('Límites y continuidad'))
    await user.click(screen.getByRole('button', { name: /explicación/i }))
    await user.click(screen.getByRole('button', { name: /ejercicio/i }))
    expect(screen.getByRole('button', { name: /ejercicio/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /explicación/i })).toHaveAttribute('aria-pressed', 'false')
  })
})
