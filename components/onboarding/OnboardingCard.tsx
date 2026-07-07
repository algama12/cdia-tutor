'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { skipSummerMode } from '@/app/(app)/onboarding/actions'
import { Button } from '@/components/ui/Button'

export function OnboardingCard() {
  const [isPending, startTransition] = useTransition()

  function handleSkip() {
    startTransition(async () => {
      await skipSummerMode()
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-xl border border-border bg-surface p-8">
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          Paso previo recomendado
        </div>
        <h1 className="mb-4 text-3xl font-bold text-text">Summer Mode</h1>
        <p className="mb-6 text-text-muted">
          Antes de empezar con el temario oficial del grado, te recomendamos hacer un
          <strong className="text-text"> repaso de matemáticas</strong> de bachillerato.
          Si llevas tiempo sin estudiar, este módulo de nivelación te ayudará a asentar
          las bases que necesitas.
        </p>

        <div className="mb-8 rounded-lg border border-border-subtle bg-elevated px-6 py-4">
          <p className="mb-3 text-sm font-medium text-text-muted">Módulos incluidos:</p>
          <ul className="space-y-1 text-sm text-text-muted">
            <li>· Aritmética y álgebra básica (fracciones, ecuaciones)</li>
            <li>· Funciones y gráficas (dominio, tipos de funciones)</li>
            <li>· Trigonometría esencial (seno, coseno, identidades)</li>
            <li>· Introducción a límites y derivadas</li>
            <li>· Geometría vectorial básica (vectores, producto escalar)</li>
            <li>· Combinatoria y lógica básica</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/onboarding/diagnostic"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Sí, quiero nivelarme
          </Link>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isPending}
          >
            {isPending ? 'Saltando…' : 'Saltar al temario oficial'}
          </Button>
        </div>
      </div>
    </div>
  )
}
