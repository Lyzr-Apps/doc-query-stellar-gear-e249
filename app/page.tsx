'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FiMessageSquare, FiPlus, FiMenu, FiX, FiFolder, FiBookOpen } from 'react-icons/fi'
import ChatSection from './sections/ChatSection'
import DocumentSection from './sections/DocumentSection'
import LandingPage from './landing/LandingPage'

export default function Page() {
  const [activeSection, setActiveSection] = useState<'chat' | 'docs'>('chat')
  const [sessionId, setSessionId] = useState('initial')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const initialized = useRef(false)

  // Set session ID on client only to avoid hydration mismatch
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      setSessionId(`session-${Date.now()}`)
    }
  }, [])

  const handleNewChat = useCallback(() => {
    setSessionId(`session-${Date.now()}`)
    setActiveSection('chat')
    setSidebarOpen(false)
  }, [])

  if (showLanding) {
    return (
      <LandingPage
        onEnterApp={() => {
          setShowLanding(false)
          setActiveSection('chat')
        }}
        onGoToDocs={() => {
          setShowLanding(false)
          setActiveSection('docs')
        }}
      />
    )
  }

  return (
    <div
      className="h-screen w-screen flex overflow-hidden bg-background text-foreground"
      style={{
        backgroundImage: 'linear-gradient(135deg, hsl(210 20% 97%) 0%, hsl(220 25% 95%) 35%, hsl(200 20% 96%) 70%, hsl(230 15% 97%) 100%)',
      }}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static z-40 inset-y-0 left-0 w-64 flex flex-col bg-white/90 backdrop-blur-[16px] border-r border-border/50 transition-transform duration-200 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FiBookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight">CompanyIQ</span>
          </div>
          <button
            type="button"
            className="md:hidden p-1 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
            onClick={handleNewChat}
          >
            <FiPlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Nav */}
        <div className="px-3 py-2 space-y-1 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveSection('chat'); setSidebarOpen(false); }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              activeSection === 'chat'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <FiMessageSquare className="h-4 w-4 flex-shrink-0" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveSection('docs'); setSidebarOpen(false); }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              activeSection === 'docs'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <FiFolder className="h-4 w-4 flex-shrink-0" />
            <span>Documents</span>
          </button>
        </div>

        <div className="flex-1 min-h-0" />

        {/* Sample Data toggle */}
        <div className="px-4 py-3 border-t border-border/40 shrink-0">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-muted-foreground font-medium">Sample Data</span>
            <Switch checked={showSample} onCheckedChange={setShowSample} />
          </label>
        </div>

        {/* Agent status */}
        <div className="px-4 py-3 border-t border-border/40 shrink-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Agent</p>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full shrink-0',
              activeAgentId ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'
            )} />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Knowledge Q&A Agent</p>
              <p className="text-[10px] text-muted-foreground">{activeAgentId ? 'Processing...' : 'Ready'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-14 px-4 flex items-center justify-between border-b border-border/50 bg-white/60 backdrop-blur-[16px] shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-1 text-muted-foreground hover:text-foreground"
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

        {/* Section content */}
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
      </div>
    </div>
  )
}
