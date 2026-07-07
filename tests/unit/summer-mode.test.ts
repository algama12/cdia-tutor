import { describe, it, expect } from 'vitest'
import {
  calculateDiagnosticLevel,
  generateLevelingPlan,
  getModuleScore,
} from '@/lib/utils/summer-mode'
import type { DiagnosticAnswer, DiagnosticQuestion } from '@/types'

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
    text: '¿Cuál es la solución de 2x + 4 = 0?',
    options: ['x = 2', 'x = -2', 'x = 4', 'x = -4'],
    correctIndex: 1,
    moduleId: 'aritmetica-algebra-basica',
  },
  {
    id: 'q3',
    text: '¿Cuál es el dominio de f(x) = 1/x?',
    options: ['ℝ', 'ℝ - {0}', 'ℝ+', 'ℝ - {1}'],
    correctIndex: 1,
    moduleId: 'funciones-graficas',
  },
  {
    id: 'q4',
    text: '¿Cuánto vale sen(30°)?',
    options: ['1', '√3/2', '1/2', '√2/2'],
    correctIndex: 2,
    moduleId: 'trigonometria-esencial',
  },
]

describe('getModuleScore', () => {
  it('returns 1.0 when all answers correct for module', () => {
    const answers: DiagnosticAnswer[] = [
      { questionId: 'q1', selectedIndex: 1 },
      { questionId: 'q2', selectedIndex: 1 },
    ]
    expect(getModuleScore('aritmetica-algebra-basica', answers, mockQuestions)).toBe(1.0)
  })

  it('returns 0.5 when half correct for module', () => {
    const answers: DiagnosticAnswer[] = [
      { questionId: 'q1', selectedIndex: 1 },
      { questionId: 'q2', selectedIndex: 0 },
    ]
    expect(getModuleScore('aritmetica-algebra-basica', answers, mockQuestions)).toBe(0.5)
  })

  it('returns 0.0 when all answers wrong for module', () => {
    const answers: DiagnosticAnswer[] = [
      { questionId: 'q1', selectedIndex: 0 },
      { questionId: 'q2', selectedIndex: 0 },
    ]
    expect(getModuleScore('aritmetica-algebra-basica', answers, mockQuestions)).toBe(0.0)
  })

  it('returns 0 for module with no questions', () => {
    const answers: DiagnosticAnswer[] = []
    expect(getModuleScore('geometria-vectorial-basica', answers, mockQuestions)).toBe(0)
  })
})

describe('calculateDiagnosticLevel', () => {
  it('marks module as needs_review when score < 0.5', () => {
    const answers: DiagnosticAnswer[] = [
      { questionId: 'q1', selectedIndex: 0 },
      { questionId: 'q2', selectedIndex: 0 },
    ]
    const report = calculateDiagnosticLevel(answers, mockQuestions)
    expect(report['aritmetica-algebra-basica']).toBe('needs_review')
  })

  it('marks module as ok when score >= 0.5', () => {
    const answers: DiagnosticAnswer[] = [
      { questionId: 'q1', selectedIndex: 1 },
      { questionId: 'q2', selectedIndex: 1 },
    ]
    const report = calculateDiagnosticLevel(answers, mockQuestions)
    expect(report['aritmetica-algebra-basica']).toBe('ok')
  })

  it('marks module as needs_review when score exactly 0.5', () => {
    const answers: DiagnosticAnswer[] = [
      { questionId: 'q1', selectedIndex: 1 },
      { questionId: 'q2', selectedIndex: 0 },
    ]
    const report = calculateDiagnosticLevel(answers, mockQuestions)
    // 0.5 is borderline — treated as needs_review (strict threshold)
    expect(report['aritmetica-algebra-basica']).toBe('needs_review')
  })

  it('returns a report for every module present in questions', () => {
    const answers: DiagnosticAnswer[] = [
      { questionId: 'q1', selectedIndex: 1 },
      { questionId: 'q2', selectedIndex: 1 },
      { questionId: 'q3', selectedIndex: 1 },
      { questionId: 'q4', selectedIndex: 2 },
    ]
    const report = calculateDiagnosticLevel(answers, mockQuestions)
    expect(Object.keys(report)).toEqual(
      expect.arrayContaining([
        'aritmetica-algebra-basica',
        'funciones-graficas',
        'trigonometria-esencial',
      ])
    )
  })

  it('handles empty answers array (all modules need review)', () => {
    const report = calculateDiagnosticLevel([], mockQuestions)
    for (const key of Object.keys(report)) {
      expect(report[key]).toBe('needs_review')
    }
  })
})

describe('generateLevelingPlan', () => {
  it('returns only modules that need review', () => {
    const report = {
      'aritmetica-algebra-basica': 'needs_review' as const,
      'funciones-graficas': 'ok' as const,
      'trigonometria-esencial': 'needs_review' as const,
    }
    const plan = generateLevelingPlan(report)
    expect(plan).toContain('aritmetica-algebra-basica')
    expect(plan).toContain('trigonometria-esencial')
    expect(plan).not.toContain('funciones-graficas')
  })

  it('returns empty array when all modules are ok', () => {
    const report = {
      'aritmetica-algebra-basica': 'ok' as const,
      'funciones-graficas': 'ok' as const,
    }
    expect(generateLevelingPlan(report)).toHaveLength(0)
  })

  it('returns all modules when all need review', () => {
    const report = {
      'aritmetica-algebra-basica': 'needs_review' as const,
      'funciones-graficas': 'needs_review' as const,
      'trigonometria-esencial': 'needs_review' as const,
    }
    expect(generateLevelingPlan(report)).toHaveLength(3)
  })

  it('preserves canonical module order', () => {
    const report = {
      'trigonometria-esencial': 'needs_review' as const,
      'aritmetica-algebra-basica': 'needs_review' as const,
    }
    const plan = generateLevelingPlan(report)
    expect(plan.indexOf('aritmetica-algebra-basica')).toBeLessThan(
      plan.indexOf('trigonometria-esencial')
    )
  })
})
