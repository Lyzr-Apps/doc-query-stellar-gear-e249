'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getDocuments, uploadAndTrainDocument, deleteDocuments, crawlWebsite } from '@/lib/ragKnowledgeBase'
import type { RAGDocument } from '@/lib/ragKnowledgeBase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { FiUpload, FiFile, FiTrash2, FiSearch, FiLink, FiX } from 'react-icons/fi'

const RAG_ID = '69a27bbef572c99c0ffbe5b7'

interface DocumentSectionProps {
  showSample: boolean
}

const SAMPLE_DOCS: RAGDocument[] = [
  { fileName: 'Employee Handbook 2025.pdf', fileType: 'pdf', status: 'active', uploadedAt: '2025-01-15T10:30:00Z' },
  { fileName: 'IT Security Policy.docx', fileType: 'docx', status: 'active', uploadedAt: '2025-01-20T14:00:00Z' },
  { fileName: 'Engineering Dept Supplement.pdf', fileType: 'pdf', status: 'active', uploadedAt: '2025-02-01T09:15:00Z' },
  { fileName: 'Product Roadmap Q1.txt', fileType: 'txt', status: 'processing', uploadedAt: '2025-02-10T16:45:00Z' },
  { fileName: 'Onboarding Checklist.pdf', fileType: 'pdf', status: 'active', uploadedAt: '2025-02-12T11:00:00Z' },
]

function getFileIcon(fileType: string) {
  const colors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    docx: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    txt: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  }
  return colors[fileType] ?? 'bg-gray-100 text-gray-600'
}

function getStatusBadge(status?: string) {
  switch (status) {
    case 'active':
      return <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Indexed</Badge>
    case 'processing':
      return <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Processing</Badge>
    case 'failed':
      return <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">Error</Badge>
    default:
      return <Badge variant="secondary" className="text-[10px] border-0">Unknown</Badge>
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '--'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '--'
  }
}

export default function DocumentSection({ showSample }: DocumentSectionProps) {
  const [documents, setDocuments] = useState<RAGDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [crawling, setCrawling] = useState(false)
  const [crawlMsg, setCrawlMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = useCallback(async () => {
    setDocsLoading(true)
    try {
      const result = await getDocuments(RAG_ID)
      if (result.success && Array.isArray(result.documents)) {
        setDocuments(result.documents)
      }
    } catch {
      // Silent fail, show empty state
    } finally {
      setDocsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const displayDocs = showSample && documents.length === 0 ? SAMPLE_DOCS : documents

  const filteredDocs = displayDocs.filter(doc =>
    (doc?.fileName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileUpload = async (files: FileList | File[]) => {
    setUploadMsg(null)
    const fileArr = Array.from(files)
    if (fileArr.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorMsg = ''

    for (const file of fileArr) {
      try {
        const result = await uploadAndTrainDocument(RAG_ID, file)
        if (result.success) {
          successCount++
        } else {
          errorMsg = result.error ?? 'Upload failed'
        }
      } catch {
        errorMsg = 'Network error during upload'
      }
    }

    if (successCount > 0) {
      setUploadMsg({ type: 'success', text: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully` })
      await fetchDocs()
    } else {
      setUploadMsg({ type: 'error', text: errorMsg || 'Upload failed' })
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleCrawl = async () => {
    const url = urlInput.trim()
    if (!url) return
    setCrawlMsg(null)
    setCrawling(true)

    try {
      const result = await crawlWebsite(RAG_ID, url)
      if (result.success) {
        setCrawlMsg({ type: 'success', text: `Website crawled successfully` })
        setUrlInput('')
        await fetchDocs()
      } else {
        setCrawlMsg({ type: 'error', text: result.error ?? 'Crawl failed' })
      }
    } catch {
      setCrawlMsg({ type: 'error', text: 'Network error during crawl' })
    } finally {
      setCrawling(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    setDeletingFile(fileName)
    try {
      const result = await deleteDocuments(RAG_ID, [fileName])
      if (result.success) {
        setDocuments(prev => prev.filter(d => d.fileName !== fileName))
      }
    } catch {
      // Silent fail
    } finally {
      setDeletingFile(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Document Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Upload documents or crawl websites to build your company knowledge base.</p>
        </div>

        {/* Upload & Crawl Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Dropzone */}
          <Card className="bg-card/80 backdrop-blur-[16px] border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FiUpload className="h-4 w-4" /> Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <FiUpload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground/80">
                  {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT supported</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                className="hidden"
                onChange={e => {
                  if (e.target.files) handleFileUpload(e.target.files)
                }}
              />
              {uploadMsg && (
                <div className={cn(
                  'mt-3 px-3 py-2 rounded-lg text-xs flex items-center justify-between',
                  uploadMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                )}>
                  <span>{uploadMsg.text}</span>
                  <button onClick={() => setUploadMsg(null)} className="ml-2 hover:opacity-70">
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* URL Crawl */}
          <Card className="bg-card/80 backdrop-blur-[16px] border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FiLink className="h-4 w-4" /> Crawl Website
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Enter a URL to crawl and index its content into the knowledge base.</p>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://wiki.company.com/..."
                  className="text-sm border-border/60"
                  onKeyDown={e => { if (e.key === 'Enter') handleCrawl() }}
                />
                <Button
                  onClick={handleCrawl}
                  disabled={!urlInput.trim() || crawling}
                  size="sm"
                  className="shrink-0"
                >
                  {crawling ? 'Crawling...' : 'Crawl'}
                </Button>
              </div>
              {crawlMsg && (
                <div className={cn(
                  'mt-3 px-3 py-2 rounded-lg text-xs flex items-center justify-between',
                  crawlMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                )}>
                  <span>{crawlMsg.text}</span>
                  <button onClick={() => setCrawlMsg(null)} className="ml-2 hover:opacity-70">
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border/40" />

        {/* Document List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">
              Knowledge Base Documents
              {!docsLoading && <span className="text-muted-foreground ml-1">({filteredDocs.length})</span>}
            </h3>
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-9 text-sm h-9 border-border/60"
              />
            </div>
          </div>

          {docsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-card/80 border border-border/40">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <FiFile className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {searchQuery ? 'Try a different search term' : 'Upload PDFs, DOCX, or TXT files to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc, idx) => (
                <div
                  key={doc?.fileName ?? idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/80 backdrop-blur-[16px] border border-border/40 hover:border-border/70 transition-colors group"
                >
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', getFileIcon(doc?.fileType ?? ''))}>
                    <FiFile className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc?.fileName ?? 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc?.uploadedAt)}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase shrink-0">{doc?.fileType ?? '--'}</Badge>
                  {getStatusBadge(doc?.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600"
                    onClick={() => doc?.fileName && handleDelete(doc.fileName)}
                    disabled={deletingFile === doc?.fileName}
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
