'use client'

import { useMemo, useState } from 'react'
import { Database, FileStack, Layers, RefreshCw, Plus, Eye, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
import { TypeBadge } from '@/components/shell/type-badge'
import { DocumentPreview } from '@/components/shell/document-preview'
import { DonutChart } from '@/components/charts/mini-charts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DOCUMENTS, KB_STATS, SOURCE_BREAKDOWN, type KbDocument } from '@/data/mock'

const STATUS_BADGE: Record<string, string> = {
  indexed: 'bg-[color-mix(in_oklch,var(--success),var(--background)_88%)] text-success',
  processing: 'bg-[color-mix(in_oklch,var(--info),var(--background)_88%)] text-info',
  failed: 'bg-[color-mix(in_oklch,var(--destructive),var(--background)_88%)] text-destructive',
}

const TYPE_OPTIONS: Array<KbDocument['type']> = ['policy', 'sop', 'email', 'report']

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KbDocument[]>(DOCUMENTS)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<KbDocument['type']>('policy')
  const [collection, setCollection] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return documents.filter((doc) => {
      const matchesType = typeFilter === 'all' || doc.type === typeFilter
      const matchesTerm =
        term === '' ||
        doc.title.toLowerCase().includes(term) ||
        doc.collection.toLowerCase().includes(term)
      return matchesType && matchesTerm
    })
  }, [documents, query, typeFilter])

  const resync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      toast.success('Knowledge base re-synced')
    }, 1200)
  }

  const submitSource = () => {
    const trimmedTitle = title.trim()
    if (trimmedTitle === '') {
      toast.error('Add a document title')
      return
    }
    const next: KbDocument = {
      title: trimmedTitle,
      type,
      collection: collection.trim() === '' ? 'Uncategorised' : collection.trim(),
      pages: 0,
      chunks: 0,
      status: 'processing',
      updated: 'just now',
    }
    setDocuments((prev) => [next, ...prev])
    toast.success('Source added', { description: trimmedTitle })
    setTitle('')
    setType('policy')
    setCollection('')
    setAddOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Knowledge base"
        description="Manage the indexed sources, chunks and embeddings that ground every answer."
        mock
        actions={
          <>
            <Button variant="outline" className="gap-2" disabled={syncing} onClick={resync}>
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {syncing ? 'Re-syncing…' : 'Re-sync'}
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger
                render={
                  <Button className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover" />
                }
              >
                <Plus className="size-4" />
                Add source
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add source</DialogTitle>
                  <DialogDescription>
                    Queue a new document for parsing, chunking and embedding.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="source-title">Title</Label>
                    <Input
                      id="source-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="POL-UD-004: Green Roof Policy"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={type}
                      onValueChange={(value) => setType(value as KbDocument['type'])}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="source-collection">Collection</Label>
                    <Input
                      id="source-collection"
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      placeholder="SOPs & Policies"
                    />
                  </div>
                </div>
                <DialogFooter showCloseButton>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-hdb-red-hover"
                    onClick={submitSource}
                  >
                    Add source
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <div className="flex flex-col gap-3 px-6 pb-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-500" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title or collection…"
                  className="pl-8"
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value ?? 'all')}
              >
                <SelectTrigger className="sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-ink-500">
                      No documents match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((doc) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
