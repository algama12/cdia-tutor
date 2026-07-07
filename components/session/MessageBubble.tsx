import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function MessageBubble({ role, content, isStreaming = false }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed',
          isUser
            ? 'self-end rounded-tr-sm border border-primary/30 bg-primary-subtle text-text'
            : 'self-start rounded-tl-sm border border-border bg-surface text-text',
        ].join(' ')}
      >
        {isUser ? (
          <p>{content}</p>
        ) : (
          <div className="prose prose-invert max-w-none text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span
                data-streaming
                className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
