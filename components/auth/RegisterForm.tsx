'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { registerWithEmail } from '@/app/(auth)/register/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await registerWithEmail(formData)
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
        <h2 className="text-xl font-semibold text-text">Confirma tu email</h2>
        <p className="text-text-muted text-sm">
          Te hemos enviado un enlace de confirmación. Revisa tu bandeja de entrada y spam.
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
        <h2 className="text-xl font-semibold text-text">Crear cuenta</h2>
        <p className="text-sm text-text-muted mt-1">Empieza tu tutoría personalizada</p>
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
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            placeholder="Tu nombre"
            disabled={isPending}
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              disabled={isPending}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Repite tu contraseña"
              disabled={isPending}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirm ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" aria-hidden />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="text-primary hover:text-primary-hover font-medium transition-colors duration-150"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
