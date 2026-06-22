import { PageContainer } from '@/components/shell/page'
import { SectionTabs } from '@/components/shell/section-tabs'

export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageContainer>
      <SectionTabs sectionHref="/administration" />
      {children}
    </PageContainer>
  )
}
