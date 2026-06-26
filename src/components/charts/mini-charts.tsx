'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

/** Vertical bar chart. */
export function BarChart({
  data,
  height = 180,
  className,
  format = (v) => String(v),
}: {
  data: { label: string; value: number }[]
  height?: number
  className?: string
  format?: (value: number) => string
}) {
  const config = {
    value: { label: 'Value', color: 'var(--chart-2)' },
  } satisfies ChartConfig

  return (
    <ChartContainer
      config={config}
      style={{ height }}
      className={cn('aspect-auto w-full', className)}
    >
      <RBarChart
        accessibilityLayer
        data={data}
        margin={{ top: 12, right: 8, left: 8, bottom: 0 }}
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
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value) => format(Number(value))}
            />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={[6, 6, 0, 0]}
          maxBarSize={64}
        />
      </RBarChart>
    </ChartContainer>
  )
}

/** Horizontal labelled progress bars (e.g. accuracy by category). */
export function BarList({
  data,
  className,
}: {
  data: { label: string; value: number }[]
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {data.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-600">{d.label}</span>
            <span className="font-bold tabular-nums text-ink-700">
              {Math.round(d.value * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-2"
              style={{ width: `${d.value * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Area sparkline from a series of numbers. */
export function Sparkline({
  values,
  height = 64,
  className,
}: {
  values: number[]
  height?: number
  className?: string
}) {
  const gradientId = useId()
  const data = values.map((value, index) => ({ index, value }))
  const config = {
    value: { label: 'Value', color: 'var(--chart-2)' },
  } satisfies ChartConfig

  return (
    <ChartContainer
      config={config}
      style={{ height }}
      className={cn('aspect-auto w-full', className)}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-value)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="var(--color-value)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

/** Stacked donut chart with legend. */
export function DonutChart({
  segments,
  size = 168,
  className,
  centerLabel = 'chunks',
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
  className?: string
  centerLabel?: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const data = segments.map((s) => ({
    name: s.label,
    value: s.value,
    fill: s.color,
  }))
  const config: ChartConfig = Object.fromEntries(
    segments.map((s) => [s.label, { label: s.label, color: s.color }]),
  )

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <ChartContainer
        config={config}
        style={{ width: size, height: size }}
        className="aspect-square shrink-0"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={size * 0.3}
            outerRadius={size * 0.46}
            paddingAngle={2}
            strokeWidth={2}
            stroke="var(--background)"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox)) return null
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 4}
                      className="fill-ink-700 text-2xl font-bold"
                    >
                      {total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 16}
                      className="fill-ink-500 text-xs"
                    >
                      {centerLabel}
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-ink-600">{s.label}</span>
            <span className="font-bold tabular-nums text-ink-700">
              {s.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Single circular percentage gauge. */
export function MetricRing({
  value,
  label,
  size = 132,
}: {
  value: number
  label: string
  size?: number
}) {
  const pct = Math.round(value * 100)
  const data = [{ name: label, value: pct }]
  const config = {
    value: { label, color: 'var(--chart-2)' },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col items-center gap-2">
      <ChartContainer
        config={config}
        style={{ width: size, height: size }}
        className="aspect-square"
      >
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={90 - 360}
          innerRadius="68%"
          outerRadius="100%"
          barSize={9}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            angleAxisId={0}
            cornerRadius={6}
            fill="var(--color-value)"
            background={{ fill: 'var(--muted)' }}
            isAnimationActive={false}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-700 text-2xl font-bold"
          >
            {pct}%
          </text>
        </RadialBarChart>
      </ChartContainer>
      <span className="text-sm font-medium text-ink-600">{label}</span>
    </div>
  )
}
