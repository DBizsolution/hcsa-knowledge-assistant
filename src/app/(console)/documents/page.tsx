import type { Metadata } from 'next'
import { FileText, FileCheck2, Presentation, Sparkles, Download, Quote } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = { title: 'Document generation' }

const TEMPLATES = [
  { icon: FileText, title: 'Briefing note', desc: 'Concise summary of a topic across sources', active: true },
  { icon: FileCheck2, title: 'Compliance memo', desc: 'Obligations and requirements from policies & SOPs' },
  { icon: Presentation, title: 'Executive summary', desc: 'Leadership-ready overview with key figures' },
]

export default function DocumentGenerationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Document generation"
        description="Draft grounded documents — briefings, memos and summaries — built from the knowledge base with citations."
        mock
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.title}
                  type="button"
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    tpl.active
                      ? 'border-teal-600 bg-teal-50/50'
                      : 'border-border hover:border-line-soft hover:bg-muted/40'
                  }`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-ink-600">
                    <tpl.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-ink-700">{tpl.title}</span>
                    <span className="block text-sm text-ink-500">{tpl.desc}</span>
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" defaultValue="Eco rebate eligibility for contractors" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Input id="audience" defaultValue="Development Projects officers" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional instructions</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  defaultValue="Keep under one page. Emphasise the documentation contractors must submit."
                />
              </div>
              <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover">
                <Sparkles className="size-4" />
                Generate document
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Preview</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <article className="space-y-4 rounded-lg border border-border bg-card p-6">
              <header className="border-b border-border pb-4">
                <p className="text-xs font-bold uppercase tracking-wide text-hdb-red">
                  HCSA · Briefing note
                </p>
                <h3 className="mt-1 text-xl font-bold text-ink-700">
                  Eco Rebate Eligibility for Contractors
                </h3>
                <p className="mt-1 text-sm text-ink-500">
                  Prepared for Development Projects · 17 June 2026
                </p>
              </header>
              <div className="space-y-3 text-base leading-7 text-ink">
                <p>
                  Contractors qualify for the eco rebate when they satisfy the
                  three conditions set out in the Eco Rebate Policy: adoption of
                  approved sustainable materials, achievement of the stipulated
                  energy-efficiency rating, and timely submission of the
                  sustainability compliance report <CitationChip n={1} />.
                </p>
                <p>
                  The rebate is calculated as a percentage of qualifying project
                  expenditure and is disbursed after the final site inspection is
                  passed <CitationChip n={2} />. Contractors with outstanding
                  compliance breaches are ineligible until the breach is closed{' '}
                  <CitationChip n={1} />.
                </p>
                <h4 className="pt-2 text-base font-bold text-ink-700">
                  Required documentation
                </h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Approved materials declaration</li>
                  <li>Energy-efficiency certification</li>
                  <li>Signed sustainability compliance report <CitationChip n={3} /></li>
                </ul>
              </div>
              <footer className="border-t border-border pt-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink-600">
                  <Quote className="size-4" /> Sources
                </p>
                <ol className="mt-2 space-y-1 text-sm text-ink-500">
                  <li>1 · POL-UD-002 — Eco Rebate Policy, §3.1</li>
                  <li>2 · POL-UD-002 — Eco Rebate Policy, §4.2</li>
                  <li>3 · SOP-CO-003 — Commercial Fit-out Approvals, §2.4</li>
                </ol>
              </footer>
            </article>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function CitationChip({ n }: { n: number }) {
  return (
    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded bg-teal-50 px-1 align-super text-xs font-bold leading-none text-teal-800">
      {n}
    </span>
  )
}
