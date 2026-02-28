'use client'

import React, { useState, useCallback, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FiMessageSquare, FiBookOpen, FiPlus, FiMenu, FiX, FiFolder } from 'react-icons/fi'
import ChatSection from './sections/ChatSection'
import DocumentSection from './sections/DocumentSection'

class PageErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackLabel?: string },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode; fallbackLabel?: string }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const AGENT_ID = '69a27bd2e558069e826f0417'

type ActiveSection = 'chat' | 'docs'

export default function Page() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('chat')
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNewChat = useCallback(() => {
    setSessionId(`session-${Date.now()}`)
    setActiveSection('chat')
    setSidebarOpen(false)
  }, [])

  const navigateTo = useCallback((section: ActiveSection) => {
    setActiveSection(section)
    setSidebarOpen(false)
  }, [])

  return (
    <div
      className="min-h-screen h-screen flex overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(135deg, hsl(210 20% 97%) 0%, hsl(220 25% 95%) 35%, hsl(200 20% 96%) 70%, hsl(230 15% 97%) 100%)',
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-40 md:z-auto h-full w-64 shrink-0 bg-white/90 backdrop-blur-[16px] border-r border-border/50 flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FiBookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight">CompanyIQ</span>
          </div>
          <button
            type="button"
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <Separator className="bg-border/40 shrink-0" />

        {/* New Chat button */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm border-border/50 hover:bg-muted/50"
            onClick={handleNewChat}
          >
            <FiPlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-2 space-y-1 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo('chat')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
              activeSection === 'chat'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <FiMessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            type="button"
            onClick={() => navigateTo('docs')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
              activeSection === 'docs'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <FiFolder className="h-4 w-4" />
            Documents
          </button>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sample Data toggle */}
        <div className="px-4 py-3 border-t border-border/40 shrink-0">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-muted-foreground font-medium">Sample Data</span>
            <Switch checked={showSample} onCheckedChange={setShowSample} />
          </label>
        </div>

        {/* Agent Status */}
        <div className="px-4 py-3 border-t border-border/40 shrink-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Agent Status</p>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full shrink-0',
                activeAgentId ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'
              )}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Knowledge Q&A Agent</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {activeAgentId ? 'Processing...' : 'Ready'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="h-14 border-b border-border/50 bg-white/60 backdrop-blur-[16px] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden text-muted-foreground hover:text-foreground p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-medium">
              {activeSection === 'chat' ? 'Knowledge Q&A' : 'Document Management'}
            </h1>
            {activeAgentId && (
              <Badge variant="secondary" className="text-[10px] animate-pulse">Processing</Badge>
            )}
          </div>
          {activeSection === 'chat' && (
            <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={handleNewChat}>
              <FiPlus className="h-3.5 w-3.5" />
              New Chat
            </Button>
          )}
        </header>

        {/* Section Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <PageErrorBoundary>
            {activeSection === 'chat' ? (
              <ChatSection
                sessionId={sessionId}
                onSetActiveAgent={setActiveAgentId}
                showSample={showSample}
              />
            ) : (
              <DocumentSection showSample={showSample} />
            )}
          </PageErrorBoundary>
        </div>
      </main>
    </div>
  )
}
