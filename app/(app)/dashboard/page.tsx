import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardView } from '@/components/dashboard/DashboardView'
import curriculumData from '@/data/curriculum.json'
import type { Curriculum, TopicProgress } from '@/types'

export const metadata: Metadata = {
  title: 'Dashboard — CDIA Tutor',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch topic progress
  const { data: rawProgress } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', user.id)

  const progress: TopicProgress[] = (rawProgress ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    subjectId: p.subject_id,
    topicId: p.topic_id,
    exercisesAttempted: p.exercises_attempted,
    exercisesCorrect: p.exercises_correct,
    lastSeenAt: p.last_seen_at,
  }))

  // Check summer mode status
  const { data: summerMode } = await supabase
    .from('summer_mode_progress')
    .select('status')
    .eq('user_id', user.id)
    .single()

  const hasSummerMode =
    summerMode?.status === 'in_progress' || summerMode?.status === 'not_started'

  const curriculum = curriculumData as Curriculum

  return (
    <AppShell
      userFullName={profile?.full_name ?? null}
      userEmail={user.email ?? null}
    >
      <DashboardView
        subjects={curriculum.subjects}
        progress={progress}
        userFullName={profile?.full_name ?? null}
        hasSummerMode={hasSummerMode}
      />
    </AppShell>
  )
}
