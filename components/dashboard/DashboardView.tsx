'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sun } from 'lucide-react'
import { SubjectCard } from '@/components/dashboard/SubjectCard'
import { calculateSubjectProgress } from '@/lib/utils/curriculum'
import type { Subject, TopicProgress } from '@/types'

interface DashboardViewProps {
  subjects: Subject[]
  progress: TopicProgress[]
  userFullName: string | null
  hasSummerMode: boolean
}

export function DashboardView({ subjects, progress, userFullName, hasSummerMode }: DashboardViewProps) {
  const [semester, setSemester] = useState<1 | 2>(1)

  const filtered = subjects.filter((s) => s.semester === semester)

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">
            {userFullName ? `Bienvenido, ${userFullName}` : 'Bienvenido'}
          </h1>
          <p className="mt-1 text-sm text-text-muted">Selecciona una asignatura para empezar</p>
        </div>

        {hasSummerMode && (
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-subtle px-4 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/10"
          >
            <Sun className="size-4" aria-hidden="true" />
            Summer Mode
          </Link>
        )}
      </div>

      {/* Semester toggle */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-surface p-1 w-fit">
        {([1, 2] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSemester(s)}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors duration-150',
              semester === s
                ? 'bg-elevated text-text shadow-sm'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            S{s}
          </button>
        ))}
      </div>

      {/* Subject grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((subject) => {
          const stats = calculateSubjectProgress(subject, progress)
          return (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              semester={subject.semester}
              totalTopics={stats.totalTopics}
              topicsWorked={stats.topicsWorked}
              progressPercent={stats.progressPercent}
              weakTopicsCount={stats.weakTopicsCount}
            />
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-text-muted">
          No hay asignaturas en este semestre.
        </p>
      )}
    </div>
  )
}
