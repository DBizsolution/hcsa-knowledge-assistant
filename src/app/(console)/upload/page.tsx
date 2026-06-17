import type { Metadata } from 'next'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  FileBarChart,
  Mail,
  Scale,
} from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { DocumentPreview } from '@/components/shell/document-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'File upload' }

const RECENT = [
  { name: 'SOP-UD-002 — Site Safety.pdf', size: '1.2 MB', type: 'SOP', icon: FileText, state: 'done', progress: 100 },
  { name: 'Email 60 — Drainage variation.pdf', size: '180 KB', type: 'Email', icon: Mail, state: 'processing', progress: 64 },
  { name: 'POL-UD-002 — Eco Rebate.pdf', size: '640 KB', type: 'Policy', icon: Scale, state: 'done', progress: 100 },
  { name: 'HDB FS-23.pdf', size: '4.8 MB', type: 'Report', icon: FileBarChart, state: 'done', progress: 100 },
]

const STEPS = ['Upload', 'Extract text', 'Chunk', 'Embed', 'Index']

export default function UploadPage() {
  return (
    <PageContainer>
      <PageHeader
        title="File upload"
        description="Add new documents to the knowledge base. Files are parsed, chunked, embedded and indexed automatically."
        mock
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line-soft bg-muted/40 px-6 py-14 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <UploadCloud className="size-7" />
                </span>
                <p className="mt-4 text-lg font-bold text-ink-700">
                  Drag &amp; drop files here
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  PDF, DOCX, TXT, XLSX · up to 50 MB per file
                </p>
                <Button className="mt-5 gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover">
                  <UploadCloud className="size-4" />
                  Browse files
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent uploads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RECENT.map((file) => (
                <DocumentPreview
                  key={file.name}
                  doc={{
                    title: file.name,
                    type: file.type.toLowerCase(),
                    meta: [
                      { label: 'Type', value: file.type },
                      { label: 'Size', value: file.size },
                      {
                        label: 'Status',
                        value: file.state === 'done' ? 'Indexed' : 'Processing',
                      },
                    ],
                  }}
                  trigger={
                    <button
                      type="button"
                      className="-mx-2 flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-muted"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-ink-600">
                        <file.icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-ink-700">
                            {file.name}
                          </span>
                          <span className="shrink-0 text-xs text-ink-500">
                            {file.size}
                          </span>
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <Progress value={file.progress} className="h-1.5" />
                          {file.state === 'done' ? (
                            <CheckCircle2 className="size-4 shrink-0 text-teal-600" />
                          ) : (
                            <Loader2 className="size-4 shrink-0 animate-spin text-link-blue" />
                          )}
                        </span>
                      </span>
                    </button>
                  }
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingestion pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                    {index + 1}
                  </span>
                  <span className="text-base text-ink-700">{step}</span>
                  {index < 3 && (
                    <Badge variant="secondary" className="ml-auto bg-muted text-xs text-ink-600">
                      auto
                    </Badge>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-lg bg-muted/60 p-3 text-sm text-ink-600">
              Embeddings use <span className="font-medium">text-embedding-3-small</span> and are written to Supabase pgvector.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
