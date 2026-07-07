import Link from 'next/link'
import {
  generateLevelingPlan,
  MODULE_NAMES,
  MODULE_ORDER,
  type SummerModuleId,
} from '@/lib/utils/summer-mode'
import type { LevelReport as LevelReportType } from '@/types'

interface LevelReportProps {
  report: LevelReportType
}

export function LevelReport({ report }: LevelReportProps) {
  const plan = generateLevelingPlan(report)
  const needsReviewCount = plan.length
  const allOk = needsReviewCount === 0
  const firstModule = plan[0]

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-xl border border-border bg-surface p-8">
        <h1 className="mb-2 text-2xl font-bold text-text">Resultados del diagnóstico</h1>

        {allOk ? (
          <p className="mb-6 text-text-muted">
            ¡Enhorabuena! Tienes una base sólida en todos los módulos. Puedes empezar directamente
            con el temario oficial del grado.
          </p>
        ) : (
          <p className="mb-6 text-text-muted">
            Hemos detectado{' '}
            <strong className="text-text">{needsReviewCount} módulo{needsReviewCount !== 1 ? 's' : ''}</strong>{' '}
            que conviene repasar antes de empezar el grado.
          </p>
        )}

        {/* Module list */}
        <div className="mb-8 space-y-2">
          {MODULE_ORDER.map((id) => {
            const level = report[id as SummerModuleId] ?? 'needs_review'
            const name = MODULE_NAMES[id as SummerModuleId] ?? id
            const needsReview = level === 'needs_review'

            return (
              <div
                key={id}
                className={[
                  'flex items-center gap-3 rounded-lg border px-4 py-3',
                  needsReview
                    ? 'border-warning/30 bg-warning-subtle'
                    : 'border-success/30 bg-success-subtle',
                ].join(' ')}
              >
                <span className={needsReview ? 'text-warning' : 'text-success'}>
                  {needsReview ? '○' : '✓'}
                </span>
                <span className="text-sm font-medium text-text">{name}</span>
                <span
                  className={[
                    'ml-auto text-xs font-semibold uppercase tracking-wide',
                    needsReview ? 'text-warning' : 'text-success',
                  ].join(' ')}
                >
                  {needsReview ? 'Repasar' : 'OK'}
                </span>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {allOk ? (
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
            >
              Ir al dashboard
            </Link>
          ) : (
            <>
              <Link
                href={`/onboarding/modules/${firstModule}`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
              >
                Empezar plan de nivelación
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-transparent px-6 text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                Ir al dashboard ahora
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
