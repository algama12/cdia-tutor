import { createClient } from '@/lib/supabase/server'
import { streamChat } from '@/lib/openrouter/client'
import { buildTutorPrompt } from '@/lib/prompts/tutor'
import type { ChatMessage } from '@/lib/openrouter/client'
import type { SessionMode } from '@/types'

interface ChatRequestBody {
  sessionId: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  subjectName: string
  topicName: string
  subtopics: string[]
  mode: SessionMode
  progress: { exercisesAttempted: number; exercisesCorrect: number }
}

function isValidMode(mode: unknown): mode is SessionMode {
  return mode === 'explain' || mode === 'exercise' || mode === 'review'
}

function validateBody(body: unknown): ChatRequestBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (
    typeof b.sessionId !== 'string' ||
    !Array.isArray(b.messages) ||
    typeof b.subjectName !== 'string' ||
    typeof b.topicName !== 'string' ||
    !Array.isArray(b.subtopics) ||
    !isValidMode(b.mode)
  ) {
    return null
  }
  return b as unknown as ChatRequestBody
}

/** Transforms OpenRouter SSE stream into plain text chunks */
function sseToTextStream(openRouterResponse: Response): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  const reader = openRouterResponse.body!.getReader()
  let buffer = ''

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const parsed = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[]
            }
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}

export async function POST(request: Request): Promise<Response> {
  // Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const validated = validateBody(body)
  if (!validated) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const { messages, subjectName, topicName, subtopics, mode, progress } = validated

  const temperature = mode === 'exercise' ? 0.4 : mode === 'review' ? 0.5 : 0.7

  const systemPrompt = buildTutorPrompt({ subjectName, topicName, subtopics, mode, progress })

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  let openRouterResponse: Response
  try {
    openRouterResponse = await streamChat({ messages: chatMessages, temperature })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OpenRouter error'
    return new Response(JSON.stringify({ error: message }), { status: 502 })
  }

  return new Response(sseToTextStream(openRouterResponse), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
