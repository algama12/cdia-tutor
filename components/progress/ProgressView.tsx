import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { getTopicStats, calculateSubjectProgress } from '@/lib/utils/curriculum'
import type { Subject, TopicProgress } from '@/types'

interface ProgressViewProps {
  subjects: Subject[]
  progress: TopicProgress[]
}

export function ProgressView({ subjects, progress }: ProgressViewProps) {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-text">Tu progreso</h1>

      <div className="space-y-6">
        {subjects.map((subject) => {
          const subjectStats = calculateSubjectProgress(subject, progress)

          return (
            <div key={subject.id} className="rounded-xl border border-border bg-surface">
              {/* Subject header */}
              <div className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-text">{subject.name}</h2>
                    <span className="shrink-0 rounded-full bg-border-subtle px-2 py-0.5 text-xs text-text-muted">
                      S{subject.semester}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-subtle">
                      <div
                        className="h-full rounded-full bg-secondary transition-all duration-500"
                        style={{ width: `${subjectStats.progressPercent}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-sm font-medium text-text">
                      {subjectStats.progressPercent}%
                    </span>
                  </div>
                </div>
                <Link
                  href={`/subject/${subject.id}`}
                  className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-text"
                >
                  Estudiar
                </Link>
              </div>

              {/* Topic list */}
              <div className="border-t border-border-subtle">
                {subject.topics.map((topic, i) => {
                  const stats = getTopicStats(subject.id, topic.id, progress)
                  const isLast = i === subject.topics.length - 1

                  return (
                    <div
                      key={topic.id}
                      className={[
                        'flex items-center gap-4 px-6 py-3',
                        !isLast ? 'border-b border-border-subtle' : '',
                      ].join(' ')}
                    >
                      {/* Topic name + weak badge */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-text-muted">{topic.name}</span>
                          {stats.isWeak && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning">
                              <AlertTriangle className="size-3" aria-hidden="true" />
                              Débil
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="flex shrink-0 items-center gap-2">
                        {stats.hasActivity ? (
                          <>
                            <div className="h-1 w-20 overflow-hidden rounded-full bg-border-subtle">
                              <div
                                className={[
                                  'h-full rounded-full transition-all duration-500',
                                  stats.isWeak ? 'bg-error' : 'bg-secondary',
                                ].join(' ')}
                                style={{ width: `${stats.percent}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-xs font-medium text-text">
                              {stats.percent}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-text-faint">Sin actividad</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
