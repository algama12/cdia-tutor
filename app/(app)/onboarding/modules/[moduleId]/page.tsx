import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MODULE_NAMES, MODULE_ORDER } from '@/lib/utils/summer-mode'
import type { SummerModuleId } from '@/lib/utils/summer-mode'
import { SummerModuleSession } from '@/components/onboarding/SummerModuleSession'
import curriculumSummer from '@/data/curriculum-summer.json'

interface Props {
  params: Promise<{ moduleId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params
  const name = MODULE_NAMES[moduleId as SummerModuleId] ?? 'Módulo Summer'
  return { title: `${name} — CDIA Tutor` }
}

export default async function SummerModulePage({ params }: Props) {
  const { moduleId } = await params

  if (!MODULE_ORDER.includes(moduleId as SummerModuleId)) redirect('/onboarding')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const subject = curriculumSummer.subjects.find((s) => s.id === moduleId)
  if (!subject) redirect('/onboarding')

  const { data: progress } = await supabase
    .from('summer_mode_progress')
    .select('leveling_plan, completed_modules')
    .eq('user_id', user.id)
    .single()

  const plan: string[] = Array.isArray(progress?.leveling_plan)
    ? (progress.leveling_plan as string[])
    : []
  const completed: string[] = Array.isArray(progress?.completed_modules)
    ? (progress.completed_modules as string[])
    : []
  const totalInPlan = plan.length
  const completedCount = plan.filter((id) => completed.includes(id)).length

  return (
    <SummerModuleSession
      moduleId={moduleId}
      moduleName={MODULE_NAMES[moduleId as SummerModuleId] ?? subject.name}
      subject={subject}
      planProgress={{ completed: completedCount, total: totalInPlan }}
    />
  )
}
