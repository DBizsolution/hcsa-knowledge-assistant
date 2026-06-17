import type { Metadata } from 'next'
import { Activity, Gauge, MessageSquare, Timer } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Accuracy" value={`${Math.round(METRICS.accuracy * 100)}%`} icon={Gauge} trend={{ direction: 'up', value: '+4%', good: true }} hint="vs last week" />
        <StatCard label="Faithfulness" value={`${Math.round(METRICS.faithfulness * 100)}%`} icon={Activity} trend={{ direction: 'up', value: '+1%', good: true }} hint="grounded claims" />
        <StatCard label="Avg latency" value={`${(METRICS.avgLatencyMs / 1000).toFixed(1)}s`} icon={Timer} trend={{ direction: 'down', value: '-0.3s', good: true }} hint="end-to-end" />
        <StatCard label="Queries / week" value="1,003" icon={MessageSquare} trend={{ direction: 'up', value: '+12%', good: true }} hint="across 39 users" />
      </div>

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
