'use server'

import { createClient } from '@/lib/supabase/server'

export type ResetResult = { error: string } | { success: true } | null

export async function sendPasswordReset(formData: FormData): Promise<ResetResult> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email) {
    return { error: 'El email es obligatorio' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
