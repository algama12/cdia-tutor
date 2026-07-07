import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LevelReport } from '@/components/onboarding/LevelReport'
import type { LevelReport as LevelReportType } from '@/types'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const reportWithWeakModules: LevelReportType = {
  'aritmetica-algebra-basica': 'needs_review',
  'funciones-graficas': 'ok',
  'trigonometria-esencial': 'needs_review',
  'limites-derivadas-intro': 'ok',
  'geometria-vectorial-basica': 'needs_review',
  'combinatoria-logica-basica': 'ok',
}

const reportAllOk: LevelReportType = {
  'aritmetica-algebra-basica': 'ok',
  'funciones-graficas': 'ok',
  'trigonometria-esencial': 'ok',
  'limites-derivadas-intro': 'ok',
  'geometria-vectorial-basica': 'ok',
  'combinatoria-logica-basica': 'ok',
}

describe('LevelReport', () => {
  it('renders report heading', () => {
    render(<LevelReport report={reportWithWeakModules} />)
    expect(screen.getByRole('heading', { name: /diagnóstico|resultados|nivel/i })).toBeInTheDocument()
  })

  it('shows modules that need review', () => {
    render(<LevelReport report={reportWithWeakModules} />)
    expect(screen.getByText(/aritmética/i)).toBeInTheDocument()
    expect(screen.getByText(/trigonometría/i)).toBeInTheDocument()
    expect(screen.getByText(/geometría vectorial/i)).toBeInTheDocument()
  })

  it('shows modules that are ok', () => {
    render(<LevelReport report={reportWithWeakModules} />)
    expect(screen.getByText(/funciones/i)).toBeInTheDocument()
    expect(screen.getByText(/límites/i)).toBeInTheDocument()
    expect(screen.getByText(/combinatoria/i)).toBeInTheDocument()
  })

  it('renders "Empezar plan" link when there are weak modules', () => {
    render(<LevelReport report={reportWithWeakModules} />)
    const link = screen.getByRole('link', { name: /empezar plan/i })
    expect(link).toHaveAttribute('href', '/onboarding/modules/aritmetica-algebra-basica')
  })

  it('renders "Ir al dashboard" link when all modules ok', () => {
    render(<LevelReport report={reportAllOk} />)
    const link = screen.getByRole('link', { name: /ir al dashboard/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('shows count of modules to review', () => {
    render(<LevelReport report={reportWithWeakModules} />)
    expect(screen.getByText(/3.*módulo/i)).toBeInTheDocument()
  })

  it('shows congratulations message when all ok', () => {
    render(<LevelReport report={reportAllOk} />)
    expect(screen.getByText(/enhorabuena|excelente|base sólida/i)).toBeInTheDocument()
  })
})
