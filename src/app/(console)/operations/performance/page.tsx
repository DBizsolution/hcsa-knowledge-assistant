'use client'

import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Activity, MessageSquare, RefreshCw, Timer, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shell/page'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  BarList,
  MetricRing,
  Sparkline,
} from '@/components/charts/mini-charts'
import {
  CATEGORY_ACCURACY,
  LATENCY_TREND,
  METRICS,
  QUERY_TREND,
} from '@/data/mock'

type RangeKey = '24h' | '7d' | '30d'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
]

const RANGE_DATA: Record<
  RangeKey,
  {
    accuracy: number
    accuracyDelta: string
    faithfulness: number
    avgLatencyMs: number
    p95LatencyMs: number
    queriesLabel: string
    queriesValue: string
    queriesHint: string
    queryTrend: { label: string; value: number }[]
    queryTrendTitle: string
    latencyTrend: number[]
    latencyCaption: string
    categoryAccuracy: { label: string; value: number }[]
    rings: { label: string; value: number }[]
  }
> = {
  '24h': {
    accuracy: 0.92,
    accuracyDelta: '+2% vs yesterday',
    faithfulness: 0.97,
    avgLatencyMs: 1980,
    p95LatencyMs: 4120,
    queriesLabel: 'Queries / 24h',
    queriesValue: '168',
    queriesHint: '21 users',
    queryTrend: [
      { label: '00', value: 6 },
      { label: '04', value: 3 },
      { label: '08', value: 22 },
      { label: '12', value: 41 },
      { label: '16', value: 38 },
      { label: '20', value: 18 },
    ],
    queryTrendTitle: 'Queries per hour',
    latencyTrend: [2.0, 1.8, 2.1, 1.9, 2.2, 1.7, 2.0, 1.9, 2.3, 2.0, 1.8, 2.0],
    latencyCaption: 'Last 12 hours',
    categoryAccuracy: [
      { label: 'Safety SOP', value: 0.95 },
      { label: 'Policy', value: 0.91 },
      { label: 'Financial', value: 0.85 },
      { label: 'Email', value: 0.9 },
    ],
    rings: [
      { label: 'Recall', value: 0.88 },
      { label: 'Precision', value: 0.84 },
      { label: 'Completeness', value: 0.86 },
      { label: 'Faithfulness', value: 0.97 },
    ],
  },
  '7d': {
    accuracy: METRICS.accuracy,
    accuracyDelta: '+4% vs last week',
    faithfulness: METRICS.faithfulness,
    avgLatencyMs: METRICS.avgLatencyMs,
    p95LatencyMs: METRICS.p95LatencyMs,
    queriesLabel: 'Queries / week',
    queriesValue: '1,003',
    queriesHint: '39 users',
    queryTrend: QUERY_TREND,
    queryTrendTitle: 'Queries per day',
    latencyTrend: LATENCY_TREND,
    latencyCaption: 'Last 7 days',
    categoryAccuracy: CATEGORY_ACCURACY,
    rings: [
      { label: 'Recall', value: METRICS.recall },
      { label: 'Precision', value: METRICS.precision },
      { label: 'Completeness', value: METRICS.completeness },
      { label: 'Faithfulness', value: METRICS.faithfulness },
    ],
  },
  '30d': {
    accuracy: 0.89,
    accuracyDelta: '+6% vs last month',
    faithfulness: 0.95,
    avgLatencyMs: 2260,
    p95LatencyMs: 4610,
    queriesLabel: 'Queries / month',
    queriesValue: '4,128',
    queriesHint: '47 users',
    queryTrend: [
      { label: 'W1', value: 884 },
      { label: 'W2', value: 1012 },
      { label: 'W3', value: 1136 },
      { label: 'W4', value: 1096 },
    ],
    queryTrendTitle: 'Queries per week',
    latencyTrend: [2.2, 2.4, 2.1, 2.5, 2.3, 2.0, 2.4, 2.2, 2.6, 2.3, 2.1, 2.3],
    latencyCaption: 'Last 30 days',
    categoryAccuracy: [
      { label: 'Safety SOP', value: 0.92 },
      { label: 'Policy', value: 0.88 },
      { label: 'Financial', value: 0.81 },
      { label: 'Email', value: 0.86 },
    ],
    rings: [
      { label: 'Recall', value: 0.85 },
      { label: 'Precision', value: 0.8 },
      { label: 'Completeness', value: 0.83 },
      { label: 'Faithfulness', value: 0.95 },
    ],
  },
}

export default function DashboardPage() {
  const [range, setRange] = useState<RangeKey>('7d')
  const data = useMemo(() => RANGE_DATA[range], [range])

  return (
    <>
      <PageHeader
        title="System performance"
        description="Retrieval quality and response performance across the Annex A metrics."
        mock
        actions={
          <>
            <Tabs
              value={range}
              onValueChange={(value) => setRange(value as RangeKey)}
            >
              <TabsList>
                {RANGES.map((r) => (
                  <TabsTrigger key={r.key} value={r.key}>
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              onClick={() => toast('Metrics refreshed')}
            >
              <RefreshCw aria-hidden />
              Refresh
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="lg:max-w-md">
            <p className="text-sm font-medium text-ink-600">Retrieval accuracy</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-6xl font-bold leading-none tracking-tight text-ink-700">
                {Math.round(data.accuracy * 100)}%
              </span>
              <span className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-teal-600">
                <TrendingUp className="size-4" />
                {data.accuracyDelta}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Share of evaluation queries answered correctly and grounded in the
              right HCSA source, across the Annex A test set.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:shrink-0 lg:pl-6">
            <HeroStat icon={Activity} label="Faithfulness" value={`${Math.round(data.faithfulness * 100)}%`} hint="grounded claims" />
            <HeroStat icon={Timer} label="Avg latency" value={`${(data.avgLatencyMs / 1000).toFixed(1)}s`} hint="end-to-end" />
            <HeroStat icon={MessageSquare} label={data.queriesLabel} value={data.queriesValue} hint={data.queriesHint} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Retrieval quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {data.rings.map((ring) => (
                <MetricRing key={ring.label} label={ring.label} value={ring.value} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy by category</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={data.categoryAccuracy} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{data.queryTrendTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data.queryTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latency trend</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-3xl font-bold text-ink-700">
              {(data.avgLatencyMs / 1000).toFixed(1)}s
              <span className="ml-2 text-sm font-normal text-ink-500">
                avg · {(data.p95LatencyMs / 1000).toFixed(1)}s p95
              </span>
            </p>
            <Sparkline values={data.latencyTrend} height={64} />
            <p className="text-sm text-ink-500">{data.latencyCaption}</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function HeroStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-ink-500" aria-hidden />
        <span className="text-sm font-medium text-ink-600">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-ink-700">{value}</p>
      <p className="text-xs text-ink-500">{hint}</p>
    </div>
  )
}
