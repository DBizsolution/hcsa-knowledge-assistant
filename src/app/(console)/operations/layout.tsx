import { PageContainer } from '@/components/shell/page'
import { SectionTabs } from '@/components/shell/section-tabs'

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageContainer>
      <SectionTabs sectionHref="/operations" />
      {children}
    </PageContainer>
  )
}
