import type { Metadata } from 'next'
import { MessageSquare, Quote, Database, ShieldCheck, FlaskConical } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = { title: 'User guide' }

const QUICK_START = [
  { icon: MessageSquare, title: 'Ask a question', body: 'Type a natural-language question in the chat. The assistant searches every source automatically.' },
  { icon: Quote, title: 'Check the citations', body: 'Each answer cites its sources. Click a [number] to jump to the exact passage it came from.' },
  { icon: Database, title: 'Add knowledge', body: 'Upload new documents and they are parsed, embedded and indexed within minutes.' },
]

const FAQ = [
  {
    q: 'Where do the answers come from?',
    a: 'Every answer is generated only from documents in the HCSA knowledge base — policies, SOPs, email correspondence and financial reports. The assistant never uses outside information.',
  },
  {
    q: 'What if the answer is not in the knowledge base?',
    a: 'The assistant will tell you the information is not available rather than guessing. This keeps responses trustworthy and auditable.',
  },
  {
    q: 'How are citations generated?',
    a: 'For each question the assistant retrieves the most relevant passages, ranks them by similarity, and references them inline using numbered citations that link to the source passage.',
  },
  {
    q: 'How is response quality measured?',
    a: 'The evaluation page runs a benchmark query set and scores accuracy, recall, precision, completeness and faithfulness against expected answers, in line with the tender’s Annex A metrics.',
  },
  {
    q: 'Who can change the model or guardrails?',
    a: 'Only administrators can edit the chatbot configuration. Knowledge officers can manage sources; analysts and viewers have read and chat access.',
  },
]

export default function GuidePage() {
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="User guide" description="How to get the most out of the HCSA Knowledge Assistant." mock />

      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_START.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <item.icon className="size-5" />
              </span>
              <p className="mt-3 font-bold text-ink-700">{item.title}</p>
              <p className="mt-1 text-sm text-ink-500">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2">
        <ShieldCheck className="size-5 text-teal-600" />
        <h3 className="text-lg font-bold text-ink-700">Frequently asked</h3>
      </div>
      <Card className="mt-3">
        <CardContent className="py-2">
          <Accordion>
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-base font-medium text-ink-700">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-ink-600">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-teal-50/40 p-4">
        <FlaskConical className="size-5 shrink-0 text-teal-600" />
        <p className="text-sm text-ink-600">
          This is a tender prototype. Only <span className="font-medium">Login</span> and{' '}
          <span className="font-medium">Chat</span> are functional; other pages
          demonstrate the proposed UI/UX.
        </p>
      </div>
    </PageContainer>
  )
}
