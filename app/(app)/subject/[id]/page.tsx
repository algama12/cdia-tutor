import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { SubjectTopicSelector } from '@/components/subject/SubjectTopicSelector'
import { getSubjectById } from '@/lib/utils/curriculum'
import curriculumData from '@/data/curriculum.json'
import type { Curriculum } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const subject = getSubjectById(curriculumData as Curriculum, id)
  return {
    title: subject ? `${subject.name} — CDIA Tutor` : 'Asignatura — CDIA Tutor',
  }
}

export default async function SubjectPage({ params }: Props) {
  const { id } = await params

  const subject = getSubjectById(curriculumData as Curriculum, id)
  if (!subject) redirect('/dashboard')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <AppShell userFullName={profile?.full_name ?? null} userEmail={user.email ?? null}>
      <SubjectTopicSelector subject={subject} />
    </AppShell>
  )
}
