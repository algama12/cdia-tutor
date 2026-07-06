import { describe, it, expect } from 'vitest'
import { calculateProgress, isWeakTopic, getSubjectById } from '@/lib/utils/curriculum'
import type { Curriculum } from '@/types'

const mockCurriculum: Curriculum = {
  subjects: [
    {
      id: 'algebra-lineal',
      name: 'Álgebra Lineal 1',
      semester: 1,
      year: 1,
      topics: [
        {
          id: 'matrices',
          name: 'Matrices y sistemas de ecuaciones lineales',
          subtopics: ['Operaciones con matrices', 'Determinantes'],
        },
      ],
    },
  ],
}

describe('calculateProgress', () => {
  it('returns 0 when no exercises attempted', () => {
    expect(calculateProgress(0, 0)).toBe(0)
  })

  it('returns 100 when all exercises correct', () => {
    expect(calculateProgress(10, 10)).toBe(100)
  })

  it('returns correct percentage', () => {
    expect(calculateProgress(3, 10)).toBe(30)
  })
})

describe('isWeakTopic', () => {
  it('returns false when no exercises attempted', () => {
    expect(isWeakTopic(0, 0)).toBe(false)
  })

  it('returns true when below 50%', () => {
    expect(isWeakTopic(4, 10)).toBe(true)
  })

  it('returns false when at or above 50%', () => {
    expect(isWeakTopic(5, 10)).toBe(false)
  })
})

describe('getSubjectById', () => {
  it('finds subject by id', () => {
    const subject = getSubjectById(mockCurriculum, 'algebra-lineal')
    expect(subject?.name).toBe('Álgebra Lineal 1')
  })

  it('returns undefined for unknown id', () => {
    expect(getSubjectById(mockCurriculum, 'unknown')).toBeUndefined()
  })
})
