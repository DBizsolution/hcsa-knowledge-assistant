import { PageContainer } from '@/components/shell/page'
import { SectionTabs } from '@/components/shell/section-tabs'

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageContainer>
      <SectionTabs sectionHref="/knowledge" />
      {children}
    </PageContainer>
  )
}
