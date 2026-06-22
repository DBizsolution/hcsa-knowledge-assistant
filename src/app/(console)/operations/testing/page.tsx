'use client'

import { useMemo, useState } from 'react'
import {
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FlaskConical,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EVAL_ROWS, METRICS, type EvalStatus } from '@/data/mock'

const pct = (v: number) => `${Math.round(v * 100)}%`

const passCount = EVAL_ROWS.filter((r) => r.status === 'pass').length
const partialCount = EVAL_ROWS.filter((r) => r.status === 'partial').length
const failCount = EVAL_ROWS.filter((r) => r.status === 'fail').length

const STATUS_META = {
  pass: { label: 'Pass', icon: CheckCircle2, className: 'bg-[color-mix(in_oklch,var(--success),var(--background)_88%)] text-success' },
  partial: { label: 'Partial', icon: AlertTriangle, className: 'bg-warning text-warning-foreground' },
  fail: { label: 'Fail', icon: XCircle, className: 'bg-[color-mix(in_oklch,var(--destructive),var(--background)_88%)] text-destructive' },
} as const

export default function EvaluationPage() {
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState('17 Jun 2026')
  const [statusFilter, setStatusFilter] = useState<EvalStatus | null>(null)
  const [query, setQuery] = useState('')

  const runSuite = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setLastRun('just now')
      toast.success('Test suite complete', { description: '12 queries evaluated' })
    }, 1500)
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return EVAL_ROWS.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false
      if (!term) return true
      return `${row.query} ${row.category}`.toLowerCase().includes(term)
    })
  }, [statusFilter, query])

  return (
    <>
      <PageHeader
        title="Automated query testing"
        description="Run the benchmark query set and evaluate responses against expected answers using the Annex A metrics."
        mock
        actions={
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover"
            disabled={running}
            onClick={runSuite}
          >
            {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {running ? 'Running…' : 'Run test suite'}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Accuracy" value={pct(METRICS.accuracy)} icon={FlaskConical} hint={`${EVAL_ROWS.length} queries`} />
        <StatCard label="Passed" value={String(passCount)} hint="factually correct" trend={{ direction: 'up', value: '+3', good: true }} />
        <StatCard label="Partial" value={String(partialCount)} hint="needs review" />
        <StatCard label="Failed" value={String(failCount)} hint="follow-up required" trend={{ direction: 'down', value: '-1', good: true }} />
      </div>

      <Card className="mt-6 gap-3">
        <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Latest run · {lastRun}</CardTitle>
          <div className="flex gap-2">
            {(['pass', 'partial', 'fail'] as const).map((status) => {
              const meta = STATUS_META[status]
              const active = statusFilter === status
              return (
                <Badge
                  key={status}
                  variant="secondary"
                  className={`cursor-pointer transition-shadow ${meta.className} ${active ? 'ring-2 ring-ink-600 ring-offset-1' : ''}`}
                  onClick={() => setStatusFilter((current) => (current === status ? null : status))}
                >
                  {meta.label}
                </Badge>
              )
            })}
          </div>
        </CardHeader>
        <div className="px-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-500" />
            <Input
              className="pl-8 sm:max-w-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search query or category…"
            />
          </div>
        </div>
        <CardContent className="px-0 [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Complete</TableHead>
                <TableHead className="text-right">Faithful</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-ink-500">
                    No queries match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => {
                  const meta = STATUS_META[row.status]
                  return (
                    <TableRow key={row.query} className="hover:bg-muted">
                      <TableCell className="max-w-[280px]">
                        <span className="block truncate font-medium text-ink-700">
                          {row.query}
                        </span>
                        <span className="text-xs text-ink-500">{row.category}</span>
                      </TableCell>
                      <TableCell className="text-ink-600">{row.source}</TableCell>
                      <TableCell className="text-right tabular-nums">{pct(row.recall)}</TableCell>
                      <TableCell className="text-right tabular-nums">{pct(row.precision)}</TableCell>
                      <TableCell className="text-right tabular-nums">{pct(row.completeness)}</TableCell>
                      <TableCell className="text-right tabular-nums">{pct(row.faithfulness)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`gap-1 ${meta.className}`}>
                          <meta.icon className="size-3.5" />
                          {meta.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
