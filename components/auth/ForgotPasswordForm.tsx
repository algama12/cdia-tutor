'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { sendPasswordReset } from '@/app/(auth)/forgot-password/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await sendPasswordReset(formData)
      if (result && 'error' in result) setError(result.error)
      if (result && 'success' in result) setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="text-success" size={48} aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-text">Revisa tu email</h2>
        <p className="text-text-muted text-sm">
          Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
        </p>
        <Link
          href="/login"
          className="block text-primary hover:text-primary-hover text-sm transition-colors duration-150"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text">Recuperar contraseña</h2>
        <p className="text-sm text-text-muted mt-1">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-error bg-error-subtle border border-error/20 rounded-md px-4 py-3"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            disabled={isPending}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" aria-hidden />
              Enviando...
            </>
          ) : (
            'Enviar enlace de recuperación'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        <Link
          href="/login"
          className="text-primary hover:text-primary-hover font-medium transition-colors duration-150"
        >
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
