import type { Subject, Topic, TopicProgress } from '@/types'

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

export function calculateSubjectProgress(
  subject: Subject,
  progress: TopicProgress[]
): { topicsWorked: number; totalTopics: number; progressPercent: number; weakTopicsCount: number } {
  const subjectProgress = progress.filter((p) => p.subjectId === subject.id)
  const totalTopics = subject.topics.length

  let topicsWorked = 0
  let weakTopicsCount = 0

  for (const topic of subject.topics) {
    const p = subjectProgress.find((sp) => sp.topicId === topic.id)
    if (p && p.exercisesAttempted > 0) {
      topicsWorked++
      if (isWeakTopic(p.exercisesCorrect, p.exercisesAttempted)) {
        weakTopicsCount++
      }
    }
  }

  const progressPercent = totalTopics === 0 ? 0 : Math.round((topicsWorked / totalTopics) * 100)

  return { topicsWorked, totalTopics, progressPercent, weakTopicsCount }
}
