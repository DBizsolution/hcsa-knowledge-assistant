import type { Metadata } from 'next'
import { Save, RotateCcw, Cpu, Sparkles } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { CONFIG_DEFAULTS } from '@/data/mock'

export const metadata: Metadata = { title: 'Configuration' }

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Best quality · default', active: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', desc: 'Faster · lower cost' },
]

const GUARDRAILS = [
  { title: 'Knowledge-base only', desc: 'Refuse to answer from outside the indexed sources.', on: true },
  { title: 'Require citations', desc: 'Every factual claim must reference a source.', on: true },
  { title: 'PII redaction', desc: 'Mask personal data in retrieved passages.', on: true },
  { title: 'Profanity filter', desc: 'Block unsafe or abusive content.', on: false },
]

export default function ConfigurationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Chatbot configuration"
        description="Tune the model, retrieval and guardrails that govern how the assistant answers."
        mock
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover">
              <Save className="size-4" />
              Save changes
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="size-5 text-ink-500" /> Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  model.active
                    ? 'border-teal-600 bg-teal-50/50'
                    : 'border-border hover:border-line-soft'
                }`}
              >
                <span>
                  <span className="block font-medium text-ink-700">{model.name}</span>
                  <span className="block text-sm text-ink-500">{model.desc}</span>
                </span>
                {model.active && (
                  <Badge variant="secondary" className="bg-teal-50 text-teal-800">
                    Selected
                  </Badge>
                )}
              </button>
            ))}
            <div className="space-y-2 pt-2">
              <Label htmlFor="temperature">
                Temperature · {CONFIG_DEFAULTS.temperature}
              </Label>
              <Input id="temperature" type="number" step="0.1" min="0" max="1" defaultValue={CONFIG_DEFAULTS.temperature} />
              <p className="text-sm text-ink-500">
                Lower values keep answers focused and deterministic.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-ink-500" /> Retrieval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topk">Top-K passages</Label>
                <Input id="topk" type="number" defaultValue={CONFIG_DEFAULTS.topK} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Similarity threshold</Label>
                <Input id="threshold" type="number" step="0.05" defaultValue={CONFIG_DEFAULTS.similarityThreshold} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxsteps">Max agent steps</Label>
              <Input id="maxsteps" type="number" defaultValue={CONFIG_DEFAULTS.maxSteps} />
            </div>
            <div className="space-y-2">
              <Label>Embedding model</Label>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-ink-600">
                {CONFIG_DEFAULTS.embeddingModel} · 1536 dims
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              defaultValue={CONFIG_DEFAULTS.systemPrompt}
              aria-label="System prompt"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {GUARDRAILS.map((rail) => (
              <div key={rail.title} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-ink-700">{rail.title}</p>
                  <p className="text-sm text-ink-500">{rail.desc}</p>
                </div>
                <Switch defaultChecked={rail.on} aria-label={rail.title} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
