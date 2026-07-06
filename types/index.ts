export interface Subtopic {
  name: string
}

export interface Topic {
  id: string
  name: string
  subtopics: string[]
}

export interface Subject {
  id: string
  name: string
  semester: number
  year: number
  topics: Topic[]
}

export interface Curriculum {
  subjects: Subject[]
}

export type SessionMode = 'explain' | 'exercise' | 'review'

export interface Session {
  id: string
  userId: string
  subjectId: string
  topicId: string
  mode: SessionMode
  createdAt: string
  endedAt: string | null
}

export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface TopicProgress {
  id: string
  userId: string
  subjectId: string
  topicId: string
  exercisesAttempted: number
  exercisesCorrect: number
  lastSeenAt: string
}

export interface UserProfile {
  id: string
  fullName: string | null
  createdAt: string
}
