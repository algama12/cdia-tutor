import { describe, it, expect } from 'vitest'
import { getTopicStats } from '@/lib/utils/curriculum'
import type { TopicProgress } from '@/types'

const progress: TopicProgress[] = [
  {
    id: 'p1',
    userId: 'u1',
    subjectId: 'calculo',
    topicId: 'limites',
    exercisesAttempted: 8,
    exercisesCorrect: 7,
    lastSeenAt: '2026-07-07T00:00:00Z',
  },
  {
    id: 'p2',
    userId: 'u1',
    subjectId: 'calculo',
    topicId: 'derivadas',
    exercisesAttempted: 6,
    exercisesCorrect: 2,
    lastSeenAt: '2026-07-07T00:00:00Z',
  },
]

describe('getTopicStats', () => {
  it('returns correct percent for strong topic', () => {
    const stats = getTopicStats('calculo', 'limites', progress)
    expect(stats.percent).toBe(88) // Math.round(7/8*100)
    expect(stats.isWeak).toBe(false)
    expect(stats.hasActivity).toBe(true)
  })

  it('returns weak=true when percent < 50', () => {
    const stats = getTopicStats('calculo', 'derivadas', progress)
    expect(stats.percent).toBe(33) // Math.round(2/6*100)
    expect(stats.isWeak).toBe(true)
  })

  it('returns hasActivity=false for untouched topic', () => {
    const stats = getTopicStats('calculo', 'integrales', progress)
    expect(stats.hasActivity).toBe(false)
    expect(stats.percent).toBe(0)
    expect(stats.isWeak).toBe(false)
  })

  it('ignores progress from other subjects', () => {
    const stats = getTopicStats('algebra', 'limites', progress)
    expect(stats.hasActivity).toBe(false)
  })

  it('returns correct attempted and correct counts', () => {
    const stats = getTopicStats('calculo', 'limites', progress)
    expect(stats.attempted).toBe(8)
    expect(stats.correct).toBe(7)
  })
})
