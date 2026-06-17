import type { Metadata } from 'next'
import { Coins, Cpu, Receipt, Wallet } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
import { BarChart } from '@/components/charts/mini-charts'
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
import { CONSUMPTION, CONSUMPTION_BY_MODEL, CONSUMPTION_TREND } from '@/data/mock'

export const metadata: Metadata = { title: 'Consumption' }

const millions = (n: number) => `${(n / 1_000_000).toFixed(1)}M`
const budgetUsed = Math.round((CONSUMPTION.estimatedCost / CONSUMPTION.budget) * 100)
const growth = Math.round(
  ((CONSUMPTION.tokensThisMonth - CONSUMPTION.tokensLastMonth) /
    CONSUMPTION.tokensLastMonth) *
    100,
)

export default function ConsumptionPage() {
  return (
    <PageContainer>
      <PageHeader
        title="System consumption"
        description="Token, request and cost consumption across the assistant and embedding models."
        mock
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tokens this month" value={millions(CONSUMPTION.tokensThisMonth)} icon={Coins} trend={{ direction: 'up', value: `+${growth}%`, good: false }} hint="vs last month" />
        <StatCard label="Requests" value={CONSUMPTION.requests.toLocaleString()} icon={Receipt} hint="chat + embeddings" />
        <StatCard label="Estimated cost" value={`$${CONSUMPTION.estimatedCost.toFixed(2)}`} icon={Wallet} hint="month to date" />
        <StatCard label="Avg tokens / query" value="656" icon={Cpu} hint="incl. retrieval" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Token usage by week</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={CONSUMPTION_TREND}
              format={(v) => `${v}M tokens`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-ink-700">
              ${CONSUMPTION.estimatedCost.toFixed(0)}
              <span className="ml-1 text-sm font-normal text-ink-500">
                / ${CONSUMPTION.budget}
              </span>
            </p>
            <Progress value={budgetUsed} />
            <p className="text-sm text-ink-500">
              {budgetUsed}% of budget used · resets 1 Jul 2026
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
              {CONSUMPTION_BY_MODEL.map((row) => {
                const share = Math.round(
                  (row.cost /
                    CONSUMPTION_BY_MODEL.reduce((s, r) => s + r.cost, 0)) *
                    100,
                )
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
    </PageContainer>
  )
}
