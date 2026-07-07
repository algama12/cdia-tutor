import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DiagnosticQuiz } from '@/components/onboarding/DiagnosticQuiz'
import * as actions from '@/app/(app)/onboarding/actions'
import type { DiagnosticQuestion } from '@/types'

vi.mock('@/app/(app)/onboarding/actions', () => ({
  saveDiagnosticAnswers: vi.fn().mockResolvedValue(null),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockQuestions: DiagnosticQuestion[] = [
  {
    id: 'q1',
    text: '¿Cuánto es 1/2 + 1/3?',
    options: ['2/5', '5/6', '2/6', '1/6'],
    correctIndex: 1,
    moduleId: 'aritmetica-algebra-basica',
  },
  {
    id: 'q2',
    text: '¿Cuál es el dominio de f(x) = 1/x?',
    options: ['ℝ', 'ℝ - {0}', 'ℝ+', 'ℝ - {1}'],
    correctIndex: 1,
    moduleId: 'funciones-graficas',
  },
  {
    id: 'q3',
    text: '¿Cuánto vale sen(30°)?',
    options: ['1', '√3/2', '1/2', '√2/2'],
    correctIndex: 2,
    moduleId: 'trigonometria-esencial',
  },
]

describe('DiagnosticQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actions.saveDiagnosticAnswers).mockResolvedValue(null)
  })

  it('renders first question text', () => {
    render(<DiagnosticQuiz questions={mockQuestions} />)
    expect(screen.getByText('¿Cuánto es 1/2 + 1/3?')).toBeInTheDocument()
  })

  it('renders all options for first question', () => {
    render(<DiagnosticQuiz questions={mockQuestions} />)
    expect(screen.getByText('2/5')).toBeInTheDocument()
    expect(screen.getByText('5/6')).toBeInTheDocument()
    expect(screen.getByText('2/6')).toBeInTheDocument()
    expect(screen.getByText('1/6')).toBeInTheDocument()
  })

  it('shows progress indicator', () => {
    render(<DiagnosticQuiz questions={mockQuestions} />)
    expect(screen.getByText(/pregunta 1 de 3/i)).toBeInTheDocument()
  })

  it('next button is disabled before selecting an option', () => {
    render(<DiagnosticQuiz questions={mockQuestions} />)
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('next button becomes enabled after selecting an option', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz questions={mockQuestions} />)
    await user.click(screen.getByText('5/6'))
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled()
  })

  it('advances to next question after clicking next', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz questions={mockQuestions} />)
    await user.click(screen.getByText('5/6'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    expect(screen.getByText('¿Cuál es el dominio de f(x) = 1/x?')).toBeInTheDocument()
    expect(screen.getByText(/pregunta 2 de 3/i)).toBeInTheDocument()
  })

  it('shows "Ver resultados" button on last question', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz questions={mockQuestions} />)

    await user.click(screen.getByText('5/6'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByText('ℝ - {0}'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByRole('button', { name: /ver resultados/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^siguiente$/i })).not.toBeInTheDocument()
  })

  it('calls saveDiagnosticAnswers with all answers on finish', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz questions={mockQuestions} />)

    await user.click(screen.getByText('5/6'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByText('ℝ - {0}'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByText('1/2'))
    await user.click(screen.getByRole('button', { name: /ver resultados/i }))

    expect(vi.mocked(actions.saveDiagnosticAnswers)).toHaveBeenCalledOnce()
    const [answers] = vi.mocked(actions.saveDiagnosticAnswers).mock.calls[0]
    expect(answers).toHaveLength(3)
    expect(answers[0]).toEqual({ questionId: 'q1', selectedIndex: 1 })
    expect(answers[1]).toEqual({ questionId: 'q2', selectedIndex: 1 })
    expect(answers[2]).toEqual({ questionId: 'q3', selectedIndex: 2 })
  })

  it('redirects to /onboarding/results after completing quiz', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz questions={mockQuestions} />)

    await user.click(screen.getByText('5/6'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByText('ℝ - {0}'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByText('1/2'))
    await user.click(screen.getByRole('button', { name: /ver resultados/i }))

    expect(mockPush).toHaveBeenCalledWith('/onboarding/results')
  })

  it('shows error and does not redirect when action fails', async () => {
    vi.mocked(actions.saveDiagnosticAnswers).mockResolvedValue({
      error: 'Error al guardar las respuestas',
    })
    const user = userEvent.setup()
    render(<DiagnosticQuiz questions={mockQuestions} />)

    await user.click(screen.getByText('5/6'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByText('ℝ - {0}'))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByText('1/2'))
    await user.click(screen.getByRole('button', { name: /ver resultados/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Error al guardar las respuestas')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('highlights selected option', async () => {
    const user = userEvent.setup()
    render(<DiagnosticQuiz questions={mockQuestions} />)
    const option = screen.getByText('5/6')
    await user.click(option)
    expect(option.closest('[data-selected]') ?? option.closest('button')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})
