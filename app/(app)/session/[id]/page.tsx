import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { ChatSession } from '@/components/session/ChatSession'
import { getSubjectById, getTopicById } from '@/lib/utils/curriculum'
import curriculumData from '@/data/curriculum.json'
import type { Curriculum, SessionMode, TopicProgress } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Sesión de tutoría — CDIA Tutor' }

export default async function SessionPage({ params }: Props) {
  const { id: sessionId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch session
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) redirect('/dashboard')

  // Fetch existing messages
  const { data: rawMessages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  const initialMessages = (rawMessages ?? []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Fetch topic progress for this topic
  const { data: rawProgress } = await supabase
    .from('topic_progress')
    .select('exercises_attempted, exercises_correct')
    .eq('user_id', user.id)
    .eq('subject_id', session.subject_id)
    .eq('topic_id', session.topic_id)
    .single()

  const progress = {
    exercisesAttempted: rawProgress?.exercises_attempted ?? 0,
    exercisesCorrect: rawProgress?.exercises_correct ?? 0,
  }

  // Fetch profile for sidebar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Resolve subject + topic names from curriculum
  const curriculum = curriculumData as Curriculum
  const subject = getSubjectById(curriculum, session.subject_id)
  const topic = subject ? getTopicById(subject, session.topic_id) : undefined

  const subjectName = subject?.name ?? session.subject_id
  const topicName = topic?.name ?? session.topic_id
  const subtopics = topic?.subtopics ?? []

  return (
    <AppShell userFullName={profile?.full_name ?? null} userEmail={user.email ?? null}>
      <ChatSession
        sessionId={sessionId}
        subjectId={session.subject_id}
        subjectName={subjectName}
        topicId={session.topic_id}
        topicName={topicName}
        subtopics={subtopics}
        mode={session.mode as SessionMode}
        initialMessages={initialMessages}
        progress={progress}
      />
    </AppShell>
  )
}
