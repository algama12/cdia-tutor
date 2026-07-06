import { describe, it, expect } from 'vitest'
import { buildTutorPrompt } from '@/lib/prompts/tutor'

const baseParams = {
  subjectName: 'Álgebra Lineal 1',
  topicName: 'Matrices y sistemas de ecuaciones lineales',
  subtopics: ['Operaciones con matrices', 'Determinantes'],
  mode: 'explain' as const,
  progress: { exercisesAttempted: 0, exercisesCorrect: 0 },
}

describe('buildTutorPrompt', () => {
  it('includes subject name', () => {
    expect(buildTutorPrompt(baseParams)).toContain('Álgebra Lineal 1')
  })

  it('includes topic name', () => {
    expect(buildTutorPrompt(baseParams)).toContain(
      'Matrices y sistemas de ecuaciones lineales'
    )
  })

  it('includes subtopics', () => {
    const prompt = buildTutorPrompt(baseParams)
    expect(prompt).toContain('Operaciones con matrices')
    expect(prompt).toContain('Determinantes')
  })

  it('labels explain mode correctly', () => {
    expect(buildTutorPrompt({ ...baseParams, mode: 'explain' })).toContain('Explicación')
  })

  it('labels exercise mode correctly', () => {
    expect(buildTutorPrompt({ ...baseParams, mode: 'exercise' })).toContain('Ejercicio')
  })

  it('labels review mode correctly', () => {
    expect(buildTutorPrompt({ ...baseParams, mode: 'review' })).toContain('Repaso')
  })

  it('shows no prior sessions when zero attempts', () => {
    expect(buildTutorPrompt(baseParams)).toContain('Sin sesiones previas')
  })

  it('shows progress percentage when exercises exist', () => {
    const prompt = buildTutorPrompt({
      ...baseParams,
      progress: { exercisesAttempted: 10, exercisesCorrect: 7 },
    })
    expect(prompt).toContain('7/10')
    expect(prompt).toContain('70%')
  })
})
