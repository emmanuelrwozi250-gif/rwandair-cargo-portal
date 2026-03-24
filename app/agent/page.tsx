'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Plane, Zap, Package, FileText, Leaf, Globe2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import ConnectivityLines from '@/components/brand/ConnectivityLines'

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolResults?: { name: string; result: unknown }[]
  streaming?: boolean
}

const SUGGESTED_PROMPTS = [
  { icon: '💊', text: 'Ship pharmaceuticals to Dubai' },
  { icon: '✈️', text: 'Export coffee urgently to London' },
  { icon: '📋', text: 'Documents for live animals to Amsterdam?' },
  { icon: '📦', text: 'Consolidate my Kigali cargo with others' },
  { icon: '🌸', text: 'Fresh flowers to AMS — best route?' },
]

function ToolBadge({ name, result }: { name: string; result: unknown }) {
  const labels: Record<string, string> = {
    get_quote: '💵 Quote generated',
    find_consolidation: '📦 Consolidation matched',
    check_capacity: '✈️ Capacity checked',
    get_customs_requirements: '📋 Customs docs retrieved',
    initiate_whatsapp_tracking: '📱 WhatsApp tracking set',
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1"
         style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-sky)', border: '1px solid rgba(30,162,220,0.2)' }}>
      {labels[name] || `🔧 ${name}`}
    </div>
  )
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [noApiKey, setNoApiKey] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const userText = text || input.trim()
    if (!userText || loading) return

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userText },
    ]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Add streaming assistant placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.error?.includes('ANTHROPIC_API_KEY')) {
          setNoApiKey(true)
        }
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: err.error || 'Something went wrong. Please try again.',
            streaming: false,
          }
          return copy
        })
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      const toolResults: { name: string; result: unknown }[] = []

      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const event = JSON.parse(data)
            if (event.type === 'text') {
              setMessages(prev => {
                const copy = [...prev]
                const last = copy[copy.length - 1]
                copy[copy.length - 1] = {
                  ...last,
                  content: last.content + event.text,
                  streaming: true,
                }
                return copy
              })
            } else if (event.type === 'tool_use') {
              toolResults.push({ name: event.name, result: event.result })
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  toolResults: [...toolResults],
                }
                return copy
              })
            } else if (event.type === 'error') {
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: `Error: ${event.message}`,
                  streaming: false,
                }
                return copy
              })
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      // Mark streaming done
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          streaming: false,
        }
        return copy
      })
    } catch (err) {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Connection error. Please check your internet connection and try again.',
          streaming: false,
        }
        return copy
      })
    }

    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div className="pt-16 flex flex-col" style={{ height: '100dvh', background: 'var(--wb-gray-50)' }}>
        {/* Agent header */}
        <div className="relative overflow-hidden shrink-0"
             style={{ background: 'var(--wb-blue)' }}>
          <ConnectivityLines opacity={0.1} animated={false} />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                 style={{ background: 'var(--wb-sky)' }}>
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white" style={{ fontSize: '1.125rem', marginBottom: 0 }}>
                RwandAir Cargo Intelligence Agent
              </h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Powered by Claude · Quotes, consolidation, customs & more
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#94c943' }} />
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Online</span>
            </div>
          </div>
        </div>

        {/* No API key warning */}
        {noApiKey && (
          <div className="mx-4 mt-3 p-3 rounded-xl text-sm text-center"
               style={{ background: '#fff9e6', border: '1px solid #f59e0b44', color: '#92400e' }}>
            Add <code className="px-1 rounded" style={{ background: '#fef3c7' }}>ANTHROPIC_API_KEY</code> to your{' '}
            <code>.env.local</code> to enable the AI agent.
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
            {/* Welcome state */}
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
                     style={{ background: 'var(--wb-sky-light)' }}>
                  <Plane className="w-8 h-8" style={{ color: 'var(--wb-sky)' }} />
                </div>
                <h3 className="mb-2" style={{ color: 'var(--wb-blue)' }}>
                  Your Africa cargo expert
                </h3>
                <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
                  I can quote, consolidate, check capacity, retrieve customs documents, and more. What are you shipping today?
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {SUGGESTED_PROMPTS.map(({ icon, text }) => (
                    <button key={text} onClick={() => send(text)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                            style={{ background: 'white', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }}>
                      <span>{icon}</span> {text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 mt-1"
                       style={{ background: 'var(--wb-sky)' }}>
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-lg ${msg.role === 'user' ? 'bubble-user px-4 py-3' : 'bubble-agent px-4 py-3'}`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap"
                       style={{ color: msg.role === 'user' ? 'white' : 'var(--wb-gray-900)' }}>
                    {msg.content}
                    {msg.streaming && (
                      <span className="inline-block w-1 h-4 ml-0.5 align-middle animate-pulse rounded"
                            style={{ background: 'var(--wb-sky)' }} />
                    )}
                  </div>
                  {msg.toolResults && msg.toolResults.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.toolResults.map((tr, j) => (
                        <ToolBadge key={j} name={tr.name} result={tr.result} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t px-4 sm:px-6 py-4"
             style={{ background: 'white', borderColor: 'var(--wb-gray-200)' }}>
          <div className="max-w-4xl mx-auto">
            {/* Suggested prompts (compact) */}
            {messages.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
                {SUGGESTED_PROMPTS.map(({ icon, text }) => (
                  <button key={text} onClick={() => send(text)}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
                    {icon} {text}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Ask about shipping, consolidation, customs, capacity…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  border: '1.5px solid var(--wb-gray-200)',
                  maxHeight: '120px',
                  color: 'var(--wb-gray-900)',
                  background: 'var(--wb-gray-50)',
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: !input.trim() || loading ? 'var(--wb-gray-200)' : 'var(--wb-sky)',
                  color: !input.trim() || loading ? 'var(--wb-gray-500)' : 'white',
                }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--wb-gray-500)' }}>
              AI agent · Responses may vary · Always verify critical shipment details
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
