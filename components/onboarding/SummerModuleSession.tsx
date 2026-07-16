'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, ArrowLeft } from 'lucide-react'
import { markModuleComplete } from '@/app/(app)/onboarding/actions'
import { createSession } from '@/app/(app)/subject/[id]/actions'
import { Button } from '@/components/ui/Button'
import type { SessionMode } from '@/types'

interface Topic {
  id: string
  name: string
  subtopics: string[]
}

interface Subject {
  id: string
  name: string
  topics: Topic[]
}

interface PlanProgress {
  completed: number
  total: number
}

interface SummerModuleSessionProps {
  moduleId: string
  moduleName: string
  subject: Subject
  planProgress: PlanProgress
  plan: string[]
  completedModules: string[]
  allModuleNames: Record<string, string>
}

const MODE_LABELS: Record<SessionMode, string> = {
  explain: 'Explicación',
  exercise: 'Ejercicio',
  review: 'Repaso',
}

const MODE_DESCRIPTIONS: Record<SessionMode, string> = {
  explain: 'El tutor explica el tema paso a paso',
  exercise: 'El tutor propone ejercicios y evalúa tus respuestas',
  review: 'El tutor hace preguntas cortas para verificar comprensión',
}

const MODES: SessionMode[] = ['explain', 'exercise', 'review']

export function SummerModuleSession({
  moduleId,
  moduleName,
  subject,
  planProgress,
  plan,
  completedModules,
  allModuleNames,
}: SummerModuleSessionProps) {
  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleStartSession() {
    if (!selectedTopic || !selectedMode) return
    setIsStarting(true)
    setStartError(null)
    const result = await createSession(moduleId, selectedTopic.id, selectedMode)
    if ('error' in result) {
      setStartError(result.error)
      setIsStarting(false)
      return
    }
    router.push(`/session/${result.sessionId}`)
  }

  function handleComplete() {
    startTransition(async () => {
      await markModuleComplete(moduleId)
    })
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar: plan modules nav */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
        <div className="px-5 py-6">
          <Link
            href="/dashboard"
            className="mb-6 flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Dashboard
          </Link>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Summer Mode
          </p>
          <p className="mb-5 text-xs text-text-faint">
            {planProgress.completed} / {planProgress.total} completados
          </p>
          <nav className="space-y-1">
            {plan.map((id) => {
              const isComplete = completedModules.includes(id)
              const isCurrent = id === moduleId
              return (
                <Link
                  key={id}
                  href={`/onboarding/modules/${id}`}
                  className={[
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    isCurrent
                      ? 'bg-primary-subtle font-medium text-primary'
                      : 'text-text-muted hover:bg-elevated hover:text-text',
                  ].join(' ')}
                >
                  {isComplete ? (
                    <CheckCircle2 size={14} className="shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <Circle size={14} className="shrink-0 text-text-faint" aria-hidden="true" />
                  )}
                  <span className={isComplete ? 'line-through opacity-60' : ''}>
                    {allModuleNames[id] ?? id}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Mobile top nav */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Dashboard
          </Link>
          <span className="text-text-faint">·</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Summer Mode
          </span>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-1 text-xs text-text-faint">
              {planProgress.completed} / {planProgress.total} módulos completados
            </div>
            <h1 className="text-2xl font-bold text-text">{moduleName}</h1>
          </div>

          {/* Topic selector */}
          <section className="mb-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
              Elige un tema
            </h2>
            <div className="space-y-2">
              {subject.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic)
                    setSelectedMode(null)
                  }}
                  className={[
                    'w-full rounded-lg border px-4 py-3 text-left transition-colors',
                    selectedTopic?.id === topic.id
                      ? 'border-primary bg-primary-subtle text-text'
                      : 'border-border bg-surface text-text-muted hover:border-primary hover:text-text',
                  ].join(' ')}
                >
                  <span className="font-medium">{topic.name}</span>
                  {selectedTopic?.id === topic.id && topic.subtopics.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-xs text-text-muted">
                      {topic.subtopics.map((sub, i) => (
                        <li key={i}>· {sub}</li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Mode selector */}
          {selectedTopic && (
            <section className="mb-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                Elige el modo
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MODES.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={[
                      'rounded-lg border px-4 py-4 text-left transition-colors',
                      selectedMode === mode
                        ? 'border-primary bg-primary-subtle'
                        : 'border-border bg-surface hover:border-primary',
                    ].join(' ')}
                  >
                    <div className="mb-1 font-semibold text-text">{MODE_LABELS[mode]}</div>
                    <div className="text-xs text-text-muted">{MODE_DESCRIPTIONS[mode]}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Error */}
          {startError && (
            <p role="alert" className="mb-4 rounded-md border border-error/20 bg-error-subtle px-4 py-3 text-sm text-error">
              {startError}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {selectedTopic && selectedMode && (
              <Button onClick={handleStartSession} disabled={isStarting}>
                {isStarting ? 'Creando sesión…' : 'Empezar sesión'}
              </Button>
            )}
            <Button variant="outline" onClick={handleComplete} disabled={isPending}>
              {isPending ? 'Guardando…' : 'Marcar módulo como completado'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
