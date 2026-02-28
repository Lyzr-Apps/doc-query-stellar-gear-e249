'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FiMessageSquare, FiBookOpen, FiPlus, FiMenu, FiX } from 'react-icons/fi'
import ChatSection from './sections/ChatSection'
import DocumentSection from './sections/DocumentSection'

const THEME_VARS = {
  '--background': '0 0% 100%',
  '--foreground': '222 47% 11%',
  '--card': '0 0% 98%',
  '--card-foreground': '222 47% 11%',
  '--primary': '222 47% 11%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '210 20% 95%',
  '--secondary-foreground': '222 47% 11%',
  '--muted': '210 20% 95%',
  '--muted-foreground': '215 16% 47%',
  '--accent': '210 20% 95%',
  '--accent-foreground': '222 47% 11%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '220 13% 91%',
  '--input': '220 13% 91%',
  '--ring': '222 47% 11%',
  '--radius': '0.875rem',
  backgroundImage: 'linear-gradient(135deg, hsl(210 20% 97%) 0%, hsl(220 25% 95%) 35%, hsl(200 20% 96%) 70%, hsl(230 15% 97%) 100%)',
} as React.CSSProperties

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
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

const AGENT_INFO = {
  id: '69a27bd2e558069e826f0417',
  name: 'Knowledge Q&A Agent',
  purpose: 'Answers questions using the company knowledge base with source citations',
}

type Section = 'chat' | 'docs'

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: 'Chat', icon: <FiMessageSquare className="h-4 w-4" /> },
  { id: 'docs', label: 'Documents', icon: <FiBookOpen className="h-4 w-4" /> },
]

export default function Page() {
  const [activeSection, setActiveSection] = useState<Section>('chat')
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNewChat = useCallback(() => {
    setSessionId(`session-${Date.now()}`)
    setActiveSection('chat')
    setSidebarOpen(false)
  }, [])

  const handleNavClick = useCallback((section: Section) => {
    setActiveSection(section)
    setSidebarOpen(false)
  }, [])

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen h-screen bg-background text-foreground flex overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          'fixed md:relative z-40 md:z-auto h-full w-64 bg-card/90 backdrop-blur-[16px] border-r border-border/50 flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}>
          {/* Logo */}
          <div className="px-5 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FiBookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">CompanyIQ</span>
            </div>
            <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <Separator className="bg-border/40" />

          {/* New Chat button */}
          <div className="px-3 pt-4 pb-2">
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
          <nav className="flex-1 px-3 py-2 space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sample Data toggle */}
          <div className="px-4 py-3 border-t border-border/40">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-muted-foreground font-medium">Sample Data</span>
              <Switch checked={showSample} onCheckedChange={setShowSample} />
            </label>
          </div>

          {/* Agent Status */}
          <div className="px-4 py-3 border-t border-border/40">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Agent Status</p>
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full shrink-0',
                activeAgentId ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'
              )} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{AGENT_INFO.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{activeAgentId ? 'Processing...' : 'Ready'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top Header */}
          <header className="h-14 border-b border-border/50 bg-card/60 backdrop-blur-[16px] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="text-sm font-medium text-foreground">
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
          <div className="flex-1 min-h-0">
            {activeSection === 'chat' ? (
              <ChatSection
                sessionId={sessionId}
                onSetActiveAgent={setActiveAgentId}
                showSample={showSample}
              />
            ) : (
              <DocumentSection showSample={showSample} />
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
