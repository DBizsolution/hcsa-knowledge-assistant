import type { Metadata } from 'next'
import type { LucideIcon } from 'lucide-react'
import { Activity, MessageSquare, Timer, TrendingUp } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
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

export const metadata: Metadata = { title: 'Performance' }

const RINGS = [
  { label: 'Recall', value: METRICS.recall },
  { label: 'Precision', value: METRICS.precision },
  { label: 'Completeness', value: METRICS.completeness },
  { label: 'Faithfulness', value: METRICS.faithfulness },
]

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="System performance"
        description="Retrieval quality and response performance across the Annex A metrics."
        mock
      />

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="lg:max-w-md">
            <p className="text-sm font-medium text-ink-600">Retrieval accuracy</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-6xl font-bold leading-none tracking-tight text-ink-700">
                {Math.round(METRICS.accuracy * 100)}%
              </span>
              <span className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-teal-600">
                <TrendingUp className="size-4" />
                +4% vs last week
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Share of evaluation queries answered correctly and grounded in the
              right HCSA source, across the Annex A test set.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 border-t border-border pt-6 sm:grid-cols-3 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <HeroStat icon={Activity} label="Faithfulness" value={`${Math.round(METRICS.faithfulness * 100)}%`} hint="grounded claims" />
            <HeroStat icon={Timer} label="Avg latency" value={`${(METRICS.avgLatencyMs / 1000).toFixed(1)}s`} hint="end-to-end" />
            <HeroStat icon={MessageSquare} label="Queries / week" value="1,003" hint="39 users" />
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
              {RINGS.map((ring) => (
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
            <BarList data={CATEGORY_ACCURACY} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Queries per day</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={QUERY_TREND} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latency trend</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-3xl font-bold text-ink-700">
              {(METRICS.avgLatencyMs / 1000).toFixed(1)}s
              <span className="ml-2 text-sm font-normal text-ink-500">
                avg · {(METRICS.p95LatencyMs / 1000).toFixed(1)}s p95
              </span>
            </p>
            <Sparkline values={LATENCY_TREND} height={64} />
            <p className="text-sm text-ink-500">Last 12 hours</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
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
