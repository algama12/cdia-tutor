import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DashboardView } from '@/components/dashboard/DashboardView'
import type { Subject, TopicProgress } from '@/types'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const mockSubjects: Subject[] = [
  {
    id: 'calculo',
    name: 'Cálculo',
    semester: 1,
    year: 1,
    topics: [
      { id: 'limites', name: 'Límites', subtopics: [] },
      { id: 'derivadas', name: 'Derivadas', subtopics: [] },
    ],
  },
  {
    id: 'algebra-lineal',
    name: 'Álgebra Lineal',
    semester: 1,
    year: 1,
    topics: [{ id: 'matrices', name: 'Matrices', subtopics: [] }],
  },
  {
    id: 'estadistica',
    name: 'Estadística',
    semester: 2,
    year: 1,
    topics: [{ id: 'prob', name: 'Probabilidad', subtopics: [] }],
  },
]

const noProgress: TopicProgress[] = []

describe('DashboardView', () => {
  it('renders welcome message with user name', () => {
    render(
      <DashboardView
        subjects={mockSubjects}
        progress={noProgress}
        userFullName="Álvaro"
        hasSummerMode={false}
      />
    )
    expect(screen.getByText(/álvaro/i)).toBeInTheDocument()
  })

  it('shows S1 subjects by default', () => {
    render(
      <DashboardView
        subjects={mockSubjects}
        progress={noProgress}
        userFullName="Álvaro"
        hasSummerMode={false}
      />
    )
    expect(screen.getByText('Cálculo')).toBeInTheDocument()
    expect(screen.getByText('Álgebra Lineal')).toBeInTheDocument()
    expect(screen.queryByText('Estadística')).not.toBeInTheDocument()
  })

  it('shows S2 subjects after clicking S2 tab', async () => {
    const user = userEvent.setup()
    render(
      <DashboardView
        subjects={mockSubjects}
        progress={noProgress}
        userFullName="Álvaro"
        hasSummerMode={false}
      />
    )
    await user.click(screen.getByRole('button', { name: /S2/i }))
    expect(screen.getByText('Estadística')).toBeInTheDocument()
    expect(screen.queryByText('Cálculo')).not.toBeInTheDocument()
  })

  it('renders S1 and S2 toggle buttons', () => {
    render(
      <DashboardView
        subjects={mockSubjects}
        progress={noProgress}
        userFullName="Álvaro"
        hasSummerMode={false}
      />
    )
    expect(screen.getByRole('button', { name: /S1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /S2/i })).toBeInTheDocument()
  })

  it('shows Summer Mode link when hasSummerMode is true', () => {
    render(
      <DashboardView
        subjects={mockSubjects}
        progress={noProgress}
        userFullName="Álvaro"
        hasSummerMode={true}
      />
    )
    expect(screen.getByRole('link', { name: /summer mode/i })).toBeInTheDocument()
  })

  it('does not show Summer Mode link when hasSummerMode is false', () => {
    render(
      <DashboardView
        subjects={mockSubjects}
        progress={noProgress}
        userFullName="Álvaro"
        hasSummerMode={false}
      />
    )
    expect(screen.queryByRole('link', { name: /summer mode/i })).not.toBeInTheDocument()
  })

  it('shows fallback name when userFullName is null', () => {
    render(
      <DashboardView
        subjects={mockSubjects}
        progress={noProgress}
        userFullName={null}
        hasSummerMode={false}
      />
    )
    expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
  })
})
