import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ProgressView } from '@/components/progress/ProgressView'
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
      { id: 'limites', name: 'Límites y continuidad', subtopics: [] },
      { id: 'derivadas', name: 'Derivadas', subtopics: [] },
    ],
  },
  {
    id: 'algebra',
    name: 'Álgebra Lineal',
    semester: 1,
    year: 1,
    topics: [
      { id: 'matrices', name: 'Matrices', subtopics: [] },
    ],
  },
]

const mockProgress: TopicProgress[] = [
  {
    id: 'p1', userId: 'u1', subjectId: 'calculo', topicId: 'limites',
    exercisesAttempted: 8, exercisesCorrect: 7, lastSeenAt: '2026-07-07T00:00:00Z',
  },
  {
    id: 'p2', userId: 'u1', subjectId: 'calculo', topicId: 'derivadas',
    exercisesAttempted: 6, exercisesCorrect: 2, lastSeenAt: '2026-07-07T00:00:00Z',
  },
]

describe('ProgressView', () => {
  it('renders progress heading', () => {
    render(<ProgressView subjects={mockSubjects} progress={[]} />)
    expect(screen.getByRole('heading', { name: /progreso/i })).toBeInTheDocument()
  })

  it('renders all subject names', () => {
    render(<ProgressView subjects={mockSubjects} progress={[]} />)
    expect(screen.getByText('Cálculo')).toBeInTheDocument()
    expect(screen.getByText('Álgebra Lineal')).toBeInTheDocument()
  })

  it('renders topic names', () => {
    render(<ProgressView subjects={mockSubjects} progress={[]} />)
    expect(screen.getByText('Límites y continuidad')).toBeInTheDocument()
    expect(screen.getByText('Derivadas')).toBeInTheDocument()
  })

  it('shows "Sin actividad" for untouched topics', () => {
    render(<ProgressView subjects={mockSubjects} progress={[]} />)
    expect(screen.getAllByText(/sin actividad/i).length).toBeGreaterThan(0)
  })

  it('shows percentage for worked topics', () => {
    render(<ProgressView subjects={mockSubjects} progress={mockProgress} />)
    expect(screen.getByText(/88\s*%/)).toBeInTheDocument()
  })

  it('shows weak indicator for topics below 50%', () => {
    render(<ProgressView subjects={mockSubjects} progress={mockProgress} />)
    expect(screen.getByText(/débil/i)).toBeInTheDocument()
  })

  it('does not show weak indicator for strong topics', () => {
    const strongProgress: TopicProgress[] = [
      { id: 'p1', userId: 'u1', subjectId: 'calculo', topicId: 'limites',
        exercisesAttempted: 4, exercisesCorrect: 4, lastSeenAt: '2026-07-07T00:00:00Z' },
    ]
    render(<ProgressView subjects={[mockSubjects[0]]} progress={strongProgress} />)
    expect(screen.queryByText(/débil/i)).not.toBeInTheDocument()
  })

  it('renders link to study each subject', () => {
    render(<ProgressView subjects={mockSubjects} progress={[]} />)
    const links = screen.getAllByRole('link', { name: /estudiar/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', '/subject/calculo')
  })

  it('shows overall subject progress percentage', () => {
    render(<ProgressView subjects={mockSubjects} progress={mockProgress} />)
    // Cálculo: 2/2 topics worked = 100%
    expect(screen.getByText(/100\s*%/)).toBeInTheDocument()
  })
})
