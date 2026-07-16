import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SummerModuleSession } from '@/components/onboarding/SummerModuleSession'
import * as subjectActions from '@/app/(app)/subject/[id]/actions'
import * as onboardingActions from '@/app/(app)/onboarding/actions'

vi.mock('@/app/(app)/subject/[id]/actions', () => ({
  createSession: vi.fn().mockResolvedValue({ sessionId: 'session-xyz' }),
}))

vi.mock('@/app/(app)/onboarding/actions', () => ({
  markModuleComplete: vi.fn().mockResolvedValue(undefined),
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

const mockSubject = {
  id: 'limites-derivadas-intro',
  name: 'Introducción a Límites y Derivadas',
  topics: [
    { id: 'concepto-limite', name: 'Concepto de límite', subtopics: ['Definición intuitiva'] },
    { id: 'derivada-basica', name: 'Derivada básica', subtopics: ['Regla de la potencia'] },
  ],
}

const defaultProps = {
  moduleId: 'limites-derivadas-intro',
  moduleName: 'Introducción a Límites y Derivadas',
  subject: mockSubject,
  planProgress: { completed: 1, total: 3 },
  plan: ['aritmetica-algebra-basica', 'limites-derivadas-intro', 'trigonometria-esencial'],
  completedModules: ['aritmetica-algebra-basica'],
  allModuleNames: {
    'aritmetica-algebra-basica': 'Aritmética y Álgebra Básica',
    'limites-derivadas-intro': 'Introducción a Límites y Derivadas',
    'trigonometria-esencial': 'Trigonometría Esencial',
  },
}

describe('SummerModuleSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(subjectActions.createSession).mockResolvedValue({ sessionId: 'session-xyz' })
  })

  it('renders module name', () => {
    render(<SummerModuleSession {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /límites y derivadas/i })).toBeInTheDocument()
  })

  it('renders link back to dashboard', () => {
    render(<SummerModuleSession {...defaultProps} />)
    const links = screen.getAllByRole('link', { name: /dashboard/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', '/dashboard')
  })

  it('renders all plan modules in nav', () => {
    render(<SummerModuleSession {...defaultProps} />)
    expect(screen.getAllByText(/aritmética y álgebra básica/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/introducción a límites y derivadas/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/trigonometría esencial/i).length).toBeGreaterThan(0)
  })

  it('marks completed modules visually', () => {
    render(<SummerModuleSession {...defaultProps} />)
    // completed module link should point to its module page
    const completedLink = screen.getByRole('link', { name: /aritmética y álgebra básica/i })
    expect(completedLink).toHaveAttribute('href', '/onboarding/modules/aritmetica-algebra-basica')
  })

  it('renders topics from subject', () => {
    render(<SummerModuleSession {...defaultProps} />)
    expect(screen.getByText('Concepto de límite')).toBeInTheDocument()
    expect(screen.getByText('Derivada básica')).toBeInTheDocument()
  })

  it('start button hidden until topic and mode selected', () => {
    render(<SummerModuleSession {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /empezar sesión/i })).not.toBeInTheDocument()
  })

  it('shows mode pills after topic selection', async () => {
    const user = userEvent.setup()
    render(<SummerModuleSession {...defaultProps} />)
    await user.click(screen.getByText('Concepto de límite'))
    expect(screen.getByText('Explicación')).toBeInTheDocument()
    expect(screen.getByText('Ejercicio')).toBeInTheDocument()
    expect(screen.getByText('Repaso')).toBeInTheDocument()
  })

  it('calls createSession and navigates on start', async () => {
    const user = userEvent.setup()
    render(<SummerModuleSession {...defaultProps} />)
    await user.click(screen.getByText('Concepto de límite'))
    await user.click(screen.getByText('Explicación'))
    await user.click(screen.getByRole('button', { name: /empezar sesión/i }))

    expect(vi.mocked(subjectActions.createSession)).toHaveBeenCalledWith(
      'limites-derivadas-intro',
      'concepto-limite',
      'explain'
    )
    expect(mockPush).toHaveBeenCalledWith('/session/session-xyz')
  })

  it('does not call alert()', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<SummerModuleSession {...defaultProps} />)
    await user.click(screen.getByText('Concepto de límite'))
    await user.click(screen.getByText('Explicación'))
    await user.click(screen.getByRole('button', { name: /empezar sesión/i }))
    expect(alertSpy).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })
})
