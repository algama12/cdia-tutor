'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginResult = { error: string } | null

export async function loginWithEmail(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Credenciales inválidas. Comprueba tu email y contraseña.' }
  }

  redirect('/dashboard')
}

export async function loginWithGoogle(): Promise<{ error: string } | undefined> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
