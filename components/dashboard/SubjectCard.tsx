import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface SubjectCardProps {
  id: string
  name: string
  semester: number
  totalTopics: number
  topicsWorked: number
  progressPercent: number
  weakTopicsCount: number
}

export function SubjectCard({
  id,
  name,
  semester,
  totalTopics,
  topicsWorked,
  progressPercent,
  weakTopicsCount,
}: SubjectCardProps) {
  const isWeak = weakTopicsCount > 0

  return (
    <Link
      href={`/subject/${id}`}
      className="block rounded-xl border border-border bg-surface p-6 transition-colors duration-150 hover:border-primary hover:bg-elevated"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-xl font-semibold leading-snug text-text">{name}</h2>
        <span className="shrink-0 rounded-full bg-border-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
          S{semester}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
          <span>{topicsWorked} / {totalTopics} temas trabajados</span>
          <span className="font-medium text-text">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
          <div
            className={[
              'h-full rounded-full transition-all duration-500',
              progressPercent === 0 ? 'w-0' : isWeak ? 'bg-error' : 'bg-secondary',
            ].join(' ')}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Weak topics badge */}
      {weakTopicsCount > 0 && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning-subtle px-2.5 py-1 text-xs font-medium text-warning">
          <AlertTriangle className="size-3" aria-hidden="true" />
          {weakTopicsCount} {weakTopicsCount === 1 ? 'tema débil' : 'temas débiles'}
        </div>
      )}
    </Link>
  )
}
