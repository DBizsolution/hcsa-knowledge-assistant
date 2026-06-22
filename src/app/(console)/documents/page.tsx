'use client'

import { useState } from 'react'
import {
  FileText,
  FileCheck2,
  Presentation,
  Sparkles,
  Download,
  Quote,
  Loader2,
  Maximize2,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  docForTemplate,
  type GeneratedDoc,
  type DocBlock,
  type DocSpan,
} from '@/data/generated-docs'

const TEMPLATES = [
  {
    id: 'briefing',
    icon: FileText,
    title: 'Briefing note',
    desc: 'Concise summary of a topic across sources',
    topic: 'Eco rebate eligibility for contractors',
    audience: 'Development Projects officers',
  },
  {
    id: 'compliance',
    icon: FileCheck2,
    title: 'Compliance memo',
    desc: 'Obligations and requirements from policies & SOPs',
    topic: 'Tenant compliance obligations',
    audience: 'Commercial Properties officers',
  },
  {
    id: 'executive',
    icon: Presentation,
    title: 'Executive summary',
    desc: 'Leadership-ready overview with key figures',
    topic: 'Sustainability standards FY2025 position',
    audience: 'Leadership',
  },
] as const

export default function DocumentGenerationPage() {
  const [templateId, setTemplateId] = useState<string>('briefing')
  const [topic, setTopic] = useState<string>(TEMPLATES[0].topic)
  const [audience, setAudience] = useState<string>(TEMPLATES[0].audience)
  const [notes, setNotes] = useState(
    'Keep it concise. Emphasise the documentation officers must check.',
  )
  const [generating, setGenerating] = useState(false)
  const doc = docForTemplate(templateId)

  function selectTemplate(id: string) {
    const tpl = TEMPLATES.find((item) => item.id === id)
    if (!tpl) return
    setTemplateId(id)
    setTopic(tpl.topic)
    setAudience(tpl.audience)
  }

  function generate() {
    setGenerating(true)
    window.setTimeout(() => {
      setGenerating(false)
      toast.success('Document generated', {
        description: `${doc.docType} · ${doc.pages.length} pages, grounded with ${doc.sources.length} sources.`,
      })
    }, 1200)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Document generation"
        description="Draft grounded documents (briefings, memos and summaries) built from the knowledge base with citations."
        mock
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TEMPLATES.map((tpl) => {
                const active = tpl.id === templateId
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => selectTemplate(tpl.id)}
                    className={
                      'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ' +
                      (active
                        ? 'border-teal-600 bg-teal-50/50'
                        : 'border-border hover:border-line-soft hover:bg-muted/40')
                    }
                  >
                    <span
                      className={
                        'flex size-9 shrink-0 items-center justify-center rounded-md ' +
                        (active ? 'bg-teal-600 text-primary-foreground' : 'bg-muted text-ink-600')
                      }
                    >
                      <tpl.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-medium text-ink-700">{tpl.title}</span>
                      <span className="block text-sm text-ink-500">{tpl.desc}</span>
                    </span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional instructions</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
              <Button
                onClick={generate}
                disabled={generating}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover"
              >
                {generating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {generating ? 'Generating…' : 'Generate document'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle>Preview</CardTitle>
              <p className="mt-0.5 truncate text-xs text-ink-500">
                {doc.docType} · {doc.pages.length} pages
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Dialog>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm" className="gap-2" />
                  }
                >
                  <Maximize2 className="size-4" />
                  <span className="hidden sm:inline">Expand</span>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-muted/40">
                  <DialogHeader>
                    <DialogTitle>{doc.title}</DialogTitle>
                  </DialogHeader>
                  <DocumentPaper doc={doc} />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  toast.success('Export started', {
                    description: `${doc.title}: preparing DOCX download.`,
                  })
                }
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[70vh] overflow-y-auto rounded-lg bg-muted/40 p-4">
              {generating && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin text-teal-600" />
                  <p className="text-sm text-ink-600">Drafting from the knowledge base…</p>
                </div>
              )}
              <DocumentPaper doc={doc} />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function DocumentPaper({ doc }: { doc: GeneratedDoc }) {
  const lastIndex = doc.pages.length - 1
  return (
    <div className="flex flex-col items-center gap-5">
      {doc.pages.map((page, index) => (
        <article
          key={index}
          className="flex min-h-[860px] w-full max-w-[640px] flex-col rounded-sm border border-border bg-card px-8 py-7 shadow-md"
        >
          <header className="flex items-center justify-between border-b border-border pb-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
            <span className="text-hdb-red">HCSA · {doc.docType}</span>
            <span>Confidential · Draft</span>
          </header>

          {index === 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-bold leading-tight text-ink-700">
                {doc.title}
              </h3>
              <p className="mt-1 text-xs text-ink-500">
                Prepared for {doc.preparedFor} · {doc.date}
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {page.blocks.map((block, blockIndex) => (
              <Block key={blockIndex} block={block} />
            ))}
          </div>

          {index === lastIndex && doc.sources.length > 0 && (
            <footer className="mt-5 border-t border-border pt-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-ink-600">
                <Quote className="size-3.5" /> Sources
              </p>
              <ol className="mt-1.5 space-y-1 text-[11px] text-ink-500">
                {doc.sources.map((source) => (
                  <li key={source.n}>
                    {source.n} · {source.ref}
                  </li>
                ))}
              </ol>
            </footer>
          )}

          <div className="mt-auto flex justify-end pt-4 text-[10px] text-ink-500">
            {index + 1} / {doc.pages.length}
          </div>
        </article>
      ))}
    </div>
  )
}

function Block({ block }: { block: DocBlock }) {
  if (block.type === 'heading') {
    return <h4 className="text-sm font-bold text-ink-700">{block.text}</h4>
  }
  if (block.type === 'subheading') {
    return (
      <p className="text-xs font-bold uppercase tracking-wide text-ink-600">
        {block.text}
      </p>
    )
  }
  if (block.type === 'para') {
    return (
      <p className="text-[13px] leading-6 text-ink">
        {block.spans.map((span, index) => (
          <Span key={index} span={span} />
        ))}
      </p>
    )
  }
  if (block.type === 'list') {
    return (
      <ul className="list-disc space-y-1 pl-5 text-[13px] leading-6 text-ink">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }
  if (block.type === 'table') {
    return (
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-border">
            {block.columns.map((column) => (
              <th key={column} className="py-1.5 text-left font-bold text-ink-600">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-1.5 pr-3 text-ink-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
  // callout
  return (
    <p className="rounded-md border-l-2 border-warning-accent bg-muted px-3 py-2 text-[12px] leading-5 text-foreground">
      {block.text}
    </p>
  )
}

function Span({ span }: { span: DocSpan }) {
  if (typeof span === 'string') return <>{span}</>
  return (
    <span className="ml-0.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded bg-teal-50 px-1 align-super text-[10px] font-bold leading-none text-teal-800">
      {span.cite}
    </span>
  )
}
