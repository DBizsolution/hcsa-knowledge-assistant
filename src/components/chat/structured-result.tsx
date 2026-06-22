'use client'

import { forwardRef, useMemo, useState } from 'react'
import {
  BarChart3,
  Table2,
  Database,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown,
  ChevronsUpDown,
  Download,
  Quote,
  Sigma,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type {
  StructuredResult,
  StructuredMetric,
  TableColumn,
  TableRow,
  ChartBar,
} from '@/lib/rag/structured-data'

const TREND_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
}

function MetricCard({ metric }: { metric: StructuredMetric }) {
  const TrendIcon = metric.trend ? TREND_ICON[metric.trend.direction] : null
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs font-medium text-ink-500">{metric.label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-ink-700">
        {metric.value}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {metric.sub && <span className="text-xs text-ink-500">{metric.sub}</span>}
        {metric.trend && TrendIcon && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              metric.trend.direction === 'up' && 'text-hdb-red',
              metric.trend.direction === 'down' && 'text-teal-700',
              metric.trend.direction === 'flat' && 'text-ink-500',
            )}
          >
            <TrendIcon className="size-3" aria-hidden />
            {metric.trend.label}
          </span>
        )}
      </div>
    </div>
  )
}

function BarChart({ bars, unit }: { bars: ChartBar[]; unit?: string }) {
  const data = bars.map((bar) => ({
    ...bar,
    top: bar.display ?? String(bar.value),
  }))
  const config = {
    value: { label: unit ? unit.replace(/^\w/, (c) => c.toUpperCase()) : 'Value' },
  } satisfies ChartConfig

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <ChartContainer config={config} className="aspect-auto h-44 w-full">
        <RBarChart
          accessibilityLayer
          data={data}
          margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
            content={<ChartTooltipContent hideIndicator />}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {data.map((bar) => (
              <Cell
                key={bar.label}
                fill={bar.emphasis ? 'var(--chart-2)' : 'var(--chart-muted)'}
              />
            ))}
            <LabelList
              dataKey="top"
              position="top"
              className="fill-ink-600 text-xs font-bold tabular-nums"
            />
          </Bar>
        </RBarChart>
      </ChartContainer>
      {unit && (
        <p className="mt-2 text-right text-xs text-ink-500">Figures in {unit}</p>
      )}
    </div>
  )
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

function numericValue(raw: string | number): number {
  if (typeof raw === 'number') return raw
  const cleaned = parseFloat(raw.replace(/[^0-9.-]/g, ''))
  return Number.isNaN(cleaned) ? 0 : cleaned
}

function ResultTable({
  columns,
  rows,
  note,
}: {
  columns: TableColumn[]
  rows: TableRow[]
  note?: string
}) {
  const [sort, setSort] = useState<SortState>(null)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((col) => col.key === sort.key)
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      const cmp = column?.numeric
        ? numericValue(av) - numericValue(bv)
        : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, columns, sort])

  function toggleSort(key: string) {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' },
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-3 py-2 font-bold text-ink-600',
                  column.numeric ? 'text-right' : 'text-left',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className={cn(
                    'inline-flex items-center gap-1 hover:text-ink-700',
                    column.numeric && 'flex-row-reverse',
                  )}
                >
                  {column.label}
                  {sort?.key === column.key ? (
                    <ChevronDown
                      className={cn(
                        'size-3.5 transition-transform',
                        sort.dir === 'asc' && 'rotate-180',
                      )}
                      aria-hidden
                    />
                  ) : (
                    <ChevronsUpDown className="size-3 text-ink-500/50" aria-hidden />
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, index) => (
            <tr
              key={index}
              className="border-b border-border last:border-0 even:bg-muted/20"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-3 py-2 text-ink-600',
                    column.numeric && 'text-right tabular-nums',
                    index === 0 && 'font-medium text-ink-700',
                  )}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {note && (
        <p className="border-t border-border bg-muted/30 px-3 py-1.5 text-xs text-ink-500">
          {note}
        </p>
      )}
    </div>
  )
}

const KIND_META: Record<
  StructuredResult['kind'],
  { label: string; icon: typeof BarChart3 }
> = {
  metric: { label: 'Metric', icon: Sigma },
  table: { label: 'Table', icon: Table2 },
  trend: { label: 'Trend', icon: BarChart3 },
  exception: { label: 'Exception report', icon: Table2 },
}

export const StructuredResultView = forwardRef<
  HTMLDivElement,
  { data: StructuredResult; onFollowUp?: (prompt: string) => void }
>(function StructuredResultView({ data, onFollowUp }, ref) {
  const [explainOpen, setExplainOpen] = useState(false)
  const kind = KIND_META[data.kind]

  return (
    <div ref={ref} className="space-y-4 border-t border-border pt-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <kind.icon className="size-4 text-link-blue" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wider text-link-blue">
            Structured data · {kind.label}
          </span>
        </div>
        <h2 className="mt-1.5 text-lg font-bold leading-tight text-ink-700">
          {data.title}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-ink-600">{data.summary}</p>
      </div>

      {/* Metrics */}
      {data.metrics && data.metrics.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {data.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      )}

      {/* Chart */}
      {data.chart && <BarChart bars={data.chart.bars} unit={data.chart.unit} />}

      {/* Table */}
      {data.table && (
        <ResultTable
          columns={data.table.columns}
          rows={data.table.rows}
          note={data.table.note}
        />
      )}

      {/* Combined response — policy/SOP citations alongside the numbers */}
      {data.citations && data.citations.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Quote className="size-4 text-teal-600" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Related guidance
            </span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {data.citations.map((citation) => (
              <li key={citation.docCode + citation.section} className="text-sm leading-6 text-ink-600">
                <span className="font-medium text-ink-700">{citation.docCode}</span>{' '}
                <span className="text-ink-500">{citation.section}</span>,{' '}
                {citation.quote}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Query explanation + freshness + export */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Collapsible open={explainOpen} onOpenChange={setExplainOpen} className="flex-1">
          <CollapsibleTrigger className="flex items-center gap-2 rounded-md text-sm font-bold text-teal-600 hover:underline">
            <Database className="size-4" aria-hidden />
            How this was calculated
            <ChevronDown
              className={cn('size-4 transition-transform', explainOpen && 'rotate-180')}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 rounded-lg border border-border bg-card p-3 text-sm">
            <p className="text-ink-600">
              <span className="font-bold text-ink-700">Dataset · </span>
              {data.dataset}
            </p>
            <ExplainList label="Filters" items={data.explanation.filters} mono />
            {data.explanation.joins && data.explanation.joins[0] !== '–' && (
              <ExplainList label="Joins" items={data.explanation.joins} mono />
            )}
            {data.explanation.assumptions && (
              <ExplainList label="Assumptions" items={data.explanation.assumptions} />
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs text-ink-500">{data.freshness}</p>
        <button
          type="button"
          onClick={() =>
            toast.success('Export started', {
              description: `${data.title}: preparing CSV download.`,
            })
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-muted disabled:opacity-50"
          disabled={!data.exportable}
        >
          <Download className="size-3.5" aria-hidden />
          Export CSV
        </button>
      </div>

      {/* Follow-ups */}
      {data.followUps.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowRight className="size-4 text-teal-600" aria-hidden />
            <h3 className="text-sm font-bold text-ink-700">You might next ask</h3>
          </div>
          <div className="flex flex-col gap-2">
            {data.followUps.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onFollowUp?.(prompt)}
                disabled={!onFollowUp}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-ink-700 transition hover:border-teal-600 hover:bg-teal-50/50 disabled:cursor-default disabled:hover:border-border disabled:hover:bg-card"
              >
                <span className="flex-1">{prompt}</span>
                <ArrowRight
                  className="size-4 shrink-0 text-ink-500/60 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600"
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
})

function ExplainList({
  label,
  items,
  mono,
}: {
  label: string
  items: string[]
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{label}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              'text-ink-600',
              mono && 'font-mono text-xs leading-5 text-ink-600',
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
