'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  FiSearch,
  FiBookOpen,
  FiMessageSquare,
  FiShield,
  FiZap,
  FiUpload,
  FiArrowRight,
  FiCheckCircle,
  FiFileText,
  FiLayers,
} from 'react-icons/fi'

interface LandingPageProps {
  onEnterApp: () => void
  onGoToDocs: () => void
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-[16px] border border-border/40 rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function StepCard({
  stepNumber,
  icon,
  title,
  description,
}: {
  stepNumber: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 px-4">
      <div className="relative">
        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-sm">
          {stepNumber}
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function StatItem({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-[8px] border border-border/30 rounded-xl px-5 py-3.5">
      <div className="text-primary">{icon}</div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Decorative Hero Chat Preview                                       */
/* ------------------------------------------------------------------ */

function HeroChatPreview() {
  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-lg overflow-hidden w-full max-w-md">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <FiBookOpen className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-xs font-semibold text-foreground">CompanyIQ</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="p-4 space-y-3">
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 text-sm max-w-[85%]">
            What is our company&apos;s remote work policy?
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start">
          <div className="bg-white border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 text-sm max-w-[90%] space-y-2">
            <p className="text-foreground leading-relaxed">
              Employees may work remotely up to <strong>3 days per week</strong> with manager approval.
              Core hours are <strong>10 AM - 3 PM</strong> in your local timezone.
            </p>
            <div className="flex items-start gap-2 pt-1 border-t border-border/30">
              <FiFileText className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-primary">HR-Policy-2024.pdf</p>
                <p className="text-[10px] text-muted-foreground">Section 4.2 - Remote Work Guidelines</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */

export default function LandingPage({ onEnterApp, onGoToDocs }: LandingPageProps) {
  return (
    <div className="min-h-screen w-full overflow-y-auto scroll-smooth">
      {/* ======== HERO SECTION ======== */}
      <section
        className="relative w-full"
        style={{
          backgroundImage:
            'linear-gradient(135deg, hsl(210 20% 97%) 0%, hsl(220 25% 95%) 35%, hsl(200 20% 96%) 70%, hsl(230 15% 97%) 100%)',
        }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 50% at 50% 20%, hsl(222 47% 11% / 0.04), transparent)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 md:pt-28 md:pb-32">
          {/* Nav bar */}
          <nav className="absolute top-0 left-0 right-0 px-5 py-5 flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <FiBookOpen className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">CompanyIQ</span>
            </div>
            <button
              type="button"
              onClick={onEnterApp}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Open App
            </button>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left - copy */}
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15] text-foreground">
                Your Company Knowledge, Instantly Accessible
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
                CompanyIQ uses AI to search across all your internal documents, policies, and
                resources. Get accurate answers with source citations in seconds.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-3 text-sm font-semibold transition-colors shadow-sm"
                >
                  Start Asking Questions
                  <FiArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onGoToDocs}
                  className="inline-flex items-center gap-2 border border-border bg-white/80 hover:bg-accent rounded-xl px-6 py-3 text-sm font-semibold text-foreground transition-colors"
                >
                  Explore Documents
                </button>
              </div>
            </div>

            {/* Right - decorative chat preview */}
            <div className="flex justify-center md:justify-end">
              <HeroChatPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ======== FEATURES SECTION ======== */}
      <section className="w-full bg-white/40 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Features</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Everything you need for internal knowledge
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FiSearch className="h-5 w-5" />}
              title="Intelligent Search"
              description="Ask questions in natural language and get precise answers from your entire knowledge base."
            />
            <FeatureCard
              icon={<FiBookOpen className="h-5 w-5" />}
              title="Source Citations"
              description="Every answer comes with document sources, sections, and relevant excerpts for full transparency."
            />
            <FeatureCard
              icon={<FiShield className="h-5 w-5" />}
              title="Conflict Detection"
              description="Automatically identifies when documents contain conflicting information and highlights discrepancies."
            />
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS SECTION ======== */}
      <section
        className="w-full py-20 md:py-24"
        style={{
          backgroundImage:
            'linear-gradient(180deg, hsl(210 20% 97%) 0%, hsl(0 0% 100%) 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">How It Works</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Three simple steps to answers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-px bg-border/60" />

            <StepCard
              stepNumber={1}
              icon={<FiUpload className="h-6 w-6" />}
              title="Upload Documents"
              description="Add PDFs, DOCX, or TXT files to build your knowledge base."
            />
            <StepCard
              stepNumber={2}
              icon={<FiMessageSquare className="h-6 w-6" />}
              title="Ask Questions"
              description="Type your question in natural language - just like asking a colleague."
            />
            <StepCard
              stepNumber={3}
              icon={<FiZap className="h-6 w-6" />}
              title="Get Answers"
              description="Receive accurate, sourced answers in seconds with conflict alerts."
            />
          </div>
        </div>
      </section>

      {/* ======== STATS / TRUST SECTION ======== */}
      <section className="w-full py-16 md:py-20 bg-white/40">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Trusted by teams who value accuracy
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <StatItem label="100% Source Cited" icon={<FiCheckCircle className="h-5 w-5" />} />
            <StatItem label="Real-time Conflict Detection" icon={<FiShield className="h-5 w-5" />} />
            <StatItem label="Multi-format Support" icon={<FiLayers className="h-5 w-5" />} />
          </div>
        </div>
      </section>

      {/* ======== FOOTER CTA SECTION ======== */}
      <section
        className="w-full py-20 md:py-24"
        style={{
          backgroundImage:
            'linear-gradient(135deg, hsl(220 25% 95%) 0%, hsl(210 20% 97%) 50%, hsl(230 15% 97%) 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to unlock your company knowledge?
          </h2>
          <p className="text-muted-foreground mb-8 text-base">
            Stop searching through folders. Start getting instant, accurate answers.
          </p>
          <button
            type="button"
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3.5 text-sm font-semibold transition-colors shadow-sm"
          >
            Start Asking Questions
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="w-full py-6 border-t border-border/40 bg-white/60">
        <p className="text-center text-xs text-muted-foreground">Powered by CompanyIQ</p>
      </footer>
    </div>
  )
}
