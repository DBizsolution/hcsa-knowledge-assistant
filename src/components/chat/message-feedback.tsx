'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Flag, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type Vote = 'up' | 'down' | null

const FLAG_REASONS = [
  'Incorrect answer',
  'Missing citation',
  'Irrelevant source',
  'Outdated source',
  'Unsafe / inappropriate',
] as const

type FlagReason = (typeof FLAG_REASONS)[number]

export function MessageFeedback({ answer }: { answer: string }) {
  const [vote, setVote] = useState<Vote>(null)
  const [flagOpen, setFlagOpen] = useState(false)
  const [reason, setReason] = useState<FlagReason | null>(null)
  const [comment, setComment] = useState('')
  const [flagged, setFlagged] = useState(false)

  function castVote(next: Vote) {
    setVote((prev) => {
      const value = prev === next ? null : next
      if (value === 'up') toast.success('Thanks, marked as helpful.')
      if (value === 'down') toast('Thanks, we’ll use this to improve answers.')
      return value
    })
  }

  function submitFlag() {
    if (!reason) return
    setFlagged(true)
    setFlagOpen(false)
    toast.success('Feedback submitted', {
      description: `${reason}: routed to the evaluation backlog.`,
    })
    setComment('')
    setReason(null)
  }

  return (
    <div className="flex items-center gap-1 pt-1">
      <FeedbackButton
        label="Helpful"
        active={vote === 'up'}
        onClick={() => castVote('up')}
      >
        <ThumbsUp className="size-3.5" aria-hidden />
      </FeedbackButton>
      <FeedbackButton
        label="Not helpful"
        active={vote === 'down'}
        onClick={() => castVote('down')}
      >
        <ThumbsDown className="size-3.5" aria-hidden />
      </FeedbackButton>

      <span className="mx-1 h-4 w-px bg-border" aria-hidden />

      {flagged ? (
        <span className="inline-flex items-center gap-1 px-1.5 text-xs font-medium text-teal-700">
          <Check className="size-3.5" aria-hidden />
          Reported
        </span>
      ) : (
        <Popover open={flagOpen} onOpenChange={setFlagOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-500 transition hover:bg-muted hover:text-ink-700"
              />
            }
          >
            <Flag className="size-3.5" aria-hidden />
            Flag
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72">
            <p className="text-sm font-bold text-ink-700">What’s wrong with this answer?</p>
            <div className="mt-2 flex flex-col gap-1">
              {FLAG_REASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className={cn(
                    'rounded-md border px-2.5 py-1.5 text-left text-sm transition',
                    reason === item
                      ? 'border-teal-600 bg-teal-50/60 text-ink-700'
                      : 'border-border text-ink-600 hover:bg-muted',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={2}
              placeholder="Add a comment (optional)"
              className="mt-2 text-sm"
            />
            <Button
              type="button"
              size="sm"
              className="mt-2 w-full"
              disabled={!reason}
              onClick={submitFlag}
            >
              Submit feedback
            </Button>
          </PopoverContent>
        </Popover>
      )}

      <FeedbackButton
        label="Copy answer"
        onClick={() => {
          navigator.clipboard?.writeText(answer)
          toast.success('Answer copied to clipboard.')
        }}
      >
        <Copy className="size-3.5" aria-hidden />
      </FeedbackButton>
    </div>
  )
}

function FeedbackButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md text-ink-500 transition hover:bg-muted hover:text-ink-700',
        active && 'bg-teal-50 text-teal-700 hover:bg-teal-50',
      )}
    >
      {children}
    </button>
  )
}
