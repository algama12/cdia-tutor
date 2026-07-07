import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SubjectCard } from '@/components/dashboard/SubjectCard'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const baseProps = {
  id: 'calculo',
  name: 'Cálculo',
  semester: 1,
  totalTopics: 6,
  topicsWorked: 0,
  progressPercent: 0,
  weakTopicsCount: 0,
}

describe('SubjectCard', () => {
  it('renders subject name', () => {
    render(<SubjectCard {...baseProps} />)
    expect(screen.getByText('Cálculo')).toBeInTheDocument()
  })

  it('renders semester badge', () => {
    render(<SubjectCard {...baseProps} />)
    expect(screen.getByText(/S1/i)).toBeInTheDocument()
  })

  it('renders S2 badge for semester 2', () => {
    render(<SubjectCard {...baseProps} semester={2} />)
    expect(screen.getByText(/S2/i)).toBeInTheDocument()
  })

  it('renders topic count', () => {
    render(<SubjectCard {...baseProps} totalTopics={6} />)
    expect(screen.getByText(/6.*tema/i)).toBeInTheDocument()
  })

  it('renders progress percent', () => {
    render(<SubjectCard {...baseProps} topicsWorked={3} progressPercent={50} />)
    expect(screen.getByText(/50\s*%/)).toBeInTheDocument()
  })

  it('links to correct subject page', () => {
    render(<SubjectCard {...baseProps} id="calculo" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/subject/calculo')
  })

  it('shows weak topics badge when count > 0', () => {
    render(<SubjectCard {...baseProps} weakTopicsCount={2} />)
    expect(screen.getByText(/2.*débil/i)).toBeInTheDocument()
  })

  it('does not show weak topics badge when count is 0', () => {
    render(<SubjectCard {...baseProps} weakTopicsCount={0} />)
    expect(screen.queryByText(/débil/i)).not.toBeInTheDocument()
  })

  it('shows 0% progress when no topics worked', () => {
    render(<SubjectCard {...baseProps} topicsWorked={0} progressPercent={0} />)
    expect(screen.getByText(/0\s*%/)).toBeInTheDocument()
  })
})
