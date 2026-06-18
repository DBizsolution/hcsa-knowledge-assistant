import type { Metadata } from 'next'
import { Database, FileStack, Layers, RefreshCw, Plus, Eye } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
import { TypeBadge } from '@/components/shell/type-badge'
import { DocumentPreview } from '@/components/shell/document-preview'
import { DonutChart } from '@/components/charts/mini-charts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DOCUMENTS, KB_STATS, SOURCE_BREAKDOWN } from '@/data/mock'

export const metadata: Metadata = { title: 'Knowledge base' }

const STATUS_BADGE: Record<string, string> = {
  indexed: 'bg-teal-50 text-teal-800',
  processing: 'bg-[color-mix(in_oklch,var(--link-blue),white_85%)] text-link-blue',
  failed: 'bg-[color-mix(in_oklch,var(--hdb-red),white_88%)] text-hdb-red',
}

export default function KnowledgeBasePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Knowledge base"
        description="Manage the indexed sources, chunks and embeddings that ground every answer."
        mock
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="size-4" />
              Re-sync
            </Button>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover">
              <Plus className="size-4" />
              Add source
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents" value={String(KB_STATS.documents)} icon={FileStack} hint="across 4 collections" />
        <StatCard label="Chunks" value={KB_STATS.chunks.toLocaleString()} icon={Layers} hint="paragraph-aware" />
        <StatCard label="Embeddings" value={KB_STATS.embeddings.toLocaleString()} icon={Database} hint={KB_STATS.embeddingModel} />
        <StatCard label="Vector store" value="Healthy" icon={Database} hint={KB_STATS.vectorStore} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Chunks by source type</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart segments={SOURCE_BREAKDOWN} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Indexed documents</CardTitle>
            <Badge variant="secondary" className="bg-muted text-ink-600">
              Last sync {KB_STATS.lastSync}
            </Badge>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Chunks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-0">
                    <span className="sr-only">Preview</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DOCUMENTS.map((doc) => (
                  <TableRow key={doc.title}>
                    <TableCell className="max-w-[260px]">
                      <span className="block truncate font-medium text-ink-700">
                        {doc.title}
                      </span>
                      <span className="text-xs text-ink-500">{doc.collection}</span>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={doc.type} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {doc.chunks}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={STATUS_BADGE[doc.status]}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-ink-500">{doc.updated}</TableCell>
                    <TableCell className="text-right">
                      <DocumentPreview
                        doc={{
                          title: doc.title,
                          type: doc.type,
                          subtitle: doc.collection,
                          meta: [
                            { label: 'Pages', value: String(doc.pages) },
                            { label: 'Chunks', value: String(doc.chunks) },
                            { label: 'Status', value: doc.status },
                            { label: 'Updated', value: doc.updated },
                          ],
                        }}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Preview ${doc.title}`}
                          >
                            <Eye className="size-4" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
