'use client'

import { useMemo, useState } from 'react'
import { Coins, Cpu, Download, Receipt, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
import { BarChart } from '@/components/charts/mini-charts'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CONSUMPTION,
  CONSUMPTION_BY_MODEL,
  CONSUMPTION_TREND,
} from '@/data/mock'

type PeriodKey = 'this' | 'last' | 'last3'

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'this', label: 'This month' },
  { key: 'last', label: 'Last month' },
  { key: 'last3', label: 'Last 3 months' },
]

const millions = (n: number) => `${(n / 1_000_000).toFixed(1)}M`

const PERIOD_DATA: Record<
  PeriodKey,
  {
    tokens: number
    tokensPrev: number
    requests: number
    estimatedCost: number
    budget: number
    avgTokensPerQuery: string
    growthGood: boolean
    budgetResets: string
    trend: { label: string; value: number }[]
    byModel: { model: string; tokens: number; cost: number }[]
  }
> = {
  this: {
    tokens: CONSUMPTION.tokensThisMonth,
    tokensPrev: CONSUMPTION.tokensLastMonth,
    requests: CONSUMPTION.requests,
    estimatedCost: CONSUMPTION.estimatedCost,
    budget: CONSUMPTION.budget,
    avgTokensPerQuery: '656',
    growthGood: false,
    budgetResets: 'resets 1 Jul 2026',
    trend: CONSUMPTION_TREND,
    byModel: CONSUMPTION_BY_MODEL,
  },
  last: {
    tokens: 6_910_000,
    tokensPrev: 6_240_000,
    requests: 10_420,
    estimatedCost: 176.3,
    budget: 500,
    avgTokensPerQuery: '631',
    growthGood: false,
    budgetResets: 'closed 1 Jun 2026',
    trend: [
      { label: 'W1', value: 1.4 },
      { label: 'W2', value: 1.7 },
      { label: 'W3', value: 1.8 },
      { label: 'W4', value: 2.0 },
    ],
    byModel: [
      { model: 'gpt-4o (generation)', tokens: 5_020_000, cost: 138.1 },
      { model: 'text-embedding-3-small', tokens: 1_890_000, cost: 38.2 },
    ],
  },
  last3: {
    tokens: 21_180_000,
    tokensPrev: 17_440_000,
    requests: 34_960,
    estimatedCost: 567.4,
    budget: 1500,
    avgTokensPerQuery: '642',
    growthGood: false,
    budgetResets: 'rolling 90 days',
    trend: [
      { label: 'Apr', value: 6.2 },
      { label: 'May', value: 6.6 },
      { label: 'Jun', value: 8.4 },
    ],
    byModel: [
      { model: 'gpt-4o (generation)', tokens: 15_360_000, cost: 444.9 },
      { model: 'text-embedding-3-small', tokens: 5_820_000, cost: 122.5 },
    ],
  },
}

export default function ConsumptionPage() {
  const [period, setPeriod] = useState<PeriodKey>('this')
  const data = useMemo(() => PERIOD_DATA[period], [period])

  const budgetUsed = Math.round((data.estimatedCost / data.budget) * 100)
  const growth = Math.round(
    ((data.tokens - data.tokensPrev) / data.tokensPrev) * 100,
  )
  const totalCost = data.byModel.reduce((sum, row) => sum + row.cost, 0)

  return (
    <>
      <PageHeader
        title="System consumption"
        description="Token, request and cost consumption across the assistant and embedding models."
        mock
        actions={
          <>
            <Tabs
              value={period}
              onValueChange={(value) => setPeriod(value as PeriodKey)}
            >
              <TabsList>
                {PERIODS.map((p) => (
                  <TabsTrigger key={p.key} value={p.key}>
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              onClick={() => toast('Export started · preparing CSV')}
            >
              <Download aria-hidden />
              Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tokens" value={millions(data.tokens)} icon={Coins} trend={{ direction: 'up', value: `+${growth}%`, good: data.growthGood }} hint="vs prior period" />
        <StatCard label="Requests" value={data.requests.toLocaleString()} icon={Receipt} hint="chat + embeddings" />
        <StatCard label="Estimated cost" value={`$${data.estimatedCost.toFixed(2)}`} icon={Wallet} hint="period to date" />
        <StatCard label="Avg tokens / query" value={data.avgTokensPerQuery} icon={Cpu} hint="incl. retrieval" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Token usage by week</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={data.trend}
              format={(v) => `${v}M tokens`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-ink-700">
              ${data.estimatedCost.toFixed(0)}
              <span className="ml-1 text-sm font-normal text-ink-500">
                / ${data.budget}
              </span>
            </p>
            <Progress value={budgetUsed} />
            <p className="text-sm text-ink-500">
              {budgetUsed}% of budget used · {data.budgetResets}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Consumption by model</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byModel.map((row) => {
                const share = Math.round((row.cost / totalCost) * 100)
                return (
                  <TableRow key={row.model}>
                    <TableCell className="font-medium text-ink-700">
                      {row.model}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.tokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${row.cost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {share}%
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
