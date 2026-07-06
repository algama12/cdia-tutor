import type { Subject, Topic } from '@/types'

export function getSubjects(curriculum: { subjects: Subject[] }): Subject[] {
  return curriculum.subjects
}

export function getSubjectById(
  curriculum: { subjects: Subject[] },
  id: string
): Subject | undefined {
  return curriculum.subjects.find((s) => s.id === id)
}

export function getTopicById(subject: Subject, topicId: string): Topic | undefined {
  return subject.topics.find((t) => t.id === topicId)
}

export function calculateProgress(
  exercisesCorrect: number,
  exercisesAttempted: number
): number {
  if (exercisesAttempted === 0) return 0
  return Math.round((exercisesCorrect / exercisesAttempted) * 100)
}

export function isWeakTopic(exercisesCorrect: number, exercisesAttempted: number): boolean {
  if (exercisesAttempted === 0) return false
  return calculateProgress(exercisesCorrect, exercisesAttempted) < 50
}
