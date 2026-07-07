import { describe, it, expect } from 'vitest'
import { calculateSubjectProgress } from '@/lib/utils/curriculum'
import type { Subject, TopicProgress } from '@/types'

const mockSubject: Subject = {
  id: 'calculo',
  name: 'Cálculo',
  semester: 1,
  year: 1,
  topics: [
    { id: 'limites', name: 'Límites', subtopics: ['Def.', 'Álgebra'] },
    { id: 'derivadas', name: 'Derivadas', subtopics: ['Reglas', 'Aplicaciones'] },
    { id: 'integrales', name: 'Integrales', subtopics: ['Riemann', 'Técnicas'] },
  ],
}

const noProgress: TopicProgress[] = []

const partialProgress: TopicProgress[] = [
  {
    id: 'p1',
    userId: 'u1',
    subjectId: 'calculo',
    topicId: 'limites',
    exercisesAttempted: 4,
    exercisesCorrect: 3,
    lastSeenAt: '2026-07-07T00:00:00Z',
  },
  {
    id: 'p2',
    userId: 'u1',
    subjectId: 'calculo',
    topicId: 'derivadas',
    exercisesAttempted: 6,
    exercisesCorrect: 2,  // weak: 2/6 = 33%
    lastSeenAt: '2026-07-07T00:00:00Z',
  },
]

describe('calculateSubjectProgress', () => {
  it('returns zero progress when no topics worked', () => {
    const result = calculateSubjectProgress(mockSubject, noProgress)
    expect(result.topicsWorked).toBe(0)
    expect(result.progressPercent).toBe(0)
  })

  it('returns correct totalTopics', () => {
    const result = calculateSubjectProgress(mockSubject, noProgress)
    expect(result.totalTopics).toBe(3)
  })

  it('counts only topics with exercises_attempted > 0', () => {
    const result = calculateSubjectProgress(mockSubject, partialProgress)
    expect(result.topicsWorked).toBe(2)
  })

  it('calculates progress percent correctly', () => {
    const result = calculateSubjectProgress(mockSubject, partialProgress)
    expect(result.progressPercent).toBe(67)  // Math.round(2/3 * 100)
  })

  it('counts weak topics correctly', () => {
    const result = calculateSubjectProgress(mockSubject, partialProgress)
    expect(result.weakTopicsCount).toBe(1)  // derivadas: 2/6 < 50%
  })

  it('returns zero weak topics when none are weak', () => {
    const strongProgress: TopicProgress[] = [
      {
        id: 'p1',
        userId: 'u1',
        subjectId: 'calculo',
        topicId: 'limites',
        exercisesAttempted: 4,
        exercisesCorrect: 4,
        lastSeenAt: '2026-07-07T00:00:00Z',
      },
    ]
    const result = calculateSubjectProgress(mockSubject, strongProgress)
    expect(result.weakTopicsCount).toBe(0)
  })

  it('ignores progress rows from other subjects', () => {
    const otherSubjectProgress: TopicProgress[] = [
      {
        id: 'p1',
        userId: 'u1',
        subjectId: 'algebra-lineal',
        topicId: 'matrices',
        exercisesAttempted: 5,
        exercisesCorrect: 5,
        lastSeenAt: '2026-07-07T00:00:00Z',
      },
    ]
    const result = calculateSubjectProgress(mockSubject, otherSubjectProgress)
    expect(result.topicsWorked).toBe(0)
  })

  it('returns 100% when all topics worked', () => {
    const fullProgress: TopicProgress[] = mockSubject.topics.map((t, i) => ({
      id: `p${i}`,
      userId: 'u1',
      subjectId: 'calculo',
      topicId: t.id,
      exercisesAttempted: 3,
      exercisesCorrect: 3,
      lastSeenAt: '2026-07-07T00:00:00Z',
    }))
    const result = calculateSubjectProgress(mockSubject, fullProgress)
    expect(result.progressPercent).toBe(100)
    expect(result.topicsWorked).toBe(3)
  })
})
