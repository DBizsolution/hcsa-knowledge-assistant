import { cn } from '@/lib/utils'

/** Vertical bar chart. */
export function BarChart({
  data,
  height = 160,
  className,
  format = (v) => String(v),
}: {
  data: { label: string; value: number }[]
  height?: number
  className?: string
  format?: (value: number) => string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className={cn('flex items-end gap-3', className)} style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-chart-2 transition-all"
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
              title={format(d.value)}
            />
          </div>
          <span className="text-xs text-ink-500">{d.label}</span>
        </div>
      ))}
    </div>
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
            <span className="font-bold text-ink-700">
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
  height = 56,
  className,
}: {
  values: number[]
  height?: number
  className?: string
}) {
  const width = 240
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)
  const points = values.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * (height - 8) - 4
    return [x, y] as const
  })
  const line = points.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `0,${height} ${line} ${width},${height}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full', className)}
      preserveAspectRatio="none"
      role="img"
      aria-label="Trend sparkline"
    >
      <polygon points={area} fill="var(--chart-2)" opacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--chart-2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Stacked donut chart with legend. */
export function DonutChart({
  segments,
  size = 168,
  className,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
  className?: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = 60
  const circumference = 2 * Math.PI * radius

  const dashes = segments.map((s) => (s.value / total) * circumference)
  const arcs = segments.map((s, i) => ({
    ...s,
    dash: dashes[i],
    offset: dashes.slice(0, i).reduce((sum, d) => sum + d, 0),
  }))

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <svg
        viewBox="0 0 160 160"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Distribution donut chart"
      >
        <g transform="rotate(-90 80 80)">
          {arcs.map((s) => (
            <circle
              key={s.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </g>
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-ink-700 text-2xl font-bold"
        >
          {total}
        </text>
        <text
          x="80"
          y="96"
          textAnchor="middle"
          className="fill-ink-500 text-xs"
        >
          chunks
        </text>
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-ink-600">{s.label}</span>
            <span className="font-bold text-ink-700">{s.value}</span>
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
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dash = value * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 128 128"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${label}: ${Math.round(value * 100)} percent`}
      >
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--muted)" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 64 64)"
        />
        <text
          x="64"
          y="70"
          textAnchor="middle"
          className="fill-ink-700 text-2xl font-bold"
        >
          {Math.round(value * 100)}%
        </text>
      </svg>
      <span className="text-sm font-medium text-ink-600">{label}</span>
    </div>
  )
}
