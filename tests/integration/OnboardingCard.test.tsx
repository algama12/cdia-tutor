import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OnboardingCard } from '@/components/onboarding/OnboardingCard'
import * as actions from '@/app/(app)/onboarding/actions'

vi.mock('@/app/(app)/onboarding/actions', () => ({
  skipSummerMode: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('OnboardingCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Summer Mode title', () => {
    render(<OnboardingCard />)
    expect(screen.getByText(/summer mode/i)).toBeInTheDocument()
  })

  it('renders accept and skip options', () => {
    render(<OnboardingCard />)
    expect(screen.getByRole('link', { name: /sí.*nivelarme/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saltar/i })).toBeInTheDocument()
  })

  it('accept link points to diagnostic page', () => {
    render(<OnboardingCard />)
    const link = screen.getByRole('link', { name: /sí.*nivelarme/i })
    expect(link).toHaveAttribute('href', '/onboarding/diagnostic')
  })

  it('skip button calls skipSummerMode action', async () => {
    const user = userEvent.setup()
    render(<OnboardingCard />)
    await user.click(screen.getByRole('button', { name: /saltar/i }))
    expect(vi.mocked(actions.skipSummerMode)).toHaveBeenCalledOnce()
  })

  it('shows descriptive text about Summer Mode', () => {
    render(<OnboardingCard />)
    expect(screen.getAllByText(/nivelar|repaso|matemáticas/i).length).toBeGreaterThan(0)
  })

  it('shows module list summary', () => {
    render(<OnboardingCard />)
    expect(screen.getAllByText(/aritmética|fracciones|funciones/i).length).toBeGreaterThan(0)
  })
})
