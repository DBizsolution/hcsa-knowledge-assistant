'use client'

import { useState } from 'react'
import { Search, BarChart3, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StructuredResultView } from '@/components/chat/structured-result'
import {
  STRUCTURED_RESULTS,
  matchStructuredData,
  type StructuredResult,
} from '@/lib/rag/structured-data'

export default function AnalyticsPage() {
  const [selected, setSelected] = useState<StructuredResult>(STRUCTURED_RESULTS[0])
  const [query, setQuery] = useState('')

  function run(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const match = matchStructuredData(trimmed)
    if (match) {
      setSelected(match)
      setQuery('')
    } else {
      toast.error('No dataset matches that question', {
        description: 'Try one of the sample questions below.',
      })
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Structured data analytics"
        description="Ask quantitative questions across the relational project datasets (Contractors, Projects, Permits and Inspections) with explainable, exportable results."
        mock
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  run(query)
                }}
                className="space-y-2"
              >
                <label className="text-sm font-bold text-ink-700">
                  Ask a data question
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="e.g. permits expired in 2024"
                      className="pl-8"
                    />
                  </div>
                  <Button type="submit" className="gap-1.5">
                    <Sparkles className="size-4" />
                    Run
                  </Button>
                </div>
              </form>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Sample questions
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {STRUCTURED_RESULTS.map((result) => (
                    <button
                      key={result.key}
                      type="button"
                      onClick={() => setSelected(result)}
                      className={
                        'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition ' +
                        (selected.key === result.key
                          ? 'border-primary bg-[color-mix(in_oklch,var(--primary),var(--background)_92%)] text-ink-700'
                          : 'border-border text-ink-600 hover:border-line-soft hover:bg-muted/50')
                      }
                    >
                      <BarChart3
                        className={
                          'size-4 shrink-0 ' +
                          (selected.key === result.key
                            ? 'text-primary'
                            : 'text-ink-500')
                        }
                        aria-hidden
                      />
                      <span className="flex-1">{result.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <StructuredResultView
              key={selected.key}
              data={selected}
              onFollowUp={(prompt) => run(prompt)}
              bare
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
