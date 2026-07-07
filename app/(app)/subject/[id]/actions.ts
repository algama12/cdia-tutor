'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SessionMode } from '@/types'

export type CreateSessionResult = { sessionId: string } | { error: string }

export async function createSession(
  subjectId: string,
  topicId: string,
  mode: SessionMode
): Promise<CreateSessionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      topic_id: topicId,
      mode,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Error al crear la sesión' }
  }

  return { sessionId: data.id }
}
