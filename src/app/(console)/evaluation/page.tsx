import type { Metadata } from 'next'
import { Play, CheckCircle2, AlertTriangle, XCircle, FlaskConical } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
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
import { EVAL_ROWS, METRICS } from '@/data/mock'

export const metadata: Metadata = { title: 'Query testing' }

const pct = (v: number) => `${Math.round(v * 100)}%`

const passCount = EVAL_ROWS.filter((r) => r.status === 'pass').length
const partialCount = EVAL_ROWS.filter((r) => r.status === 'partial').length
const failCount = EVAL_ROWS.filter((r) => r.status === 'fail').length

const STATUS_META = {
  pass: { label: 'Pass', icon: CheckCircle2, className: 'bg-teal-50 text-teal-800' },
  partial: { label: 'Partial', icon: AlertTriangle, className: 'bg-[color-mix(in_oklch,var(--link-blue),white_85%)] text-link-blue' },
  fail: { label: 'Fail', icon: XCircle, className: 'bg-[color-mix(in_oklch,var(--hdb-red),white_88%)] text-hdb-red' },
} as const

export default function EvaluationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Automated query testing"
        description="Run the benchmark query set and evaluate responses against expected answers using the Annex A metrics."
        mock
        actions={
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover">
            <Play className="size-4" />
            Run test suite
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
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Latest run · 17 Jun 2026</CardTitle>
          <div className="flex gap-2">
            {(['pass', 'partial', 'fail'] as const).map((status) => {
              const meta = STATUS_META[status]
              return (
                <Badge key={status} variant="secondary" className={meta.className}>
                  {meta.label}
                </Badge>
              )
            })}
          </div>
        </CardHeader>
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
              {EVAL_ROWS.map((row) => {
                const meta = STATUS_META[row.status]
                return (
                  <TableRow key={row.query} className="hover:bg-gray-100">
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
