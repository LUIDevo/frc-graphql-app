import { useState, useRef, useEffect } from 'react'

interface AIChatProps {
  context?: string          // e.g. "Match 42 · Red Alliance"
  outputText?: string       // current AI analysis text (HTML allowed)
  suggestions?: string[]
  placeholder?: string
  onSend?: (message: string) => void
  onRefresh?: () => void
  loading?: boolean
}

export default function AIChat({
  context,
  outputText,
  suggestions = [],
  placeholder = 'Ask a follow-up…',
  onSend,
  onRefresh,
  loading = false,
}: AIChatProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [input])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSend?.(trimmed)
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800">
          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
          </span>
          <span className="text-xs font-semibold text-white">AI Strategy</span>
          {context && (
            <span className="text-xs text-zinc-500 font-mono ml-1">{context}</span>
          )}
          <div className="flex-1" />
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-zinc-500 hover:text-white transition-colors disabled:opacity-30 text-sm px-1"
              title="Refresh analysis"
            >
              ↺
            </button>
          )}
        </div>

        {/* Output area */}
        {(outputText || loading) && (
          <div className="px-3 py-3 border-b border-zinc-800 font-mono text-xs text-zinc-300 leading-relaxed min-h-[60px]">
            {loading ? (
              <span className="text-zinc-500 animate-pulse">Thinking…</span>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: outputText ?? '' }} />
            )}
          </div>
        )}

        {/* Input area */}
        <div className="px-3 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-600 resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-zinc-600 flex items-center gap-1">
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />
              </svg>
              Gemini 2.5 Flash
            </span>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Ask
            <svg width={11} height={11} viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { setInput(s); textareaRef.current?.focus() }}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-full transition-colors"
            >
              <span className="text-yellow-500 text-[10px]">✦</span>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
