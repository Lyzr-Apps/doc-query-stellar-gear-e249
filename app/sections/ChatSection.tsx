'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { FiSend, FiChevronDown, FiChevronRight, FiAlertTriangle, FiBookOpen } from 'react-icons/fi'

const AGENT_ID = '69a27bd2e558069e826f0417'

interface Source {
  document_name?: string
  section?: string
  excerpt?: string
  relevance?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  hasConflicts?: boolean
  conflictSummary?: string
}

interface ChatSectionProps {
  sessionId: string
  onSetActiveAgent: (id: string | null) => void
  showSample: boolean
}

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: 'sample-1',
    role: 'user',
    content: 'What is our remote work policy?',
  },
  {
    id: 'sample-2',
    role: 'assistant',
    content: 'Our remote work policy allows employees to work from home up to 3 days per week. You must coordinate with your manager to ensure team coverage. Remote work arrangements should be documented and approved through HR Connect. Employees are expected to maintain regular working hours (9 AM - 5 PM local time) and remain accessible via Slack and email during those hours.',
    sources: [
      {
        document_name: 'Employee Handbook 2025.pdf',
        section: 'Section 4.2 - Remote Work Guidelines',
        excerpt: 'Employees may work remotely up to three (3) days per week with manager approval. Remote schedules must ensure adequate team coverage and be submitted through HR Connect.',
        relevance: 'Primary policy document defining remote work eligibility and requirements',
      },
      {
        document_name: 'IT Security Policy.docx',
        section: 'Section 7 - Remote Access',
        excerpt: 'Remote workers must use company-approved VPN and ensure their home network meets minimum security standards.',
        relevance: 'Supplementary security requirements for remote work',
      },
    ],
    hasConflicts: false,
    conflictSummary: '',
  },
  {
    id: 'sample-3',
    role: 'user',
    content: 'How many vacation days do new employees get?',
  },
  {
    id: 'sample-4',
    role: 'assistant',
    content: 'New employees receive 15 days of paid vacation per year, accrued monthly at 1.25 days per month. However, there is a discrepancy between the general handbook and the engineering department supplement regarding carryover limits. Please review the sources below for complete details.',
    sources: [
      {
        document_name: 'Employee Handbook 2025.pdf',
        section: 'Section 6.1 - Paid Time Off',
        excerpt: 'New hires receive 15 days of PTO annually, accrued at 1.25 days/month. Unused days may be carried over up to 5 days.',
        relevance: 'General company PTO policy for all new hires',
      },
      {
        document_name: 'Engineering Dept Supplement.pdf',
        section: 'Benefits Addendum',
        excerpt: 'Engineering team members may carry over up to 10 unused PTO days into the following year.',
        relevance: 'Department-specific override that conflicts with general policy',
      },
    ],
    hasConflicts: true,
    conflictSummary: 'The Employee Handbook allows carryover of up to 5 days, while the Engineering Department Supplement allows up to 10 days. Engineering employees should confirm with HR which limit applies to them.',
  },
]

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-background/60 border border-border/50 hover:bg-background/80 transition-colors text-left group">
          <FiBookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground/80 truncate flex-1">
            {source?.document_name ?? 'Unknown Document'}
          </span>
          {source?.section && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{source.section}</Badge>
          )}
          {open ? (
            <FiChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : (
            <FiChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 py-2 mt-1 rounded-lg bg-muted/30 border border-border/30 space-y-2">
          {source?.excerpt && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Excerpt</p>
              <p className="text-xs text-foreground/80 leading-relaxed italic">&ldquo;{source.excerpt}&rdquo;</p>
            </div>
          )}
          {source?.relevance && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Relevance</p>
              <p className="text-xs text-foreground/70 leading-relaxed">{source.relevance}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function ChatSection({ sessionId, onSetActiveAgent, showSample }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset messages when sessionId changes (New Chat)
  useEffect(() => {
    setMessages([])
    setInputValue('')
    setLoading(false)
  }, [sessionId])

  const displayMessages = showSample && messages.length === 0 ? SAMPLE_MESSAGES : messages

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [displayMessages, loading, scrollToBottom])

  const handleSubmit = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setLoading(true)
    onSetActiveAgent(AGENT_ID)

    try {
      const result = await callAIAgent(trimmed, AGENT_ID, { session_id: sessionId })

      if (result.success) {
        const agentResult = result?.response?.result
        const answer = agentResult?.answer ?? agentResult?.text ?? result?.response?.message ?? 'No answer received.'
        const sources = Array.isArray(agentResult?.sources) ? agentResult.sources : []
        const hasConflicts = agentResult?.has_conflicts === true
        const conflictSummary = agentResult?.conflict_summary ?? ''

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: typeof answer === 'string' ? answer : JSON.stringify(answer),
          sources,
          hasConflicts,
          conflictSummary,
        }
        setMessages(prev => [...prev, assistantMsg])
      } else {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `I encountered an error processing your question. ${result?.error ?? 'Please try again.'}`,
        }
        setMessages(prev => [...prev, errorMsg])
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'An unexpected error occurred. Please try again.',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
      onSetActiveAgent(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {displayMessages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <FiBookOpen className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Welcome to CompanyIQ</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Ask me anything about company policies, technical docs, or product info. I will find answers from the knowledge base and cite my sources.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {displayMessages.map(msg => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] md:max-w-[75%]', msg.role === 'user' ? 'order-1' : 'order-1')}>
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border/60 shadow-sm backdrop-blur-[16px] rounded-bl-md'
                    )}
                  >
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {/* Sources */}
                  {msg.role === 'assistant' && Array.isArray(msg?.sources) && msg.sources.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                        {msg.sources.length} source{msg.sources.length !== 1 ? 's' : ''} referenced
                      </p>
                      {msg.sources.map((source, idx) => (
                        <SourceCard key={idx} source={source} index={idx} />
                      ))}
                    </div>
                  )}

                  {/* Conflict Badge */}
                  {msg.role === 'assistant' && msg.hasConflicts && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2">
                      <FiAlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">Conflicting sources found</p>
                        {msg.conflictSummary && (
                          <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">{msg.conflictSummary}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] md:max-w-[75%]">
                  <div className="px-4 py-4 rounded-2xl rounded-bl-md bg-card border border-border/60 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.2s' }} />
                        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.2s' }} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Searching knowledge base...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 rounded-full bg-muted animate-pulse w-full" />
                      <div className="h-3 rounded-full bg-muted animate-pulse w-4/5" />
                      <div className="h-3 rounded-full bg-muted animate-pulse w-3/5" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-[16px] px-4 md:px-8 py-4">
        <form
          className="max-w-3xl mx-auto flex gap-3 items-end"
          onSubmit={e => { e.preventDefault(); handleSubmit() }}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about company knowledge..."
            rows={1}
            className="flex-1 resize-none min-h-[44px] max-h-[140px] rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm text-sm px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className={cn(
              'h-11 w-11 rounded-xl shrink-0 flex items-center justify-center transition-colors',
              !inputValue.trim() || loading
                ? 'bg-primary/50 text-primary-foreground/60 cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
            )}
          >
            <FiSend className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
