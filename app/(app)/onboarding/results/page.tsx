import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LevelReport } from '@/components/onboarding/LevelReport'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Tu plan de nivelación — CDIA Tutor',
}

export default async function ResultsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('summer_mode_progress')
    .select('level_report')
    .eq('user_id', user.id)
    .single()

  if (!data?.level_report) redirect('/onboarding/diagnostic')

  return <LevelReport report={data.level_report as Record<string, 'needs_review' | 'ok'>} />
}
