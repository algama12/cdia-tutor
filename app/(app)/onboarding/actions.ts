'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateDiagnosticLevel, generateLevelingPlan } from '@/lib/utils/summer-mode'
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnostic-questions'
import type { DiagnosticAnswer } from '@/types'

export async function skipSummerMode(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('summer_mode_progress')
    .upsert({ user_id: user.id, status: 'skipped' }, { onConflict: 'user_id' })

  redirect('/dashboard')
}

export async function saveDiagnosticAnswers(answers: DiagnosticAnswer[]): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const report = calculateDiagnosticLevel(answers, DIAGNOSTIC_QUESTIONS)
  const plan = generateLevelingPlan(report)

  await supabase.from('summer_mode_progress').upsert(
    {
      user_id: user.id,
      status: 'in_progress',
      level_report: report,
      leveling_plan: plan,
    },
    { onConflict: 'user_id' }
  )

  redirect('/onboarding/results')
}

export async function markModuleComplete(moduleId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch existing plan
  const { data } = await supabase
    .from('summer_mode_progress')
    .select('leveling_plan, completed_modules')
    .eq('user_id', user.id)
    .single()

  const completed: string[] = Array.isArray(data?.completed_modules)
    ? (data.completed_modules as string[])
    : []

  if (!completed.includes(moduleId)) {
    completed.push(moduleId)
  }

  const plan: string[] = Array.isArray(data?.leveling_plan)
    ? (data.leveling_plan as string[])
    : []
  const allDone = plan.every((id) => completed.includes(id))

  await supabase
    .from('summer_mode_progress')
    .update({
      completed_modules: completed,
      status: allDone ? 'completed' : 'in_progress',
    })
    .eq('user_id', user.id)

  if (allDone) {
    redirect('/dashboard')
  } else {
    // Next module in plan
    const nextModule = plan.find((id) => !completed.includes(id))
    if (nextModule) {
      redirect(`/onboarding/modules/${nextModule}`)
    } else {
      redirect('/dashboard')
    }
  }
}
