'use server'

import { createClient } from '@/lib/supabase/server'

export type RegisterResult = { error: string } | { success: true } | null

export async function registerWithEmail(formData: FormData): Promise<RegisterResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()

  if (!email || !password || !fullName) {
    return { error: 'Todos los campos son obligatorios' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { error: 'Este email ya está registrado' }
    }
    return { error: error.message }
  }

  return { success: true }
}
