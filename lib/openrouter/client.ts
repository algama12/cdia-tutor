const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'anthropic/claude-sonnet-4-5'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatOptions {
  messages: ChatMessage[]
  temperature?: number
  stream?: boolean
}

export async function streamChat(options: ChatOptions): Promise<Response> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`)
  }

  return response
}
