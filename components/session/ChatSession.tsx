'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { MessageBubble } from '@/components/session/MessageBubble'
import { saveMessage, endSession } from '@/app/(app)/session/[id]/actions'
import { Button } from '@/components/ui/Button'
import type { SessionMode } from '@/types'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatSessionProps {
  sessionId: string
  subjectId: string
  subjectName: string
  topicId: string
  topicName: string
  subtopics: string[]
  mode: SessionMode
  initialMessages: { role: 'user' | 'assistant'; content: string }[]
  progress: { exercisesAttempted: number; exercisesCorrect: number }
}

const MODE_LABELS: Record<SessionMode, string> = {
  explain: 'Explicación',
  exercise: 'Ejercicio',
  review: 'Repaso',
}

export function ChatSession({
  sessionId,
  subjectId,
  subjectName,
  topicId,
  topicName,
  subtopics,
  mode,
  initialMessages,
  progress,
}: ChatSessionProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<LocalMessage[]>(
    initialMessages.map((m, i) => ({ ...m, id: `init-${i}` }))
  )
  const [input, setInput] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPendingEnd, startEndTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  async function handleSend() {
    const content = input.trim()
    if (!content || isStreaming) return

    const userMsg: LocalMessage = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setError(null)

    // Persist user message
    await saveMessage(sessionId, 'user', content)

    // Build message history for API
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))

    setIsStreaming(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: history,
          subjectName,
          topicName,
          subtopics,
          mode,
          progress,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreamingContent(accumulated)
      }

      // Finalize: move streaming content into messages list
      const assistantMsg: LocalMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: accumulated,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setStreamingContent('')

      // Persist assistant message
      await saveMessage(sessionId, 'assistant', accumulated)
    } catch {
      setError('Error al conectar con el tutor. Inténtalo de nuevo.')
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleEnd() {
    startEndTransition(async () => {
      await endSession(sessionId)
      router.push('/dashboard')
    })
  }

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href={`/subject/${subjectId}`}
          className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
          aria-label="Volver"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
        <div className="h-4 w-px bg-border" aria-hidden="true" />
        <span className="text-sm font-medium text-text">{subjectName}</span>
        <span className="text-text-faint">·</span>
        <span className="text-sm text-text-muted">{topicName}</span>
        <span className="ml-auto inline-flex items-center rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-medium text-primary">
          {MODE_LABELS[mode]}
        </span>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        role="log"
        aria-live="polite"
        aria-label="Conversación"
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {/* Streaming bubble */}
          {isStreaming && (
            <MessageBubble
              role="assistant"
              content={streamingContent}
              isStreaming
            />
          )}

          {/* Error */}
          {error && (
            <p role="alert" className="text-center text-sm text-error">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-bg px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para nueva línea)"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
            style={{ maxHeight: '8rem', overflowY: 'auto' }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? 'Enviando…' : 'Enviar'}
          </Button>
          <Button
            variant="outline"
            onClick={handleEnd}
            disabled={isPendingEnd || isStreaming}
          >
            {isPendingEnd ? 'Finalizando…' : 'Finalizar sesión'}
          </Button>
        </div>
      </div>
    </div>
  )
}
