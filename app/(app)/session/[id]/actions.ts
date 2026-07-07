'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('messages').insert({
    session_id: sessionId,
    role,
    content,
  })

  if (error) return { error: error.message }
  return null
}

export async function endSession(
  sessionId: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return null
}
