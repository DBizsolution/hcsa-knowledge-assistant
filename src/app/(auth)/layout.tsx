import { SiteFooter } from '@/components/shell/site-footer'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
