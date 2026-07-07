'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveDiagnosticAnswers } from '@/app/(app)/onboarding/actions'
import { Button } from '@/components/ui/Button'
import type { DiagnosticAnswer, DiagnosticQuestion } from '@/types'

interface DiagnosticQuizProps {
  questions: DiagnosticQuestion[]
}

export function DiagnosticQuiz({ questions }: DiagnosticQuizProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const total = questions.length

  function handleOptionSelect(optionIndex: number) {
    setSelectedIndex(optionIndex)
  }

  function handleNext() {
    if (selectedIndex === null) return

    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, selectedIndex },
    ]
    setAnswers(newAnswers)
    setSelectedIndex(null)

    if (isLastQuestion) {
      startTransition(async () => {
        await saveDiagnosticAnswers(newAnswers)
        router.push('/onboarding/results')
      })
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
          <span>Pregunta {currentIndex + 1} de {total}</span>
          <span>{Math.round(((currentIndex) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(currentIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <h2 className="mb-6 text-xl font-semibold text-text">{currentQuestion.text}</h2>

        <div className="mb-8 space-y-3">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              aria-pressed={selectedIndex === i}
              onClick={() => handleOptionSelect(i)}
              className={[
                'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors',
                selectedIndex === i
                  ? 'border-primary bg-primary-subtle text-text'
                  : 'border-border bg-elevated text-text-muted hover:border-primary hover:text-text',
              ].join(' ')}
            >
              <span className="mr-3 font-mono text-xs text-text-faint">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          {isLastQuestion ? (
            <Button
              onClick={handleNext}
              disabled={selectedIndex === null || isPending}
            >
              {isPending ? 'Procesando…' : 'Ver resultados'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedIndex === null}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
