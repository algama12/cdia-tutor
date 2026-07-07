'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginWithEmail, loginWithGoogle } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await loginWithEmail(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleGoogleLogin() {
    setError(null)
    startTransition(async () => {
      const result = await loginWithGoogle()
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text">Iniciar sesión</h2>
        <p className="text-sm text-text-muted mt-1">Bienvenido de vuelta</p>
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

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-hover transition-colors duration-150"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" aria-hidden />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-text-faint">o</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="w-full gap-2"
      >
        <GoogleIcon />
        Continuar con Google
      </Button>

      <p className="text-center text-sm text-text-muted">
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          className="text-primary hover:text-primary-hover font-medium transition-colors duration-150"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 0 1-1.6 2.41v2h2.59c1.51-1.39 2.39-3.44 2.39-5.87Z"
        fill="#4285F4"
      />
      <path
        d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.6-2.02c-.71.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H.85v2.08A8 8 0 0 0 8 16Z"
        fill="#34A853"
      />
      <path
        d="M3.53 9.51A4.8 4.8 0 0 1 3.28 8c0-.53.09-1.04.25-1.51V4.41H.85A8 8 0 0 0 0 8c0 1.29.31 2.51.85 3.59l2.68-2.08Z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.2c1.17 0 2.22.4 3.05 1.19l2.28-2.28A8 8 0 0 0 .85 4.41l2.68 2.08C4.16 4.6 5.92 3.2 8 3.2Z"
        fill="#EA4335"
      />
    </svg>
  )
}
