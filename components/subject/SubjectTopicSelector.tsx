'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Lightbulb, Zap, Eye } from 'lucide-react'
import { createSession } from '@/app/(app)/subject/[id]/actions'
import { Button } from '@/components/ui/Button'
import type { Subject, SessionMode } from '@/types'

interface SubjectTopicSelectorProps {
  subject: Subject
}

const MODES: { id: SessionMode; label: string; icon: React.ElementType }[] = [
  { id: 'explain', label: 'Explicación', icon: Lightbulb },
  { id: 'exercise', label: 'Ejercicio', icon: Zap },
  { id: 'review', label: 'Repaso', icon: Eye },
]

export function SubjectTopicSelector({ subject }: SubjectTopicSelectorProps) {
  const router = useRouter()
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleTopicClick(topicId: string) {
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null)
    } else {
      setExpandedTopicId(topicId)
      setSelectedMode(null)
      setError(null)
    }
  }

  function handleStart() {
    if (!expandedTopicId || !selectedMode) return

    startTransition(async () => {
      const result = await createSession(subject.id, expandedTopicId, selectedMode)
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push(`/session/${result.sessionId}`)
    })
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-text transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-text">{subject.name}</span>
      </nav>

      {/* Heading */}
      <h1 className="mb-8 text-3xl font-bold leading-snug text-text">{subject.name}</h1>

      {/* Topic list */}
      <div className="space-y-3">
        {subject.topics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id

          return (
            <div
              key={topic.id}
              className={[
                'rounded-xl border transition-colors duration-150',
                isExpanded ? 'border-primary bg-surface' : 'border-border bg-surface hover:border-primary',
              ].join(' ')}
            >
              {/* Topic header — clickable */}
              <button
                onClick={() => handleTopicClick(topic.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                aria-expanded={isExpanded}
              >
                <span className="font-semibold text-text">{topic.name}</span>
                <ChevronRight
                  className={[
                    'size-4 shrink-0 text-text-muted transition-transform duration-150',
                    isExpanded ? 'rotate-90' : '',
                  ].join(' ')}
                  aria-hidden="true"
                />
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border-subtle px-6 pb-6 pt-4">
                  {/* Subtopics */}
                  <ul className="mb-5 space-y-1">
                    {topic.subtopics.map((sub, i) => (
                      <li key={i} className="text-sm text-text-muted">
                        · {sub}
                      </li>
                    ))}
                  </ul>

                  {/* Mode pills */}
                  <div className="mb-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
                      Modo de sesión
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MODES.map(({ id, label, icon: Icon }) => {
                        const isActive = selectedMode === id
                        return (
                          <button
                            key={id}
                            aria-pressed={isActive}
                            onClick={() => setSelectedMode(id)}
                            className={[
                              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                              isActive
                                ? 'bg-primary text-text-inverse'
                                : 'border border-border text-text-muted hover:border-primary hover:text-text',
                            ].join(' ')}
                          >
                            <Icon className="size-3.5" aria-hidden="true" />
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p role="alert" className="mb-4 text-sm text-error">
                      {error}
                    </p>
                  )}

                  {/* Start button */}
                  <Button
                    onClick={handleStart}
                    disabled={!selectedMode || isPending}
                  >
                    {isPending ? 'Iniciando…' : 'Iniciar sesión'}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
