'use client'

import { useState, useTransition } from 'react'
import { markModuleComplete } from '@/app/(app)/onboarding/actions'
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

export function SummerModuleSession({
  moduleId,
  moduleName,
  subject,
  planProgress,
}: SummerModuleSessionProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null)
  const [isPending, startTransition] = useTransition()

  const modes: SessionMode[] = ['explain', 'exercise', 'review']

  function handleComplete() {
    startTransition(async () => {
      await markModuleComplete(moduleId)
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-xs text-text-muted">
          <span className="font-semibold uppercase tracking-widest text-primary">Summer Mode</span>
          <span>·</span>
          <span>
            {planProgress.completed} / {planProgress.total} módulos completados
          </span>
        </div>
        <h1 className="text-2xl font-bold text-text">{moduleName}</h1>
      </div>

      {/* Topic selector */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
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
              {selectedTopic?.id === topic.id && (
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
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Elige el modo
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {modes.map((mode) => (
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

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {selectedTopic && selectedMode && (
          <Button
            onClick={() => {
              // TODO F4: navigate to chat session with summer mode context
              alert(`Sesión: ${selectedTopic.name} — ${MODE_LABELS[selectedMode]}`)
            }}
          >
            Empezar sesión
          </Button>
        )}
        <Button variant="outline" onClick={handleComplete} disabled={isPending}>
          {isPending ? 'Guardando…' : 'Marcar módulo como completado'}
        </Button>
      </div>
    </div>
  )
}
